// Pokladní kniha (hotovostní/online příjmy a výdaje na provozovně).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_ID = 801;

test('addPokladnaZapis - přidá zápis a částka se vždy uloží jako kladné číslo', async () => {
  const ctx = freshContext();
  const res = await ctx.addPokladnaZapis(VENUE_ID, 'vydaj', -500, 'Test výdaj', null, 'hotovost');
  assert.equal(res.ok, true);
  assert.equal(res.row.castka, 500, 'castka se uloží jako abs()');
  assert.equal(ctx.POKLADNA.length, 1);
});

test('getPokladnaZustatek - příjmy plusem, výdaje minusem', () => {
  const ctx = freshContext();
  ctx.POKLADNA.push(
    { id: 1, venue_id: VENUE_ID, datum: '2026-05-01', typ: 'prijem', castka: 1000, ucet: 'hotovost' },
    { id: 2, venue_id: VENUE_ID, datum: '2026-05-02', typ: 'vydaj', castka: 300, ucet: 'hotovost' },
  );
  assert.equal(ctx.getPokladnaZustatek(VENUE_ID, 'hotovost'), 700);
});

test('getPokladnaZustatek - rozlišuje účty (hotovost vs. online)', () => {
  const ctx = freshContext();
  ctx.POKLADNA.push(
    { id: 1, venue_id: VENUE_ID, datum: '2026-05-01', typ: 'prijem', castka: 1000, ucet: 'hotovost' },
    { id: 2, venue_id: VENUE_ID, datum: '2026-05-01', typ: 'prijem', castka: 500, ucet: 'online' },
  );
  assert.equal(ctx.getPokladnaZustatek(VENUE_ID, 'hotovost'), 1000);
  assert.equal(ctx.getPokladnaZustatek(VENUE_ID, 'online'), 500);
});

test('getPokladnaZustatekCelkem - sečte zůstatek přes víc provozoven', () => {
  const ctx = freshContext();
  ctx.POKLADNA.push(
    { id: 1, venue_id: 801, datum: '2026-05-01', typ: 'prijem', castka: 1000, ucet: 'hotovost' },
    { id: 2, venue_id: 802, datum: '2026-05-01', typ: 'prijem', castka: 500, ucet: 'hotovost' },
    { id: 3, venue_id: 803, datum: '2026-05-01', typ: 'prijem', castka: 9999, ucet: 'hotovost' }, // nepatří do výběru
  );
  assert.equal(ctx.getPokladnaZustatekCelkem([801, 802], 'hotovost'), 1500);
});

test('getPokladnaForVenueMonth - filtruje podle konkrétního měsíce', () => {
  const ctx = freshContext();
  ctx.POKLADNA.push(
    { id: 1, venue_id: VENUE_ID, datum: '2026-05-15', typ: 'prijem', castka: 100, ucet: 'hotovost' },
    { id: 2, venue_id: VENUE_ID, datum: '2026-06-15', typ: 'prijem', castka: 200, ucet: 'hotovost' },
  );
  const kveten = ctx.getPokladnaForVenueMonth(VENUE_ID, 'hotovost', 2026, 5);
  assert.equal(kveten.length, 1);
  assert.equal(kveten[0].castka, 100);
});

test('getPokladnaForVenueMonth - "all" vrátí celý rok', () => {
  const ctx = freshContext();
  ctx.POKLADNA.push(
    { id: 1, venue_id: VENUE_ID, datum: '2026-05-15', typ: 'prijem', castka: 100, ucet: 'hotovost' },
    { id: 2, venue_id: VENUE_ID, datum: '2026-06-15', typ: 'prijem', castka: 200, ucet: 'hotovost' },
    { id: 3, venue_id: VENUE_ID, datum: '2025-06-15', typ: 'prijem', castka: 999, ucet: 'hotovost' }, // jiný rok
  );
  const rok = ctx.getPokladnaForVenueMonth(VENUE_ID, 'hotovost', 2026, 'all');
  assert.equal(rok.length, 2);
});

test('výplata i záloha se propisují do pokladny jako výdaj se sledovatelným markerem (end-to-end)', async () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9401, jmeno: 'Dana Testová', role: 'user', venue_id: VENUE_ID, aktivni: true });
  ctx.VENUES.push({ id: VENUE_ID, nazev: 'Test', sazba_hodinova: 180 });

  const vyplata = await ctx.addVyplataVenue(VENUE_ID, 9401, 1000, '', [], 1);
  const zaloha = await ctx.addZalohaVenue(VENUE_ID, 9401, 200, '', 1);

  const zustatek = ctx.getPokladnaZustatek(VENUE_ID, 'hotovost');
  assert.equal(zustatek, -1200, 'obě položky odešly z hotovostní pokladny jako výdaj');
  assert.ok(ctx.POKLADNA.some((p) => (p.popis || '').includes('výplata #' + vyplata.row.id)));
  assert.ok(ctx.POKLADNA.some((p) => (p.popis || '').includes('záloha #' + zaloha.row.id)));
});
