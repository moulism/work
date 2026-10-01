// Výpočet mezd pro systém provozoven (Republika/Anděl) - getVydelekVenue,
// addVyplataVenue. Tohle je jádro opravy: ÚČTY (dluh za odebrané zboží) se
// NESMÍ odečítat od vyplácené částky ani se výplatou mazat - brigádník si
// je platí sám zvlášť v hotovosti. Zálohy a penalizace se naopak dál
// odečítají a výplatou se automaticky vyrovnávají.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_ID = 601;
const WORKER_ID = 9101;

function setupWorkerAndVenue(ctx) {
  ctx.WORKERS.push({ id: WORKER_ID, jmeno: 'Anna Testová', role: 'user', sazba: 200, venue_id: VENUE_ID, aktivni: true });
  ctx.VENUES.push({ id: VENUE_ID, nazev: 'Testovací provozovna', sazba_hodinova: 180 });
}

test('getVydelekVenue - spočítá hrubou mzdu z odpracovaných hodin × sazba', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-02', prichod: '10:00', odchod: '18:00' },
  );
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hodiny, 16);
  assert.equal(v.hruby, 16 * 200);
});

test('getVydelekVenue - účet se počítá informativně (uctyDluh), ale NEODEČÍTÁ se od "cisty"', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' });
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', popis: 'Pivo', castka: 500, smazano: false });

  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hruby, 8 * 200); // 1600
  assert.equal(v.uctyDluh, 500, 'dluh na účtu se pořád počítá pro zobrazení');
  assert.equal(v.cisty, v.hruby, 'účet se od vyplácené částky NEODEČÍTÁ - cisty == hruby (bez penalizací/záloh)');
});

test('getVydelekVenue - smazaná (zaplacená) položka účtu se do uctyDluh nepočítá', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', popis: 'Pivo', castka: 500, smazano: true });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.uctyDluh, 0);
});

test('getVydelekVenue - penalizace SE odečítá od "cisty"', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' });
  ctx.PENALIZACE.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', castka: 300, duvod: 'pozdní příchod' });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.penalizaceTotal, 300);
  assert.equal(v.cisty, v.hruby - 300);
});

test('getVydelekVenue - záloha SE odečítá od "cisty"', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' });
  ctx.ZALOHY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', castka: 1000, smazano: false });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.zalohy, 1000);
  assert.equal(v.cisty, v.hruby - 1000);
});

test('getVydelekVenue - účet, penalizace i záloha zároveň: jen penalizace+záloha jdou do "cisty"', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' }); // 8h*200=1600
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', popis: 'Pivo', castka: 500, smazano: false });
  ctx.PENALIZACE.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', castka: 300, duvod: 'x' });
  ctx.ZALOHY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', castka: 200, smazano: false });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hruby, 1600);
  assert.equal(v.uctyDluh, 500);
  assert.equal(v.cisty, 1600 - 300 - 200, 'cisty = hruby - penalizace - zálohy (BEZ účtu)');
});

test('getVydelekVenue - počítá jen dny po poslední výplatě', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-06-20', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-05', prichod: '10:00', odchod: '18:00' },
  );
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-06-25', castka: 1600, dny: ['2026-06-20'] });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hodiny, 8, 'jen den 2026-07-05 (po poslední výplatě 2026-06-25)');
});

test('getVydelekVenue - duplicitní záznamy stejného dne se nesčítají dvakrát', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', prichod: '11:00', odchod: '19:00' },
  );
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hodiny, 8, 'druhý záznam za stejný den se ignoruje (seen[datum])');
});

test('addVyplataVenue - zapíše výplatu a propíše výdaj do pokladny', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  const res = await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 1600, 'test výplata', ['2026-07-01'], 1);
  assert.equal(res.ok, true);
  assert.equal(ctx.VYPLATY.length, 1);
  assert.equal(ctx.VYPLATY[0].castka, 1600);
  const pokladniZapis = ctx.POKLADNA.find((p) => (p.popis || '').indexOf('výplata #' + res.row.id) !== -1);
  assert.ok(pokladniZapis, 'výplata se propsala do pokladny jako výdaj');
  assert.equal(pokladniZapis.typ, 'vydaj');
  assert.equal(pokladniZapis.castka, 1600);
});

test('addVyplataVenue - NEMAŽE položky na účtu (klíčová oprava)', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.UCTY_POLOZKY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', popis: 'Pivo', castka: 500, smazano: false });

  await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 1600, '', ['2026-07-01'], 1);

  const polozka = ctx.UCTY_POLOZKY.find((p) => p.id === 1);
  assert.equal(polozka.smazano, false, 'položka na účtu zůstává po výplatě nadále otevřená');
  assert.equal(ctx.getVydelekVenue(WORKER_ID, VENUE_ID).uctyDluh, 500, 'dluh na účtu se výplatou nezměnil');
});

