/**
 * Webhook impor data Google Form -> Sistem Penerbitan (Laravel).
 *
 * Cara pakai:
 * 1. Buka Google Form -> menu Responses (Tanggapan) -> ikon Sheets
 *    (buka spreadsheet respons).
 * 2. Di spreadsheet respons: Extensions (Ekstensi) -> Apps Script.
 * 3. Hapus isi default Code.gs, tempel seluruh file ini.
 * 4. Sesuaikan CONFIG (WEBHOOK_URL, TOKEN, FORM_NAME, dan nama kolom
 *    di COLUMNS sesuai header baris pertama di Sheets).
 * 5. Simpan, lalu atur trigger: tombol jam (Triggers) -> Add Trigger
 *    (Tambah pemicu):
 *      - Choose which function: onFormSubmit
 *      - Choose which deployment: Head
 *      - Event source: From spreadsheet (Dari spreadsheet)
 *      - Event type: On form submit (Saat formulir dikirim)
 * 6. Jalankan testWebhook() sekali untuk memastikan koneksi berhasil,
 *    dan izinkan otorisasi saat diminta.
 * 7. Untuk mengimpor respons yang sudah masuk SEBELUM trigger aktif,
 *    jalankan syncAllRows() (lihat keterangan fungsinya).
 */

const CONFIG = {
  // URL tunnel saat ini — BERUBAH setiap cloudflared dimulai ulang!
  WEBHOOK_URL: 'https://snap-bikini-tent-marina.trycloudflare.com/api/form-submissions',

  // Salin dari .env -> FORM_SUBMISSION_TOKEN
  TOKEN: 'ac7918dda0fb2fb07b56d650ad34574d99d961f9138e7dd6',

  // Nama form yang akan tercatat di kolom sumber_form naskah
  FORM_NAME: 'Form Pengajuan Naskah',

  /**
   * Pemetaan header kolom di Sheets (baris pertama) -> field yang
   * dimengerti Laravel. Setiap field bisa punya beberapa kemungkinan
   * nama kolom; dicocokkan sebagian (case-insensitive, berisi).
   *
   * Catatan:
   * - "Email" di form muncul dua kali; yang pertama = email penulis,
   *   yang kedua = email narahubung (ditangani otomatis di onFormSubmit).
   * - "NIP/NIM" -> nomor_identitas; jenis identitas (NIP/NIM) dideteksi
   *   dari kolom Status (Dosen/Mahasiswa) atau panjang angka (>= 12 = NIP).
   * - Kolom upload berisi link Google Drive; diambil URL pertamanya saja.
   */
  COLUMNS: {
    judul: ['Judul buku'],
    nama: ['Nama lengkap beserta gelar', 'Nama lengkap'],
    nomor_identitas: ['NIP/NIM'],
    link_cover: ['Cover buku (bagi penulis yang memiliki cover sendiri)'],
    tanggal_pengajuan: ['Timestamp'],

    status: ['Status'],
    fakultas_sekolah: ['Fakultas / Sekolah', 'Fakultas'],
    nomor_npwp: ['Nomor NPWP'],
    nomor_whatsapp: ['Nomor Whatsapp'],
    penulis_tambahan: ['Nama penulis tambahan', 'Penulis tambahan'],

    kebijakan_akses: ['Kebijakan Akses Buku Anda', 'Kebijakan Akses'],
    biaya: ['Biaya'],
    nama_narahubung: ['Nama narahubung/contact person', 'Nama narahubung'],
    nomor_whatsapp_narahubung: [
      'Nomor whatsapp narahubung/contact person',
      'Nomor whatsapp narahubung',
    ],
    link_dummy_upload: ['Unggah dokumen dummy buku'],
    link_dummy_pdf: ['Dummy Buku (Pdf)'],
    link_dummy_word: ['Dummy Buku (Word)'],
    link_surat_keaslian: ['Surat Pernyataan Keaslian Naskah', 'Surat Pernyataan Keaslian'],
    link_surat_penerbitan: ['Surat Pernyataan Penerbitan Buku', 'Surat Pernyataan Penerbitan'],
  },
};

const LINK_FIELDS = [
  'link_cover',
  'link_dummy_upload',
  'link_dummy_pdf',
  'link_dummy_word',
  'link_surat_keaslian',
  'link_surat_penerbitan',
];

/**
 * Dipanggil otomatis setiap ada pengiriman form baru.
 */
