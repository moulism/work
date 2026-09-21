// Výpočet mezd pro Kosatku (legacy systém - admin.html/app.html).
// Stejná oprava jako u provozoven: účet se nikdy neodečítá od vyplácené
// částky a výplata ho už nemaže (dřív to dělala clearUctyForWorkerLegacy).
//
// Datumy v testech používáme z minulosti (2026-01), ať testy fungují
// nezávisle na tom, kdy se skutečně spouští CI (getNevyplaceneDny/getVydelek
// počítají jen dny <= dnešek).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const WORKER_ID = 9201;

function setupWorker(ctx) {
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Bedřich Testovský', role: 'user', misto: 'vycep', sazba: null });
}

test('getVydelek - spočítá hrubou mzdu z nevyplacených dnů', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' });
  const v = ctx.getVydelek(WORKER_ID);
  // "vycep" má sazbu 180 Kč/h (viz STANOVISTE)
  assert.equal(v.hodiny, 8);
  assert.equal(v.hruby, 8 * 180);
});

test('getVydelek - účet se počítá informativně, ale NEODEČÍTÁ se od "cisty"', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' });
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', popis: 'Limonáda', castka: 200, smazano: false });

  const v = ctx.getVydelek(WORKER_ID);
  assert.equal(v.uctyDluh, 200);
  assert.equal(v.cisty, v.hruby, 'cisty == hruby (bez penalizací) - účet se neodečítá');
});

test('getVydelek - penalizace SE odečítá od "cisty"', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' });
  ctx.PENALIZACE.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', castka: 150, duvod: 'x' });
  const v = ctx.getVydelek(WORKER_ID);
  assert.equal(v.penalizaceTotal, 150);
  assert.equal(v.cisty, v.hruby - 150);
});

test('getNevyplaceneDny - per-den "cisty" taky vylučuje účet (jen hruby-penalizace)', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' });
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', popis: 'x', castka: 999, smazano: false });
  const dny = ctx.getNevyplaceneDny(WORKER_ID);
  assert.equal(dny.length, 1);
  assert.equal(dny[0].ucty, 999, 'ucty se pořád vrací pro info');
  assert.equal(dny[0].cisty, dny[0].hruby, 'ale cisty (částka k výplatě) ho nezahrnuje');
});

test('getNevyplaceneDny - vynechá dny, co už byly v nějaké výplatě', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, datum: '2026-01-05', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, datum: '2026-01-06', prichod: '10:00', odchod: '18:00' },
  );
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, castka: 1440, dny: ['2026-01-05'], datum: '2026-01-05' });
  const dny = ctx.getNevyplaceneDny(WORKER_ID);
  assert.equal(dny.length, 1);
  assert.equal(dny[0].datum, '2026-01-06');
});

test('addVyplata - zapíše výplatu', async () => {
  const ctx = freshContext();
  setupWorker(ctx);
  const res = await ctx.addVyplata(WORKER_ID, 1440, 'test', ['2026-01-05'], 1);
  assert.equal(res.ok, true);
  assert.equal(ctx.VYPLATY.length, 1);
  assert.equal(ctx.VYPLATY[0].castka, 1440);
});

test('addVyplata - NEMAŽE položky na účtu (klíčová oprava, dřív volalo clearUctyForWorkerLegacy)', async () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, datum: '2026-01-05', popis: 'Limonáda', castka: 200, smazano: false });

  await ctx.addVyplata(WORKER_ID, 1440, '', ['2026-01-05'], 1);

  const polozka = ctx.UCTY_POLOZKY.find((p) => p.id === 1);
  assert.equal(polozka.smazano, false, 'položka na účtu zůstává otevřená i po výplatě');
  assert.equal(ctx.getVydelek(WORKER_ID).uctyDluh, 200);
});

test('getVyplaceno - sečte všechny výplaty brigádníka', () => {
  const ctx = freshContext();
  setupWorker(ctx);
  ctx.VYPLATY.push(
    { id: 1, workerId: WORKER_ID, castka: 1000, datum: '2026-01-01' },
    { id: 2, workerId: WORKER_ID, castka: 500, datum: '2026-01-10' },
  );
  assert.equal(ctx.getVyplaceno(WORKER_ID), 1500);
});
