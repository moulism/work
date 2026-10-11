// Export do Excelu pro účetní (js/export.js): čísla v listech MUSÍ sedět s tím, co
// ukazuje appka (getVydelekVenue, getZiskVenueMonth, ...), a vygenerovaný .xlsx musí
// být platný ZIP s platným XML (jinak by ho Excel odmítl otevřít).
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { freshContext } = require('./harness');

const VID = 701;
const W1 = 9201, W2 = 9202;

function seed(ctx) {
  ctx.VENUES.push({ id: VID, slug: 'andel-cafe', nazev: 'Anděl Café', sazba_hodinova: 180 });
  ctx.WORKERS.push(
    { id: W1, jmeno: 'Anna Testová', role: 'user', sazba: 200, venue_id: VID, aktivni: true },
    { id: W2, jmeno: 'Břetislav Čech', role: 'user', sazba: null, venue_id: VID, aktivni: true },
  );
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: W1, venue_id: VID, datum: '2026-07-01', prichod: '10:00', odchod: '18:00' },
    { id: 2, workerId: W1, venue_id: VID, datum: '2026-07-02', prichod: '20:00', odchod: '02:00' }, // přes půlnoc = 6 h
    { id: 3, workerId: W1, venue_id: VID, datum: '2026-08-05', prichod: '10:00', odchod: '15:30' },
    { id: 4, workerId: W2, venue_id: VID, datum: '2026-07-03', prichod: '12:00', odchod: '' },      // neúplný záznam
    { id: 5, workerId: W2, venue_id: VID, datum: '2026-07-04', prichod: '12:00', odchod: '20:00' },
    { id: 6, workerId: W2, venue_id: 999, datum: '2026-07-04', prichod: '09:00', odchod: '10:00' }, // jiná provozovna
  );
  ctx.TRZBY.push(
    { id: 1, venue_id: VID, mistoId: 'hlavni', datum: '2026-07-01', castka: 5000, hotove: 3000, kartou: 2000, workerId: W1, poznamka: 'pěkný den' },
    { id: 2, venue_id: VID, mistoId: 'hlavni', datum: '2026-07-02', castka: 4000, hotove: null, kartou: null, workerId: W1, poznamka: '' },
    { id: 3, venue_id: VID, mistoId: 'hlavni', datum: '2026-08-01', castka: 1000, hotove: 1000, kartou: 0, workerId: W2, poznamka: '' },
  );
  ctx.NAKLADY.push(
    { id: 1, venue_id: VID, workerId: W1, datum: '2026-07-03', popis: 'Makro - pivo', castka: 2500, kategorie: null },
    { id: 2, venue_id: VID, workerId: null, datum: '2026-07-10', popis: 'Elektřina', castka: 900, kategorie: 'elektro' },
  );
  ctx.POKLADNA.push(
    { id: 1, venue_id: VID, datum: '2026-07-01', typ: 'prijem', castka: 3000, popis: 'Tržba (auto) · hlavni · 2026-07-01', worker_id: W1, ucet: 'hotovost' },
    { id: 2, venue_id: VID, datum: '2026-07-06', typ: 'vydaj', castka: 700, popis: 'Výplata mzdy – Anna Testová (výplata #1)', worker_id: null, ucet: 'hotovost' },
    { id: 3, venue_id: VID, datum: '2026-07-07', typ: 'vydaj', castka: 300, popis: 'Led', worker_id: null, ucet: 'hotovost' },
  );
  ctx.VYPLATY.push({ id: 1, workerId: W1, venue_id: VID, datum: '2026-07-06', castka: 700, poznamka: 'červenec část', dny: ['2026-07-01'] });
  ctx.PENALIZACE.push({ id: 1, workerId: W2, venue_id: VID, datum: '2026-07-04', castka: 100, duvod: 'Pozdní příchod', poznamka: '' });
  ctx.ZALOHY.push({ id: 1, workerId: W1, venue_id: VID, datum: '2026-07-05', castka: 300, poznamka: 'záloha', smazano: false });
  ctx.exportContext = () => ({ venue: ctx.getVenueById(VID), kosatka: false, workers: ctx.getWorkersForVenue(VID) });
  return ctx.exportContext();
}