function onFormSubmit(e) {
  var sheet = e.range.getSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = e.range.getValues()[0];

  sendPayload(buildPayload(headers, values));
}

/**
 * Bangun payload untuk satu baris respons dari Sheets.
 */
function buildPayload(headers, values) {
  var payload = { form: CONFIG.FORM_NAME };

  Object.keys(CONFIG.COLUMNS).forEach(function (key) {
    var idx = findColumn(headers, CONFIG.COLUMNS[key]);
    if (idx < 0) return;

    var value = values[idx];
    if (key === 'tanggal_pengajuan' && value) {
      payload[key] = formatTimestamp(value);
    } else if (value instanceof Date) {
      payload[key] = formatDate(value);
    } else if (typeof value === 'string' && value.trim() !== '') {
      payload[key] = value.trim();
    } else if (value !== '' && value !== null && value !== undefined) {
      payload[key] = String(value).trim();
    }
  });

  // Kolom "Email" muncul dua kali: pertama penulis, kedua narahubung.
  var emailIdx = allColumnIndexes(headers, 'Email');
  if (emailIdx.length > 0) payload.email = readValue(values, emailIdx[0]);
  if (emailIdx.length > 1) payload.email_narahubung = readValue(values, emailIdx[1]);

  // Deteksi jenis identitas dari Status (Dosen/Mahasiswa) atau panjang angka.
  payload.jenis_identitas = detectJenis(payload.status, payload.nomor_identitas);

  // Ambil URL pertama dari kolom upload.
  LINK_FIELDS.forEach(function (field) {
    if (payload[field]) {
      payload[field] = firstUrl(payload[field]);
    }
  });

  // Tanggal tidak tersedia di kolom -> Laravel otomatis memakai hari ini
  if (!payload.tanggal_pengajuan) {
    delete payload.tanggal_pengajuan;
  }

  return payload;
}

/**
 * Mengirim payload ke endpoint Laravel. Mengembalikan kode HTTP (0 jika
 * gagal koneksi). Log tercatat di View -> Logs (Execution log).
 */
function sendPayload(payload) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CONFIG.TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    var response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    var code = response.getResponseCode();
    Logger.log('HTTP ' + code + ' -> ' + response.getContentText());
    return code;
  } catch (err) {
    Logger.log('GAGAL mengirim payload: ' + err);
    return 0;
  }
}

var SYNC_CURSOR_KEY = 'SYNC_LAST_SENT_ROW';

/**
 * Kirim ulang SEMUA respons lama (yang dikirim sebelum trigger aktif)
 * ke Laravel. Jalankan manual dari editor Apps Script.
 *
 * Cara kerja:
 * - Membaca baris demi baris dari sheet respons (baris 2 dst) lalu
 *   mengirimnya seperti onFormSubmit.
 * - Posisi terakhir disimpan di properti script, jadi bila eksekusi
 *   berhenti (limit waktu 6 menit) bisa dijalankan lagi dan lanjut.
 * - Aman dijalankan ulang: Laravel menolak duplikat (author + judul
 *   sama -> status "exists").
 * - Baris yang ditolak Laravel (422) tetap dilewati & dicatat di log.
 *
 * Opsional: syncAllRows('Nama Sheet') bila sheet respons bukan yang
 * pertama.
 */
function syncAllRows(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('Tidak ada spreadsheet aktif.');
  }

  var sheet = sheetName
    ? spreadsheet.getSheetByName(sheetName)
    : spreadsheet.getSheets()[0];
  if (!sheet) {
    throw new Error('Sheet tidak ditemukan: ' + sheetName);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('Tidak ada baris data untuk disinkronkan.');
    return;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var props = PropertiesService.getScriptProperties();
  var cursor = parseInt(props.getProperty(SYNC_CURSOR_KEY) || '1', 10);

  if (cursor >= lastRow) {
    Logger.log(
      'Tidak ada baris baru untuk disinkronkan (semua s.d. baris ' + lastRow +
      ' sudah pernah dikirim). Jalankan resetSyncCursor() lalu syncAllRows() ' +
      'bila ingin memproses ulang, misalnya setelah migrate:fresh.'
    );
    return;
  }

  var sent = 0;
  var failed = 0;

  for (var r = cursor + 1; r <= lastRow; r++) {
    var values = sheet.getRange(r, 1, 1, headers.length).getValues()[0];
    var payload = buildPayload(headers, values);
    var code = sendPayload(payload);

    if (code >= 200 && code < 300) {
      sent++;
    } else {
      failed++;
      Logger.log('Baris ' + r + ' ditolak (HTTP ' + code + '): ' + JSON.stringify(payload));
    }

    props.setProperty(SYNC_CURSOR_KEY, String(r));
    Utilities.sleep(200);
  }

  Logger.log(
    'Selesai. Terkirim: ' + sent + ', gagal/ditolak: ' + failed +
    ' (baris ' + (cursor + 1) + ' s.d. ' + lastRow + ').'
  );
}

