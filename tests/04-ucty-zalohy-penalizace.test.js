// Přidávání/mazání položek účtu, záloh a penalizací (multi-venue systém).
// Účty a zálohy používají stejný soft-delete vzor (smazano:true, audit
// zůstává), ale liší se v tom, jestli se vyrovnávají výplatou (zálohy ano,
// účty ne - viz tests/02 a 03).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_ID = 701;
const WORKER_ID = 9301;

function setupWorkerAndVenue(ctx) {
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Cyril Testovič', role: 'user', venue_id: VENUE_ID, aktivni: true });
  ctx.VENUES.push({ id: VENUE_ID, nazev: 'Test Venue', sazba_hodinova: 180 });
}

// ── ÚČTY ──

test('addUcetPolozkaVenue - přidá položku na účet', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const res = await ctx.addUcetPolozkaVenue(WORKER_ID, VENUE_ID, 'vycep', 'Pivo', 45);
  assert.equal(res.ok, true);
  assert.equal(ctx.UCTY_POLOZKY.length, 1);
  assert.equal(ctx.UCTY_POLOZKY[0].castka, 45);
  assert.equal(ctx.UCTY_POLOZKY[0].smazano, false);
});

test('addUcetPolozkaAdmin - admin může zapsat libovolné datum a částku', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const res = await ctx.addUcetPolozkaAdmin(WORKER_ID, VENUE_ID, '2026-05-01', 'Dodatečný účet', 999);
  assert.equal(res.ok, true);
  assert.equal(ctx.UCTY_POLOZKY[0].datum, '2026-05-01');
  assert.equal(ctx.UCTY_POLOZKY[0].castka, 999);
});

test('deleteUcetPolozkaAdmin - smaže (soft-delete) jednu položku, ostatní nechá', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.UCTY_POLOZKY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-01', popis: 'A', castka: 100, smazano: false },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-02', popis: 'B', castka: 200, smazano: false },
  );
  const res = await ctx.deleteUcetPolozkaAdmin(1, 1);
  assert.equal(res.ok, true);
  assert.equal(ctx.UCTY_POLOZKY.find((p) => p.id === 1).smazano, true);
  assert.equal(ctx.UCTY_POLOZKY.find((p) => p.id === 2).smazano, false);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 200, 'v dluhu zůstává jen nesmazaná položka');
});

test('deleteUcetPolozkaAdmin - neexistující id vrátí chybu', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const res = await ctx.deleteUcetPolozkaAdmin(999999, 1);
  assert.equal(res.ok, false);
});

test('clearUctyForWorkerVenue - hromadně vyrovná všechny otevřené položky brigádníka (dřív volané z addVyplataVenue, teď dostupné jen jako samostatná ruční akce)', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.UCTY_POLOZKY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-01', popis: 'A', castka: 100, smazano: false },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-02', popis: 'B', castka: 200, smazano: false },
  );
  await ctx.clearUctyForWorkerVenue(VENUE_ID, WORKER_ID, 1);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 0);
});

// ── ZÁLOHY ──

test('addZalohaVenue - přidá zálohu a propíše výdaj do pokladny', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const res = await ctx.addZalohaVenue(VENUE_ID, WORKER_ID, 500, 'předem na jídlo', 1);
  assert.equal(res.ok, true);
  assert.equal(ctx.ZALOHY.length, 1);
  assert.equal(ctx.ZALOHY[0].castka, 500);
  const pk = ctx.POKLADNA.find((p) => (p.popis || '').indexOf('záloha #' + res.row.id) !== -1);
  assert.ok(pk, 'záloha se propsala do pokladny');
  assert.equal(pk.typ, 'vydaj');
});

test('getZalohyForWorkerVenue - vrátí jen nesmazané zálohy, seřazené od nejnovější', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.ZALOHY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-01', castka: 100, smazano: false },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-10', castka: 200, smazano: false },
    { id: 3, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-05', castka: 300, smazano: true },
  );
  const list = ctx.getZalohyForWorkerVenue(WORKER_ID, VENUE_ID);
  assert.equal(list.length, 2);
  assert.equal(list[0].id, 2, 'nejnovější datum první');
});

test('deleteZalohaAdmin - smaže zálohu a odpovídající pokladní zápis', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const addRes = await ctx.addZalohaVenue(VENUE_ID, WORKER_ID, 500, '', 1);
  const zalohaId = addRes.row.id;
  const pkPred = ctx.POKLADNA.find((p) => (p.popis || '').indexOf('záloha #' + zalohaId) !== -1);
  assert.ok(pkPred);

  await ctx.deleteZalohaAdmin(zalohaId, 1);
  assert.equal(ctx.ZALOHY.find((z) => z.id === zalohaId).smazano, true);
  const pkPo = ctx.POKLADNA.find((p) => p.id === pkPred.id);
  assert.equal(pkPo, undefined, 'odpovídající pokladní zápis se taky smazal');
});

test('clearZalohyForWorkerVenue - hromadně vyrovná všechny otevřené zálohy', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.ZALOHY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-01', castka: 100, smazano: false },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-05-02', castka: 200, smazano: false },
  );
  await ctx.clearZalohyForWorkerVenue(VENUE_ID, WORKER_ID, 1);
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).zalohy, 0);
});

// ── PENALIZACE ──

test('addPenalizaceVenue - přidá penalizaci', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  // savePenalizace() uvnitř kontroluje LOAD_OK.penalizace (viz requireLoadOk
  // v data.js - appka odmítne uložit, pokud si nemyslí, že má bezpečně
  // načtená data) - v testu simulujeme stav "data byla v pořádku načtená".
  ctx.LOAD_OK.penalizace = true;
  const res = await ctx.addPenalizaceVenue(VENUE_ID, WORKER_ID, 'pozdní příchod', 300, '');
  assert.equal(res.ok, true);
  assert.equal(ctx.PENALIZACE.length, 1);
  assert.equal(ctx.PENALIZACE[0].castka, 300);
});

test('getPenalizaceForVenue - filtruje jen danou provozovnu', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PENALIZACE.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, castka: 100, duvod: 'x', datum: '2026-05-01' },
    { id: 2, workerId: WORKER_ID, venue_id: 999, castka: 200, duvod: 'y', datum: '2026-05-01' },
  );
  const list = ctx.getPenalizaceForVenue(VENUE_ID);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 1);
});
