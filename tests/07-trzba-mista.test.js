// Místa pro zápis tržby (getTrzbaMistaForVenue) - většina provozoven má jen
// jedno obecné místo "hlavni", Anděl Music Club má navíc vstupy a šatnu.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

test('getTrzbaMistaForVenue - běžná provozovna má jen jedno místo "hlavni"', () => {
  const ctx = freshContext();
  const venue = { id: 1001, slug: 'andel-cafe' };
  const mista = ctx.getTrzbaMistaForVenue(venue);
  assert.equal(mista.length, 1);
  assert.equal(mista[0].mistoId, 'hlavni');
});

test('getTrzbaMistaForVenue - bez provozovny (null) spadne na jedno obecné místo', () => {
  const ctx = freshContext();
  const mista = ctx.getTrzbaMistaForVenue(null);
  assert.equal(mista.length, 1);
  assert.equal(mista[0].mistoId, 'hlavni');
});

test('getTrzbaMistaForVenue - Anděl Music Club má bar, vstupy a šatnu', () => {
  const ctx = freshContext();
  const venue = { id: 1002, slug: 'andel-music-club' };
  const mista = ctx.getTrzbaMistaForVenue(venue);
  const ids = mista.map((m) => m.mistoId);
  assert.deepEqual(Array.from(ids), ['hlavni', 'vstup', 'satna']);
});

test('tržba zapsaná na vstupech i v šatně se započítává do měsíčního zisku provozovny', async () => {
  const ctx = freshContext();
  const VENUE_ID = 1003;
  ctx.VENUES.push({ id: VENUE_ID, slug: 'andel-music-club', nazev: 'Test Club', sazba_hodinova: 180 });
  ctx.LOAD_OK.trzby = true;

  await ctx.submitTrzbaVenue(VENUE_ID, 'hlavni', '2026-05-10', 1000, 1, '', 1000, null);
  await ctx.submitTrzbaVenue(VENUE_ID, 'vstup', '2026-05-10', 500, 1, '', 500, null);
  await ctx.submitTrzbaVenue(VENUE_ID, 'satna', '2026-05-10', 200, 1, '', 200, null);

  const zisk = ctx.getZiskVenueMonth(VENUE_ID, 2026, 5);
  assert.equal(zisk.trzby, 1700, 'tržby ze všech tří míst (bar+vstupy+šatna) se sečtou dohromady');

  // každé místo se zároveň propíše do pokladny jako SAMOSTATNÝ příjem (jiný
  // marker podle mistoId), ne jako jeden kolidující zápis
  const hotovostZustatek = ctx.getPokladnaZustatek(VENUE_ID, 'hotovost');
  assert.equal(hotovostZustatek, 1700);
  const pokladniZapisy = ctx.POKLADNA.filter((p) => p.venue_id === VENUE_ID);
  assert.equal(pokladniZapisy.length, 3, 'tři oddělené pokladní zápisy, jeden za každé místo');
});
