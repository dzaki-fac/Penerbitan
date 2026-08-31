<?php

use function normalizeFakultasSekolah;

test('maps a known faculty to its canonical value (case-insensitive)', function () {
    expect(normalizeFakultasSekolah('  fakultas   teknik  '))
        ->toBe('Fakultas Teknik');
    expect(normalizeFakultasSekolah('FAKULTAS TEKNIK'))
        ->toBe('Fakultas Teknik');
});

test('keeps lowercase "dan" so it matches existing data instead of creating a new group', function () {
    expect(normalizeFakultasSekolah('Fakultas Sains Dan Matematika'))
        ->toBe('Fakultas Sains dan Matematika');
    expect(normalizeFakultasSekolah('fakultas sains dan matematika'))
        ->toBe('Fakultas Sains dan Matematika');
});

test('strips a trailing abbreviation in parentheses', function () {
    expect(normalizeFakultasSekolah('Fakultas Sains Dan Matematika (Fsm)'))
        ->toBe('Fakultas Sains dan Matematika');
    expect(normalizeFakultasSekolah('Fakultas Kedokteran (Fk)'))
        ->toBe('Fakultas Kedokteran');
});

test('the unfilled sentinel maps to null instead of a literal faculty', function () {
    expect(normalizeFakultasSekolah('Belum terisi'))->toBeNull();
    expect(normalizeFakultasSekolah('BELUM TERISI'))->toBeNull();
    expect(normalizeFakultasSekolah('belum   terisi'))->toBeNull();
});

test('empty values normalize to null', function () {
    expect(normalizeFakultasSekolah(null))->toBeNull();
    expect(normalizeFakultasSekolah('   '))->toBeNull();
    expect(normalizeFakultasSekolah(''))->toBeNull();
});

test('unknown custom faculties are kept as typed', function () {
    expect(normalizeFakultasSekolah('Fakultas XYZ'))->toBe('Fakultas XYZ');
});
