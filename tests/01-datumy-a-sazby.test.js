// Datum/čas helpery a výpočet sazby (individuální sazba brigádníka vs.
// výchozí sazba stanoviště/provozovny).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

test('calcHodiny - běžná směna', () => {
  const ctx = freshContext();
  assert.equal(ctx.calcHodiny('10:00', '18:00'), 8);
  assert.equal(ctx.calcHodiny('10:00', '18:30'), 8.5);
});

test('calcHodiny - směna přes půlnoc', () => {
  const ctx = freshContext();
  assert.equal(ctx.calcHodiny('22:00', '02:00'), 4);
  assert.equal(ctx.calcHodiny('20:00', '00:30'), 4.5);
});

test('calcHodiny - chybí příchod nebo odchod vrátí 0', () => {
  const ctx = freshContext();
  assert.equal(ctx.calcHodiny(null, '18:00'), 0);
  assert.equal(ctx.calcHodiny('10:00', null), 0);
  assert.equal(ctx.calcHodiny('', ''), 0);
});

test('roundH - zaokrouhlí na 1 desetinné místo a opraví floating point chyby', () => {
  const ctx = freshContext();
  assert.equal(ctx.roundH(0.1 + 0.2), 0.3);
  assert.equal(ctx.roundH(61.90000000000006), 61.9);
  assert.equal(ctx.roundH(8), 8);
});

test('getMonthDays - vrátí všechny dny v měsíci ve formátu YYYY-MM-DD', () => {
  const ctx = freshContext();
  const dny = ctx.getMonthDays(2026, 2); // únor 2026 (není přestupný rok)
  assert.equal(dny.length, 28);
  assert.equal(dny[0], '2026-02-01');
  assert.equal(dny[27], '2026-02-28');
});

test('getMonthDays - červenec má 31 dní', () => {
  const ctx = freshContext();
  assert.equal(ctx.getMonthDays(2026, 7).length, 31);
});

test('getMonthDaysAny - "all" spojí dny za celou sezónu (ROZPIS_MESICE)', () => {
  const ctx = freshContext();
  const vsechny = ctx.getMonthDaysAny(2026, 'all');
  const sezonniMesice = ctx.getSeasonMonths();
  let expected = 0;
  sezonniMesice.forEach((m) => { expected += ctx.getMonthDays(2026, m).length; });
  assert.equal(vsechny.length, expected);
});

test('isWeekend - rozpozná sobotu/neděli', () => {
  const ctx = freshContext();
  // 2026-07-04 je sobota, 2026-07-06 je pondělí
  assert.equal(ctx.isWeekend('2026-07-04'), true);
  assert.equal(ctx.isWeekend('2026-07-05'), true);
  assert.equal(ctx.isWeekend('2026-07-06'), false);
});

test('formatDate - vrátí zkratku dne v týdnu a datum', () => {
  const ctx = freshContext();
  assert.equal(ctx.formatDate('2026-07-06'), 'Po 6.7.');
});

test('getSazba - individuální sazba brigádníka má přednost před sazbou stanoviště', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9001, jmeno: 'Test Worker', role: 'user', sazba: 250 });
  assert.equal(ctx.getSazba('vycep', 9001), 250);
});

test('getSazba - bez individuální sazby použije sazbu stanoviště', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9002, jmeno: 'Test Worker 2', role: 'user', sazba: null });
  // "restaurace" má v STANOVISTE nastavenou sazbu 200
  assert.equal(ctx.getSazba('restaurace', 9002), 200);
});

test('getSazba - bez workerId i bez známého stanoviště spadne na výchozí HODINOVA_SAZBA', () => {
  const ctx = freshContext();
  assert.equal(ctx.getSazba('neexistujici-stanoviste', null), ctx.HODINOVA_SAZBA);
});

test('getSazbaVenue - individuální sazba brigádníka má přednost před sazbou provozovny', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9003, jmeno: 'Test Venue Worker', role: 'user', sazba: 300 });
  ctx.VENUES.push({ id: 501, nazev: 'Test Venue', sazba_hodinova: 180 });
  assert.equal(ctx.getSazbaVenue(9003, 501), 300);
});

test('getSazbaVenue - bez individuální sazby použije sazbu provozovny', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9004, jmeno: 'Test Venue Worker 2', role: 'user', sazba: null });
  ctx.VENUES.push({ id: 502, nazev: 'Test Venue 2', sazba_hodinova: 210 });
  assert.equal(ctx.getSazbaVenue(9004, 502), 210);
});

test('getSazbaVenue - bez sazby provozovny spadne na 180', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9005, jmeno: 'Test Venue Worker 3', role: 'user', sazba: null });
  ctx.VENUES.push({ id: 503, nazev: 'Test Venue 3', sazba_hodinova: null });
  assert.equal(ctx.getSazbaVenue(9005, 503), 180);
});
