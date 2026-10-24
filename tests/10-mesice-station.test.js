// Měsíční přehled hodin/mzdy/výplat (getMesicniPrehled, getMesicniSouhrn) a
// Station jako místo v rozpisu Café (setSmenaMisto, skrytá provozovna).
// Datumy jsou z minulosti (2026-01), ať testy nezávisí na tom, kdy běží.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_ID = 801;
const WORKER_ID = 9301;
const WORKER2_ID = 9302;

function setup(ctx) {
  ctx.LOAD_OK.schedule = true; // saveSchedule() jinak odmítne ukládat (data se v testu nenačítala)
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Anna Měsíční', role: 'user', sazba: 200, venue_id: VENUE_ID, aktivni: true });
  ctx.WORKERS.push({ id: WORKER2_ID, jmeno: 'Boris Druhý', role: 'user', sazba: 100, venue_id: VENUE_ID, aktivni: true });
  ctx.VENUES.push({ id: VENUE_ID, slug: 'andel-cafe', nazev: 'Anděl Café', sazba_hodinova: 180 });
  // Leden: 2 dny × 8 h (1600 Kč/den), Únor: 1 den × 8 h
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-01-06', prichod: '10:00', odchod: '18:00' },
    { id: 3, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-02-02', prichod: '10:00', odchod: '18:00' },
  );
}

test('getMesicniPrehled - rozpad po měsících, nejnovější první, bez výplat = čeká', () => {
  const ctx = freshContext(); setup(ctx);
  const mp = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID);
  assert.deepEqual(Array.from(mp.mesice.map((m) => m.key)), ['2026-02', '2026-01']);
  const led = mp.mesice[1];
  assert.equal(led.hodiny, 16); assert.equal(led.hruby, 3200); assert.equal(led.stav, 'ceka');
  assert.equal(led.nevyplacenoHruby, 3200); assert.equal(led.dny.length, 2);
  assert.equal(mp.celkem.hodiny, 24); assert.equal(mp.celkem.hruby, 4800); assert.equal(mp.celkem.vyplaceno, 0);
});

test('getMesicniPrehled - vyplacený měsíc: stav vyplaceno, částka a datum výplaty u měsíce', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-02-10', castka: 3000, poznamka: 'po penále', dny: ['2026-01-05', '2026-01-06'] });
  const mp = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID);
  const led = mp.mesice.find((m) => m.key === '2026-01'), uno = mp.mesice.find((m) => m.key === '2026-02');
  assert.equal(led.stav, 'vyplaceno'); assert.equal(led.vyplaceno, 3000); assert.equal(led.nevyplacenoHruby, 0);
  assert.equal(led.vyplaty[0].datum, '2026-02-10'); assert.equal(led.dny.every((d) => d.vyplaceno), true);
  assert.equal(uno.stav, 'ceka'); assert.equal(uno.vyplaceno, 0);
  assert.equal(mp.celkem.vyplaceno, 3000); assert.equal(mp.celkem.nevyplacenoHruby, 1600);
});

test('getMesicniPrehled - částečně vyplacený měsíc', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-01-31', castka: 1600, poznamka: '', dny: ['2026-01-05'] });
  const led = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID).mesice.find((m) => m.key === '2026-01');
  assert.equal(led.stav, 'castecne'); assert.equal(led.nevyplacenoHruby, 1600); assert.equal(led.vyplacenoHodiny, 8);
});

test('getMesicniPrehled - výplata přes dva měsíce se rozdělí podle hrubé mzdy dnů', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-02-20', castka: 3000, poznamka: '', dny: ['2026-01-05', '2026-02-02'] });
  const mp = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID);
  assert.equal(mp.mesice.find((m) => m.key === '2026-01').vyplaceno, 1500);
  assert.equal(mp.mesice.find((m) => m.key === '2026-02').vyplaceno, 1500);
  assert.equal(mp.mesice.find((m) => m.key === '2026-02').vyplaty[0].rozdeleno, true);
  assert.equal(mp.celkem.vyplaceno, 3000, 'součet přes měsíce = skutečně vyplaceno');
});

test('getMesicniPrehled - stará výplata bez dnů (záloha) patří do měsíce svého data; celkem sedí s getVyplacenoVenue', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-03-03', castka: 500, poznamka: 'záloha', dny: [] });
  const mp = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID);
  const bre = mp.mesice.find((m) => m.key === '2026-03');
  assert.ok(bre); assert.equal(bre.vyplaceno, 500);
  assert.equal(mp.celkem.vyplaceno, ctx.getVyplacenoVenue(VENUE_ID, WORKER_ID));
});

test('getMesicniPrehled - penalizace se počítá do měsíce svého data; cizí provozovna se ignoruje', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.PENALIZACE.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-01-06', castka: 100, duvod: 'x' });
  ctx.PENALIZACE.push({ id: 2, workerId: WORKER_ID, venue_id: 999, datum: '2026-01-06', castka: 777, duvod: 'jinde' });
  ctx.PRACOVNI_DNY.push({ id: 9, workerId: WORKER_ID, venue_id: 999, datum: '2026-01-07', prichod: '10:00', odchod: '18:00' });
  const led = ctx.getMesicniPrehled(WORKER_ID, VENUE_ID).mesice.find((m) => m.key === '2026-01');
  assert.equal(led.penalizace, 100); assert.equal(led.dny.length, 2);
});