function sheetByName(sheets, name) { return sheets.find((s) => s.name === name); }
// Hodnota buňky na [řádek, sloupec] (1-based řádek, 0-based sloupec).
function cell(sheet, row, col) {
  const c = sheet.rows[row - 1] && sheet.rows[row - 1][col];
  return c && typeof c === 'object' ? c.v : c;
}
// Datové řádky listu (od 4. řádku do prvního prázdného).
function dataRows(sheet) {
  const out = [];
  for (let i = 3; i < sheet.rows.length; i++) { if (!sheet.rows[i].length) break; out.push(sheet.rows[i]); }
  return out;
}

test('Docházka: řádky za červenec, bez neúplných hodin a bez jiné provozovny, hodiny přes půlnoc', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = ctx.ExportReports.buildSheets(c, ['dochazka'], 7);
  const d = sheetByName(sh, 'Docházka');
  const rows = dataRows(d);
  assert.equal(rows.length, 4, '2 dny Anny + 2 dny Břetislava (včetně neúplného), bez cizí provozovny a bez srpna');
  const anna2 = rows.find((r) => r[2].v === 'Anna Testová' && r[0].v === ctx.ExportReports.serial('2026-07-02'));
  assert.equal(anna2[5].v, 6, '20:00–02:00 = 6 h');
  const nec = rows.find((r) => r[2].v === 'Břetislav Čech' && r[0].v === ctx.ExportReports.serial('2026-07-03'));
  assert.equal(nec[5], null, 'neúplný den nemá hodiny');
  assert.match(nec[8].v, /neúplný/);
});

test('Mzdy po měsících sedí s getVydelekVenueMonth (to, co ukazuje appka)', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const mesice = ctx.ExportReports.mzdyPoMesicich(c, 'all');
  [W1, W2].forEach((wid) => {
    [7, 8].forEach((m) => {
      const app = ctx.getVydelekVenueMonth(wid, VID, 2026, m);
      const key = '2026-' + String(m).padStart(2, '0');
      const ex = mesice.find((x) => x.workerId === wid && x.mesic === key);
      assert.equal(ex ? ex.hruby : 0, app.hruby, `mzda worker ${wid} měsíc ${m}`);
      assert.equal(ex ? ex.hodiny : 0, app.hodiny, `hodiny worker ${wid} měsíc ${m}`);
    });
  });
  // Břetislav nemá vlastní sazbu -> 180 z provozovny: 8 h × 180
  assert.equal(mesice.find((x) => x.workerId === W2 && x.mesic === '2026-07').hruby, 8 * 180);
});

test('K výplatě: stejná čísla jako getVydelekVenue', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = sheetByName(ctx.ExportReports.buildSheets(c, ['mzdy'], 'all'), 'K výplatě');
  const rows = dataRows(sh);
  const anna = rows.find((r) => r[0].v === 'Anna Testová');
  const v = ctx.getVydelekVenue(W1, VID);
  assert.equal(anna[1].v, v.hodiny);
  assert.equal(anna[2].v, v.hruby);
  assert.equal(anna[3].v, v.penalizaceTotal);
  assert.equal(anna[4].v, v.zalohy);
  assert.equal(anna[5].v, v.cisty);
  assert.equal(anna[6].v, ctx.getVyplacenoVenue(VID, W1));
});

test('Výplaty: datum, částka a měsíce, za které se vyplácelo', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = sheetByName(ctx.ExportReports.buildSheets(c, ['mzdy'], 7), 'Výplaty');
  const rows = dataRows(sh);
  assert.equal(rows.length, 1);
  assert.equal(rows[0][2].v, 700);
  assert.equal(rows[0][3].v, 'červenec 2026');
});

