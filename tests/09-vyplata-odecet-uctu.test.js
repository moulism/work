// Volitelné odečtení účtů od výplaty (checkbox "Odečíst účty z výplaty").
// Výchozí chování (bez zaškrtnutí) se NEMĚNÍ - viz tests/02 - účty výplatou
// zůstávají otevřené. Se zaškrtnutím se odečtené položky označí jako zaplacené
// (soft-delete), takže je brigádník nevidí jako dluh, a pokladna dostane
// výdaj mzdy + příjem za zaplacené účty (čistý pohyb = mzda − účty).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_ID = 701;
const WORKER_ID = 9201;

function setup(ctx) {
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Bín Testový', role: 'user', sazba: 200, venue_id: VENUE_ID, aktivni: true });
  ctx.VENUES.push({ id: VENUE_ID, nazev: 'Testovací provozovna', sazba_hodinova: 180 });
  ctx.UCTY_POLOZKY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-09-02', popis: 'Pivo', castka: 300, smazano: false },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-09-10', popis: 'Panák', castka: 500, smazano: false },
  );
}

test('planUctyOdecetVenue - bere celé položky od nejstarší, co se vejdou do částky', () => {
  const ctx = freshContext(); setup(ctx);
  let plan = ctx.planUctyOdecetVenue(WORKER_ID, VENUE_ID, 5000);
  assert.equal(plan.soucet, 800); assert.equal(plan.celkem, 800); assert.equal(plan.polozky.length, 2);
  plan = ctx.planUctyOdecetVenue(WORKER_ID, VENUE_ID, 400);
  assert.equal(plan.soucet, 300, 'vejde se jen nejstarší položka'); assert.equal(plan.celkem, 800);
  plan = ctx.planUctyOdecetVenue(WORKER_ID, VENUE_ID, 100);
  assert.equal(plan.polozky.length, 0); assert.equal(plan.soucet, 0);
});

test('addVyplataVenue s odecistUcty - účty se označí jako zaplacené a zmizí z dluhu', async () => {
  const ctx = freshContext(); setup(ctx);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 800);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: true });
  assert.equal(res.ok, true);
  assert.equal(res.odecteno, 800);
  assert.equal(ctx.getUctyForWorkerVenue(WORKER_ID, VENUE_ID).length, 0, 'brigádník už nevidí otevřené účty');
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 0);
  assert.ok(ctx.UCTY_POLOZKY.every((p) => p.smazano === true && p.smazano_by === 1));
  assert.equal(ctx.VYPLATY[0].castka, 6200, 'vyplacená mzda zůstává celá (sedí "Zbývá")');
  assert.match(ctx.VYPLATY[0].poznamka, /odečteno za účty: 800 Kč/);
});

test('addVyplataVenue s odecistUcty - pokladna: výdaj mzdy + příjem za účty, čistý pohyb = mzda − účty', async () => {
  const ctx = freshContext(); setup(ctx);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: true });
  const zapisy = ctx.POKLADNA.filter((p) => (p.popis || '').indexOf('výplata #' + res.row.id) !== -1);
  assert.equal(zapisy.length, 2);
  const vydaj = zapisy.find((p) => p.typ === 'vydaj'), prijem = zapisy.find((p) => p.typ === 'prijem');
  assert.equal(vydaj.castka, 6200); assert.equal(prijem.castka, 800);
  assert.equal(ctx.getPokladnaZustatekCelkem([VENUE_ID]), -5400);
});

test('addVyplataVenue BEZ odecistUcty - chování beze změny (účty zůstanou otevřené)', async () => {
  const ctx = freshContext(); setup(ctx);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: false });
  assert.equal(res.odecteno, 0);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 800);
  assert.equal(ctx.POKLADNA.length, 1);
  assert.equal(ctx.VYPLATY[0].poznamka, '');
});

test('addVyplataVenue s odecistUcty a malou částkou - odečte jen co se vejde, zbytek zůstane dluhem', async () => {
  const ctx = freshContext(); setup(ctx);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 400, 'záloha na víkend', [], 1, { odecistUcty: true });
  assert.equal(res.odecteno, 300);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 500);
  assert.match(ctx.VYPLATY[0].poznamka, /^záloha na víkend · z toho odečteno za účty: 300 Kč$/);
});

test('addVyplataVenue s odecistUcty - při chybě uložení se účty vrátí zpátky jako otevřené', async () => {
  const ctx = freshContext(); setup(ctx);
  let volani = 0;
  const puvodni = ctx.dbUpsert;
  ctx.dbUpsert = async (tabulka, rows) => { volani++; return tabulka === 'ucty' ? puvodni(tabulka, rows) : { ok: false, error: 'výpadek' }; };
  ctx.saveVyplaty = async () => ({ ok: false, error: 'výpadek' });
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: true });
  assert.equal(res.ok, false);
  assert.equal(ctx.VYPLATY.length, 0);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 800, 'účty zůstaly otevřené');
  assert.equal(ctx.POKLADNA.length, 0);
});

test('addVyplataVenue s odecistUcty - když selže uložení účtů, výplata se nezapíše', async () => {
  const ctx = freshContext(); setup(ctx);
  ctx.dbUpsert = async () => ({ ok: false, error: 'výpadek' });
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: true });
  assert.equal(res.ok, false);
  assert.equal(ctx.VYPLATY.length, 0);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 800);
});

test('delVyplata - smazání výplaty s odečtenými účty je znovu otevře a smaže oba pokladní zápisy', async () => {
  const ctx = freshContext(); setup(ctx);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 6200, '', [], 1, { odecistUcty: true });
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 0);
  const d = await ctx.delVyplata(res.row.id);
  assert.equal(d.ok, true); assert.equal(d.obnovenoUctu, 2);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 800);
  assert.equal(ctx.POKLADNA.length, 0);
});

test('addVyplata (Kosatka, legacy) s odecistUcty - označí účty bez venue_id jako zaplacené', async () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Kosatka Testová', role: 'user', sazba: 200, aktivni: true });
  ctx.UCTY_POLOZKY.push({ id: 11, workerId: WORKER_ID, datum: '2026-07-01', popis: 'Pivo', castka: 250, smazano: false });
  const res = await ctx.addVyplata(WORKER_ID, 3000, '', [], 1, { odecistUcty: true });
  assert.equal(res.ok, true); assert.equal(res.odecteno, 250);
  assert.equal(ctx.UCTY_POLOZKY[0].smazano, true);
  assert.equal(ctx.getVydelek(WORKER_ID).uctyDluh, 0);
});
