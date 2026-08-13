export type NoteSegment =
    | { type: 'text'; text: string }
    | { type: 'link'; url: string; label: string };

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;

/**
 * Hanya skema http/https yang dianggap aman untuk link.
 * Skema lain (javascript:, data:, dll.) dikembalikan sebagai teks biasa.
 */
export function isSafeHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
}

/**
 * Memecah teks catatan menjadi segmen teks biasa dan URL.
 * Digunakan untuk merender URL sebagai link yang dapat diklik tanpa
 * dangerouslySetInnerHTML, sehingga aman dari XSS.
 */
export function parseNoteSegments(text: string): NoteSegment[] {
    const segments: NoteSegment[] = [];

    for (const part of text.split(URL_PATTERN)) {
        if (!part) {
            continue;
        }

        if (isSafeHttpUrl(part)) {
            segments.push({ type: 'link', url: part, label: part });
        } else {
            segments.push({ type: 'text', text: part });
        }
    }

    return segments;
}