test('addVyplataVenue - MAŽE (vyrovná) zálohy po výplatě', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.ZALOHY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-01', castka: 300, smazano: false });

  await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 1300, '', ['2026-07-01'], 1);

  const zaloha = ctx.ZALOHY.find((z) => z.id === 1);
  assert.equal(zaloha.smazano, true, 'záloha se po výplatě vyrovná (soft-delete)');
});

test('getVyplacenoVenue - sečte všechny výplaty brigádníka na dané provozovně', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.VYPLATY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, castka: 1000, datum: '2026-06-01' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, castka: 1500, datum: '2026-07-01' },
    { id: 3, workerId: WORKER_ID, venue_id: 999, castka: 9999, datum: '2026-07-01' }, // jiná provozovna
  );
  assert.equal(ctx.getVyplacenoVenue(VENUE_ID, WORKER_ID), 2500);
});

test('getPosledniVyplataDatumVenue - vrátí null, když ještě nebylo vyplaceno', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  assert.equal(ctx.getPosledniVyplataDatumVenue(VENUE_ID, WORKER_ID), null);
});

test('getPosledniVyplataDatumVenue - vrátí datum nejnovější výplaty', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.VYPLATY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, castka: 1000, datum: '2026-06-01' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, castka: 1500, datum: '2026-07-15' },
  );
  assert.equal(ctx.getPosledniVyplataDatumVenue(VENUE_ID, WORKER_ID), '2026-07-15');
});

test('getNevyplaceneDnyVenue - vrátí dny po poslední výplatě, seřazené podle data, pro rozpad po měsících', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-06-28', prichod: '10:00', odchod: '18:00' }, // 8h
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-02', prichod: '10:00', odchod: '14:00' }, // 4h
  );
  const dny = ctx.getNevyplaceneDnyVenue(WORKER_ID, VENUE_ID);
  assert.equal(dny.length, 2);
  assert.deepEqual(Array.from(dny.map((d) => d.datum)), ['2026-06-28', '2026-07-02'], 'seřazeno vzestupně podle data');
  assert.equal(dny[0].hruby, 8 * 200);
  assert.equal(dny[1].hruby, 4 * 200);
  const cerven = dny.filter((d) => d.datum.slice(0, 7) === '2026-06').reduce((s, d) => s + d.hruby, 0);
  const cervenec = dny.filter((d) => d.datum.slice(0, 7) === '2026-07').reduce((s, d) => s + d.hruby, 0);
  assert.equal(cerven, 1600, 'červen 2026 odděleně od července');
  assert.equal(cervenec, 800);
});

test('getNevyplaceneDnyVenue - počítá jen dny po poslední výplatě, dny bez příchodu/odchodu vynechá', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-06-20', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-05', prichod: '10:00', odchod: '18:00' },
    { id: 3, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-06', prichod: null, odchod: null },
  );
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-06-25', castka: 1600, dny: ['2026-06-20'] });
  const dny = ctx.getNevyplaceneDnyVenue(WORKER_ID, VENUE_ID);
  assert.deepEqual(Array.from(dny.map((d) => d.datum)), ['2026-07-05'], 'jen den po poslední výplatě a se zapsaným příchodem/odchodem');
});

test('addVyplataVenue - vyplacení jen VYBRANÉHO měsíce nechá ostatní (nevybrané) dny dál k výplatě', async () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-07-28', prichod: '10:00', odchod: '18:00' }, // 8h, červenec
    { id: 2, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-08-02', prichod: '10:00', odchod: '18:00' }, // 8h, srpen
  );
  await ctx.addVyplataVenue(VENUE_ID, WORKER_ID, 1600, 'výplata za červenec', ['2026-07-28'], 1);
  const dny = ctx.getNevyplaceneDnyVenue(WORKER_ID, VENUE_ID);
  assert.deepEqual(Array.from(dny.map((d) => d.datum)), ['2026-08-02'], 'srpnový den (nevybraný) zůstává dál k výplatě');
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.hodiny, 8, 'jen nevyplacených srpnových 8h - červencové jsou už vyplacené');
});

test('getVydelekVenue - penalizace z (ještě) nevyplaceného měsíce se počítá i po částečné výplatě jiného měsíce', () => {
  const ctx = freshContext();
  setupWorkerAndVenue(ctx);
  // Výplata se zapsala (datum) až 15.8., ale vyplatila jen červencový den (dny) -
  // penalizace z 10.8. (po červenci, ale PŘED datem zápisu výplaty) se pořád
  // musí počítat jako dlužná, ne tiše "spadnout pod stůl".
  ctx.VYPLATY.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-08-15', castka: 1600, dny: ['2026-07-28'] });
  ctx.PENALIZACE.push({ id: 1, workerId: WORKER_ID, venue_id: VENUE_ID, datum: '2026-08-10', castka: 300, duvod: 'srpnová penalizace' });
  const v = ctx.getVydelekVenue(WORKER_ID, VENUE_ID);
  assert.equal(v.penalizaceTotal, 300, 'penalizace ze srpna se počítá - vyplacený byl jen červencový den');
});
