// Dostupnost brigádníků (per-provozovna, systém Republika/Anděl) a výběr
// brigádníků, co patří na danou provozovnu (domovská + vedlejší přes
// worker_venues).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VENUE_A = 901;
const VENUE_B = 902;

// Pole vrácená z funkcí uvnitř VM kontextu patří jinému JS "realmu" než pole
// v tomhle test souboru - node:assert/strict deepEqual je umí vyhodnotit
// jako nerovné, i když mají stejný obsah. Proto se místo deepEqual porovnává
// obsah přes Array.from (plain pole v tomhle realmu).
function arr(a) { return Array.from(a); }

test('getDostupnostVenue - vrátí prázdné pole, když brigádník nemá pro tu provozovnu nic zapsáno', () => {
  const ctx = freshContext();
  assert.deepEqual(arr(ctx.getDostupnostVenue(1, VENUE_A)), []);
});

test('getDostupnostVenue - vrátí dny zapsané pro danou provozovnu', () => {
  const ctx = freshContext();
  ctx.WORKER_DOSTUPNOST.push({ id: 1, worker_id: 9501, venue_id: VENUE_A, dny: ['2026-07-01', '2026-07-02'] });
  assert.deepEqual(arr(ctx.getDostupnostVenue(9501, VENUE_A)), ['2026-07-01', '2026-07-02']);
});

test('getDostupnostVenue - stejný brigádník má dostupnost oddělenou po provozovnách', () => {
  const ctx = freshContext();
  ctx.WORKER_DOSTUPNOST.push(
    { id: 1, worker_id: 9502, venue_id: VENUE_A, dny: ['2026-07-01'] },
    { id: 2, worker_id: 9502, venue_id: VENUE_B, dny: ['2026-08-01'] },
  );
  assert.deepEqual(arr(ctx.getDostupnostVenue(9502, VENUE_A)), ['2026-07-01']);
  assert.deepEqual(arr(ctx.getDostupnostVenue(9502, VENUE_B)), ['2026-08-01']);
});

test('getDostupnostPoznamkaVenue - vrátí prázdný řetězec, když poznámka chybí', () => {
  const ctx = freshContext();
  assert.equal(ctx.getDostupnostPoznamkaVenue(1, VENUE_A), '');
});

test('smenyLabel - spojí pole směn do čitelného textu', () => {
  const ctx = freshContext();
  assert.equal(ctx.smenyLabel(['oběd', 'večeře']), 'oběd, večeře');
  assert.equal(ctx.smenyLabel('oběd'), 'oběd');
  assert.equal(ctx.smenyLabel(null), '');
});

test('getWorkersForVenue - vrátí brigádníky s domovskou provozovnou', () => {
  const ctx = freshContext();
  ctx.WORKERS.push(
    { id: 9601, jmeno: 'Domácí', role: 'user', venue_id: VENUE_A, aktivni: true },
    { id: 9602, jmeno: 'Jinde', role: 'user', venue_id: VENUE_B, aktivni: true },
  );
  const list = ctx.getWorkersForVenue(VENUE_A);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 9601);
});

test('getWorkersForVenue - zahrne i brigádníky přidané jako vedlejší (worker_venues)', () => {
  const ctx = freshContext();
  ctx.WORKERS.push({ id: 9603, jmeno: 'Hostující', role: 'user', venue_id: VENUE_B, aktivni: true });
  ctx.WORKER_VENUES.push({ worker_id: 9603, venue_id: VENUE_A });
  const list = ctx.getWorkersForVenue(VENUE_A);
  assert.ok(list.some((w) => w.id === 9603), 'brigádník s domovskou provozovnou B je vidět i na provozovně A');
});

test('getWorkersForVenue - vynechá adminy a neaktivní brigádníky', () => {
  const ctx = freshContext();
  ctx.WORKERS.push(
    { id: 9604, jmeno: 'Admin', role: 'admin', venue_id: VENUE_A, aktivni: true },
    { id: 9605, jmeno: 'Neaktivní', role: 'user', venue_id: VENUE_A, aktivni: false },
    { id: 9606, jmeno: 'Aktivní', role: 'user', venue_id: VENUE_A, aktivni: true },
  );
  const list = ctx.getWorkersForVenue(VENUE_A);
  const ids = list.map((w) => w.id);
  assert.ok(!ids.includes(9604));
  assert.ok(!ids.includes(9605));
  assert.ok(ids.includes(9606));
});