test('Tržby: součet sedí s getTrzbyForVenueMonth, chybějící rozpad hotově/kartou zůstane prázdný', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = sheetByName(ctx.ExportReports.buildSheets(c, ['trzby'], 7), 'Tržby');
  const rows = dataRows(sh);
  assert.equal(rows.length, 2);
  const total = rows.reduce((s, r) => s + r[5].v, 0);
  assert.equal(total, ctx.getTrzbyForVenueMonth(VID, 2026, 7).reduce((s, t) => s + t.castka, 0));
  assert.equal(rows[1][3], null);
  assert.equal(rows[1][4], null);
});

test('Náklady a faktury: totéž co záložka Náklady (faktury + výdaje z pokladny), mzdy v pokladně jsou označené', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = sheetByName(ctx.ExportReports.buildSheets(c, ['naklady'], 7), 'Náklady a faktury');
  const rows = dataRows(sh);
  const app = ctx.getVsechnyNakladyVenueMonth(VID, 2026, 7);
  assert.equal(rows.length, app.length);
  assert.equal(rows.reduce((s, r) => s + r[5].v, 0), app.reduce((s, n) => s + n.castka, 0));
  assert.ok(rows.some((r) => r[6] && /mzda/.test(r[6].v)), 'výplata mzdy z pokladny je označená');
});

test('Statistiky: zisk sedí s getZiskVenueMonth, měsíční přehled má vzorec pro zisk', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = ctx.ExportReports.buildSheets(c, ['statistiky'], 7);
  const z = ctx.getZiskVenueMonth(VID, 2026, 7);
  const prehled = dataRows(sheetByName(sh, 'Statistiky'));
  const row = (label) => prehled.find((r) => (r[0].v || r[0]) === label);
  assert.equal(row('Tržby')[1].v, z.trzby);
  assert.equal(row('Náklady (faktury a náklady)')[1].v, z.naklady);
  assert.equal(row('Vyplacené mzdy')[1].v, z.vyplaty);
  assert.equal(row('Čistý zisk')[1].v, z.zisk);
  const mes = dataRows(sheetByName(sh, 'Měsíční přehled'));
  assert.equal(mes.length, 2, 'červenec a srpen mají data');
  assert.equal(mes[0][4].f, 'B4-C4-D4');
  assert.equal(mes[0][4].v, z.zisk);
});

test('Pokladna: příjmy a výdaje podle zápisů', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sh = sheetByName(ctx.ExportReports.buildSheets(c, ['pokladna'], 7), 'Pokladna');
  const rows = dataRows(sh);
  assert.equal(rows.length, 3);
  assert.equal(rows.reduce((s, r) => s + (r[3] ? r[3].v : 0), 0), 3000);
  assert.equal(rows.reduce((s, r) => s + (r[4] ? r[4].v : 0), 0), 1000);
});

test('Kosatka: nemá list Pokladna a bere řádky bez venue_id jen od svých brigádníků', () => {
  const ctx = freshContext();
  const KID = 702;
  ctx.VENUES.push({ id: KID, slug: 'kosatka', nazev: 'Kosatka', rezim: 'kosatka', sazba_hodinova: 150 });
  ctx.WORKERS.push({ id: 9301, jmeno: 'Karel Kosatka', role: 'user', sazba: 150, venue_id: KID, aktivni: true });
  ctx.PRACOVNI_DNY.push(
    { id: 1, workerId: 9301, datum: '2026-07-01', prichod: '10:00', odchod: '14:00' },            // bez venue_id (legacy)
    { id: 2, workerId: 9999, datum: '2026-07-01', prichod: '10:00', odchod: '14:00' },            // cizí brigádník
  );
  const c = { venue: ctx.getVenueById(KID), kosatka: true, workers: ctx.WORKERS.filter((w) => w.id === 9301) };
  ctx.exportContext = () => c;
  assert.ok(!ctx.ExportReports.availableKeys(c).includes('pokladna'));
  const d = sheetByName(ctx.ExportReports.buildSheets(c, ['dochazka'], 7), 'Docházka');
  const rows = dataRows(d);
  assert.equal(rows.length, 1);
  assert.equal(rows[0][2].v, 'Karel Kosatka');
});