test('getMesicniSouhrn - součet přes brigádníky po měsících', () => {
  const ctx = freshContext(); setup(ctx);
  ctx.PRACOVNI_DNY.push({ id: 10, workerId: WORKER2_ID, venue_id: VENUE_ID, datum: '2026-01-05', prichod: '10:00', odchod: '14:00' });
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-02-10', castka: 3200, poznamka: '', dny: ['2026-01-05', '2026-01-06'] });
  const s = ctx.getMesicniSouhrn([WORKER_ID, WORKER2_ID], VENUE_ID);
  const led = s.radky.find((r) => r.key === '2026-01');
  assert.equal(led.brigadniku, 2); assert.equal(led.hodiny, 20); assert.equal(led.hruby, 3200 + 400);
  assert.equal(led.vyplaceno, 3200); assert.equal(led.nevyplacenoHruby, 400);
  assert.equal(s.celkem.vyplaceno, 3200);
});

test('getMesicniPrehled - Kosatka (legacy, venueId null) počítá podle stanoviště a výplat bez venue_id', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9303, jmeno: 'Karel Kosatka', role: 'user', misto: 'vycep', sazba: null });
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: 9303, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' });
  ctx.VYPLATY.push({ id: 1, workerId: 9303, datum: '2026-01-31', castka: 1440, poznamka: '', dny: ['2026-01-05'], venue_id: null });
  const mp = ctx.getMesicniPrehled(9303, null);
  assert.equal(mp.mesice[0].hruby, 8 * 180); assert.equal(mp.mesice[0].stav, 'vyplaceno'); assert.equal(mp.mesice[0].vyplaceno, 1440);
});

// ── Station jako místo v rozpisu Café ──
test('Anděl Station se nenačítá jako samostatná provozovna (VENUE_SKRYTE_SLUGY)', () => {
  const ctx = freshContext();
  assert.ok(ctx.VENUE_SKRYTE_SLUGY.indexOf('andel-station') !== -1);
});

test('getSmenaMistaForVenue - Café má Station, ostatní provozovny ne', () => {
  const ctx = freshContext();
  assert.equal(ctx.getSmenaMistaForVenue({ slug: 'andel-cafe' }).length, 2);
  assert.equal(ctx.getSmenaMistaForVenue({ slug: 'republika-klub' }), null);
  assert.equal(ctx.getSmenaMistoInfo({ slug: 'andel-cafe' }, 'station').label, 'Station');
  assert.equal(ctx.getSmenaMistoInfo({ slug: 'andel-cafe' }, 'hlavni'), null);
});

test('setSmenaMisto - na Station je jen jeden člověk za den, předchozí se vrátí do Café', async () => {
  const ctx = freshContext(); setup(ctx);
  const a = (await ctx.addShiftVenue(VENUE_ID, WORKER_ID, 'hlavni', '2026-01-10', '')).row;
  const b = (await ctx.addShiftVenue(VENUE_ID, WORKER2_ID, 'hlavni', '2026-01-10', '')).row;
  let r = await ctx.setSmenaMisto(a.id, 'station');
  assert.equal(r.ok, true); assert.equal(r.nahrazeno, null);
  assert.equal(ctx.getStationSmena(VENUE_ID, '2026-01-10').workerId, WORKER_ID);
  r = await ctx.setSmenaMisto(b.id, 'station');
  assert.equal(r.nahrazeno.id, a.id);
  assert.equal(a.mistoId, 'hlavni'); assert.equal(b.mistoId, 'station');
  assert.equal(ctx.getStationSmena(VENUE_ID, '2026-01-10').workerId, WORKER2_ID);
  await ctx.setSmenaMisto(b.id, 'hlavni');
  assert.equal(ctx.getStationSmena(VENUE_ID, '2026-01-10'), null);
});

test('setSmenaMisto - jiný den a jiná provozovna Station neovlivní; při chybě uložení se vrátí původní stav', async () => {
  const ctx = freshContext(); setup(ctx);
  const a = (await ctx.addShiftVenue(VENUE_ID, WORKER_ID, 'hlavni', '2026-01-10', '')).row;
  const b = (await ctx.addShiftVenue(VENUE_ID, WORKER2_ID, 'hlavni', '2026-01-11', '')).row;
  await ctx.setSmenaMisto(a.id, 'station'); await ctx.setSmenaMisto(b.id, 'station');
  assert.equal(a.mistoId, 'station'); assert.equal(b.mistoId, 'station', 'jiný den = jiný člověk na Station');
  ctx.saveSchedule = async () => ({ ok: false, error: 'výpadek' });
  const r = await ctx.setSmenaMisto(a.id, 'hlavni');
  assert.equal(r.ok, false); assert.equal(a.mistoId, 'station');
});

test('addShiftVenue - stejný brigádník ve stejný den se nepřidá dvakrát (ani na jiné místo)', async () => {
  const ctx = freshContext(); setup(ctx);
  const a = (await ctx.addShiftVenue(VENUE_ID, WORKER_ID, 'hlavni', '2026-01-10', '')).row;
  await ctx.setSmenaMisto(a.id, 'station');
  await ctx.addShiftVenue(VENUE_ID, WORKER_ID, 'hlavni', '2026-01-10', '');
  assert.equal(ctx.SCHEDULE.filter((s) => s.workerId === WORKER_ID && s.datum === '2026-01-10').length, 1);
});
