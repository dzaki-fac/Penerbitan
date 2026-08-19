<?php

test('inisial nama dua kata berupa dua huruf', function () {
    expect(initialsOf('Budi Santoso'))->toBe('BS');
});

test('inisial nama tiga kata berupa tiga huruf', function () {
    expect(initialsOf('Nadia Azura Nurhaniya'))->toBe('NAN');
});

test('inisial nama satu kata berupa satu huruf', function () {
    expect(initialsOf('Budiono'))->toBe('B');
});

test('inisial tahan terhadap spasi berlebih', function () {
    expect(initialsOf('  Budi   Santoso  '))->toBe('BS');
});

test('inisial tetap akurat untuk nama non-ASCII', function () {
    expect(initialsOf('Érika'))->toBe('É');
});