test('Název souboru: bez diakritiky, s typem a obdobím', () => {
  const ctx = freshContext(); const c = seed(ctx);
  assert.equal(ctx.ExportReports.fileName(c, ctx.ExportReports.availableKeys(c), 7), 'Andel-Cafe_pro-ucetni_2026-07.xlsx');
  assert.equal(ctx.ExportReports.fileName(c, ['dochazka'], 'all'), 'Andel-Cafe_dochazka_2026-cela-sezona.xlsx');
});

// Mini-unzip pro kontrolu .xlsx: čte centrální adresář, ověřuje CRC a vrací textové obsahy.
function unzip(bytes) {
  const buf = Buffer.from(bytes);
  const eocd = buf.length - 22;
  assert.equal(buf.readUInt32LE(eocd), 0x06054b50, 'konec ZIPu');
  const n = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = {};
  for (let i = 0; i < n; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50);
    const crc = buf.readUInt32LE(p + 16), size = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nlen).toString('utf8');
    const lnlen = buf.readUInt16LE(off + 26), lelen = buf.readUInt16LE(off + 28);
    const data = buf.slice(off + 30 + lnlen + lelen, off + 30 + lnlen + lelen + size);
    assert.equal(require('node:zlib').crc32 ? require('node:zlib').crc32(data) : crc, crc, 'CRC ' + name);
    out[name] = data.toString('utf8');
    p += 46 + nlen + elen + clen;
  }
  return out;
}

test('Vygenerovaný .xlsx je platný ZIP se všemi částmi a bez rozbitého XML', () => {
  const ctx = freshContext(); const c = seed(ctx);
  const sheets = ctx.ExportReports.buildSheets(c, ctx.ExportReports.availableKeys(c), 7);
  const files = unzip(ctx.Xlsx.build(sheets));
  assert.ok(files['[Content_Types].xml'] && files['xl/workbook.xml'] && files['xl/styles.xml']);
  const nSheets = sheets.length;
  for (let i = 1; i <= nSheets; i++) assert.ok(files['xl/worksheets/sheet' + i + '.xml'], 'sheet' + i);
  // Pár základních kontrol, že XML není rozbité (neescapované znaky, nepárové značky).
  Object.keys(files).filter((f) => f.endsWith('.xml') || f.endsWith('.rels')).forEach((f) => {
    assert.ok(files[f].startsWith('<?xml'), f);
    assert.ok(!/<t[^>]*>[^<]*&(?!amp;|lt;|gt;|quot;)/.test(files[f]), 'neescapované & v ' + f);
  });
  assert.match(files['xl/workbook.xml'], /Docházka/);
  assert.match(files['xl/worksheets/sheet1.xml'], /Anna Testová/);
});

test('Názvy listů jsou unikátní, do 31 znaků a bez zakázaných znaků', () => {
  const ctx = freshContext();
  const sheets = [
    { name: 'A/B:C*D?[x]', rows: [[1]] },
    { name: 'a/b:c*d?[x]', rows: [[1]] },
    { name: 'Velmi dlouhý název listu který přesahuje třicet jedna znaků', rows: [[1]] },
  ];
  ctx.Xlsx.build(sheets);
  const names = sheets.map((s) => s.name);
  assert.equal(new Set(names.map((n) => n.toLowerCase())).size, 3);
  names.forEach((n) => { assert.ok(n.length <= 31); assert.ok(!/[\[\]:*?\/\\]/.test(n)); });
});