/**
 * Ulangi sinkronisasi dari baris data pertama (baris 2) setelah
 * resetSyncCursor(). Dipakai untuk mencoba ulang baris yang gagal.
 */
function resetSyncCursor() {
  PropertiesService.getScriptProperties().deleteProperty(SYNC_CURSOR_KEY);
  Logger.log('Cursor sinkronisasi direset ke baris 2.');
}

/**
 * Tes koneksi dengan contoh data. Jalankan manual dari editor Apps Script.
 */
function testWebhook() {
  var sample = {
    form: CONFIG.FORM_NAME,
    judul: 'Judul Buku Contoh',
    nama: 'Nama Penulis Contoh',
    jenis_identitas: 'nim',
    nomor_identitas: '123456789',
    email: 'penulis@example.com',
    link_cover: 'https://drive.google.com/file/d/cover-contoh/view',
    status: 'Mahasiswa',
    fakultas_sekolah: 'Fakultas Teknik',
    nomor_whatsapp: '081234567890',
    kebijakan_akses: 'Terbuka',
    biaya: 'Gratis',
    nama_narahubung: 'Narahubung Contoh',
    email_narahubung: 'narahubung@example.com',
  };
  sendPayload(sample);
}

function formatDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

/**
 * Konversi nilai kolom Timestamp jadi YYYY-MM-DD HH:MM:SS.
 * Terima objek Date (dari getValues) atau string DD/MM/YYYY HH:MM:SS.
 */
function formatTimestamp(value) {
  if (value instanceof Date) return formatDateTime(value);

  var m = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (m) {
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6]));
    return formatDateTime(d);
  }

  return null;
}

/**
 * Format Date jadi YYYY-MM-DD HH:MM:SS.
 */
function formatDateTime(date) {
  return formatDate(date) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

function firstUrl(value) {
  var m = String(value).match(/https?:\/\/[^\s,;]+/);
  return m ? m[0] : null;
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

/**
 * Cari indeks kolom pertama yang mengandung salah satu nama target.
 */
function findColumn(headers, targets) {
  var found = allColumnIndexes(headers, targets);
  return found.length > 0 ? found[0] : -1;
}

/**
 * Kembalikan semua indeks kolom yang cocok (untuk header ganda).
 */
function allColumnIndexes(headers, targets) {
  var targetsList = Array.isArray(targets) ? targets : [targets];
  var found = [];

  for (var i = 0; i < headers.length; i++) {
    var header = normalize(headers[i]);
    if (!header) continue;

    for (var t = 0; t < targetsList.length; t++) {
      var target = normalize(targetsList[t]);
      if (!target) continue;
      if (header.indexOf(target) !== -1 || target.indexOf(header) !== -1) {
        found.push(i);
        break;
      }
    }
  }

  return found;
}

function readValue(values, idx) {
  var value = values[idx];
  if (value instanceof Date) return formatDate(value);
  if (typeof value === 'string') return value.trim() !== '' ? value.trim() : null;
  if (value !== '' && value !== null && value !== undefined) return String(value).trim();
  return null;
}

/**
 * Tentukan jenis identitas: NIP (dosen) atau NIM (mahasiswa).
 * Prioritas: kolom Status; fallback panjang angka NIP/NIM.
 */
function detectJenis(status, nomorIdentitas) {
  var s = normalize(status);

  if (s.indexOf('dosen') !== -1 || s.indexOf('nip') !== -1) return 'nip';
  if (s.indexOf('mahasiswa') !== -1 || s.indexOf('nim') !== -1 || s.indexOf('siswa') !== -1) return 'nim';

  var digits = String(nomorIdentitas || '').replace(/\D/g, '');
  return digits.length >= 12 ? 'nip' : 'nim';
}
