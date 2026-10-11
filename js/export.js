// js/export.js
//
// Export do Excelu (.xlsx) pro účetní - docházka, mzdy a výplaty, tržby,
// náklady a faktury, pokladna a statistiky.
//
// Tři vrstvy:
//   1) Xlsx          - malý zapisovač pravých .xlsx souborů (bez knihoven, ať appka
//                      zůstává čistě statická). Umí styly, formát měn/dat/hodin,
//                      zmrazenou hlavičku, filtry a vzorce se spočítanou hodnotou.
//   2) ExportReports - z dat v paměti (WORKERS, PRACOVNI_DNY, TRZBY, ...) sestaví
//                      jednotlivé listy. Čísla bere ze STEJNÝCH funkcí jako appka
//                      (getSazbaVenue, getVydelekVenue, getZiskVenueMonth, ...), takže
//                      sedí s tím, co admin vidí na obrazovce.
//   3) ExportUI      - záložka "Export pro účetní" a tlačítka u jednotlivých sekcí.
//
// Stránka, která export používá, musí mít globální funkci exportContext(), která
// vrací { venue, kosatka, workers }:
//   venue    - objekt provozovny (z VENUES)
//   kosatka  - true u starší Kosatky (admin.html): jiný způsob počítání sazby podle
//              stanoviště a řádky bez venue_id
//   workers  - brigádníci té provozovny (bez adminů)

var EXPORT_YEAR = 2026; // appka je celá postavená na sezóně 2026 (stejně jako zbytek kódu)

// ───────────────────────── 1) XLSX ZAPISOVAČ ─────────────────────────
var Xlsx = (function(){
  var CRC_TABLE = (function(){
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes){
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function utf8(s){ return new TextEncoder().encode(s); }

  // ZIP bez komprese (STORED) - pro pár desítek kB textu úplně stačí a je to nejjednodušší
  // formát, který Excel i LibreOffice bez problémů otevřou.
  function zip(files){
    var chunks = [], central = [], offset = 0, total = 0;
    files.forEach(function(f){
      var name = utf8(f.name), data = f.data, crc = crc32(data), size = data.length;
      var lh = new Uint8Array(30 + name.length), dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, size, true); dv.setUint32(22, size, true);
      dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true);
      lh.set(name, 30);
      var ch = new Uint8Array(46 + name.length), cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0x21, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, size, true); cv.setUint32(24, size, true);
      cv.setUint16(28, name.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
      ch.set(name, 46);
      chunks.push(lh, data); central.push(ch);
      offset += lh.length + data.length;
    });
    var cdSize = 0; central.forEach(function(c){ cdSize += c.length; });
    var end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
    var all = chunks.concat(central, [end]);
    all.forEach(function(c){ total += c.length; });
    var out = new Uint8Array(total), pos = 0;
    all.forEach(function(c){ out.set(c, pos); pos += c.length; });
    return out;
  }

  function esc(s){
    return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function colLetter(i){
    var s = ''; i = i + 1;
    while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }

  // Styly (indexy do <cellXfs>) - viz styles() níž, pořadí MUSÍ sedět.
  var STYLE = { def:0, hdr:1, date:2, money:3, hours:4, time:5, int:6, bold:7, tlabel:8, tmoney:9, thours:10, tint:11, title:12, note:13, wrap:14, boldmoney:15 };
  function styles(){
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
    '<numFmts count="4">'+
      '<numFmt numFmtId="164" formatCode="dd\\.mm\\.yyyy"/>'+
      '<numFmt numFmtId="165" formatCode="#,##0\\ &quot;Kč&quot;"/>'+
      '<numFmt numFmtId="166" formatCode="0.0"/>'+
      '<numFmt numFmtId="167" formatCode="hh:mm"/>'+
    '</numFmts>'+
    '<fonts count="5">'+
      '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>'+
      '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>'+
      '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>'+
      '<font><b/><sz val="14"/><name val="Calibri"/><family val="2"/></font>'+
      '<font><i/><sz val="10"/><color rgb="FF5D6678"/><name val="Calibri"/><family val="2"/></font>'+
    '</fonts>'+
    '<fills count="4">'+
      '<fill><patternFill patternType="none"/></fill>'+
      '<fill><patternFill patternType="gray125"/></fill>'+
      '<fill><patternFill patternType="solid"><fgColor rgb="FF1B2333"/><bgColor indexed="64"/></patternFill></fill>'+
      '<fill><patternFill patternType="solid"><fgColor rgb="FFEEF0F4"/><bgColor indexed="64"/></patternFill></fill>'+
    '</fills>'+
    '<borders count="3">'+
      '<border><left/><right/><top/><bottom/><diagonal/></border>'+
      '<border><left/><right/><top/><bottom style="thin"><color rgb="FFD5D9E0"/></bottom><diagonal/></border>'+
      '<border><left/><right/><top style="thin"><color rgb="FF1B2333"/></top><bottom/><diagonal/></border>'+
    '</borders>'+
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
    '<cellXfs count="16">'+
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+                                                                       // 0 def
      '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'+ // 1 hdr
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left"/></xf>'+ // 2 date
      '<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>'+                                 // 3 money
      '<xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>'+                                 // 4 hours
      '<xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left"/></xf>'+ // 5 time
      '<xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>'+                                   // 6 int
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>'+                                           // 7 bold
      '<xf numFmtId="0" fontId="1" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+                             // 8 tlabel
      '<xf numFmtId="165" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>'+      // 9 tmoney
      '<xf numFmtId="166" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>'+      // 10 thours
      '<xf numFmtId="1" fontId="1" fillId="3" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>'+        // 11 tint
      '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>'+                                                          // 12 title
      '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>'+                                                          // 13 note
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>'+ // 14 wrap
      '<xf numFmtId="165" fontId="1" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>'+                   // 15 boldmoney
    '</cellXfs>'+
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'+
    '</styleSheet>';
  }

  function cellXml(cell, r, c){
    if (cell === null || cell === undefined || cell === '') return '';
    if (typeof cell !== 'object') cell = { v: cell };
    var ref = colLetter(c) + r;
    var s = STYLE[cell.s || (typeof cell.v === 'number' ? 'def' : 'def')] || 0;
    var sAttr = s ? ' s="' + s + '"' : '';
    if (cell.f) {
      var cached = (typeof cell.v === 'number' && isFinite(cell.v)) ? '<v>' + cell.v + '</v>' : '';
      return '<c r="' + ref + '"' + sAttr + '><f>' + esc(cell.f) + '</f>' + cached + '</c>';
    }
    if (typeof cell.v === 'number') {
      if (!isFinite(cell.v)) return '';
      return '<c r="' + ref + '"' + sAttr + '><v>' + cell.v + '</v></c>';
    }
    if (cell.v === '' || cell.v === null || cell.v === undefined) return s ? '<c r="' + ref + '"' + sAttr + '/>' : '';
    return '<c r="' + ref + '"' + sAttr + ' t="inlineStr"><is><t xml:space="preserve">' + esc(cell.v) + '</t></is></c>';
  }

  function sheetXml(sh){
    var rows = sh.rows || [], ncols = 0;
    rows.forEach(function(r){ if (r.length > ncols) ncols = r.length; });
    var x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'+
      '<dimension ref="A1:' + colLetter(Math.max(ncols - 1, 0)) + Math.max(rows.length, 1) + '"/>';
    x += '<sheetViews><sheetView workbookViewId="0"' + (sh.active ? ' tabSelected="1"' : '') + '>';
    if (sh.freeze) x += '<pane ySplit="' + sh.freeze + '" topLeftCell="A' + (sh.freeze + 1) + '" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>';
    x += '</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>';
    if (sh.cols && sh.cols.length) {
      x += '<cols>' + sh.cols.map(function(w, i){ return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols>';
    }
    x += '<sheetData>';
    rows.forEach(function(row, ri){
      var cells = '';
      row.forEach(function(cell, ci){ cells += cellXml(cell, ri + 1, ci); });
      x += '<row r="' + (ri + 1) + '"' + (sh.hdrRow === ri + 1 ? ' ht="30" customHeight="1"' : '') + '>' + cells + '</row>';
    });
    x += '</sheetData>';
    if (sh.filter) x += '<autoFilter ref="' + sh.filter + '"/>';
    x += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'+
         '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
    return x;
  }

  function safeSheetName(name, used){
    var n = String(name).replace(/[\[\]\:\*\?\/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 31) || 'List';
    var base = n, i = 2;
    while (used[n.toLowerCase()]) { var suf = ' ' + i++; n = base.slice(0, 31 - suf.length) + suf; }
    used[n.toLowerCase()] = true;
    return n;
  }

  // sheets: [{ name, cols:[šířky], rows:[[buňka,...],...], freeze, filter, hdrRow }]
  function build(sheets){
    var used = {};
    sheets.forEach(function(s, i){ s.name = safeSheetName(s.name, used); s.active = (i === 0); });
    var files = [];
    files.push({ name: '[Content_Types].xml', data: utf8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
      sheets.map(function(s, i){ return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('')+
      '</Types>') });
    files.push({ name: '_rels/.rels', data: utf8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
      '</Relationships>') });
    files.push({ name: 'xl/workbook.xml', data: utf8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<bookViews><workbookView activeTab="0"/></bookViews><sheets>'+
      sheets.map(function(s, i){ return '<sheet name="' + esc(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('')+
      '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>') });
    files.push({ name: 'xl/_rels/workbook.xml.rels', data: utf8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      sheets.map(function(s, i){ return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('')+
      '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
      '</Relationships>') });
    files.push({ name: 'xl/styles.xml', data: utf8(styles()) });
    sheets.forEach(function(s, i){ files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: utf8(sheetXml(s)) }); });
    return zip(files);
  }

  function download(filename, sheets){
    var bytes = build(sheets);
    var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
  }

  return { build: build, download: download, colLetter: colLetter, crc32: crc32 };
})();


// ───────────────────────── 2) REPORTY ─────────────────────────
var ExportReports = (function(){
  var MESICE = ['', 'leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  var DNY = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  function prefixOf(month){ return month === 'all' ? (EXPORT_YEAR + '-') : (EXPORT_YEAR + '-' + String(month).padStart(2, '0')); }
  function periodLabel(month){ return month === 'all' ? ('celá sezóna ' + EXPORT_YEAR) : (MESICE[month] + ' ' + EXPORT_YEAR); }
  function periodTag(month){ return month === 'all' ? (EXPORT_YEAR + '-cela-sezona') : (EXPORT_YEAR + '-' + String(month).padStart(2, '0')); }
  function monthLabelOfKey(key){ return MESICE[parseInt(key.slice(5, 7), 10)] + ' ' + key.slice(0, 4); }
  function inPeriod(datum, month){ return (datum || '').indexOf(prefixOf(month)) === 0; }

  // Datum 'YYYY-MM-DD' -> excelové sériové číslo (dny od 30.12.1899).
  function serial(datum){
    var p = datum.split('-');
    return Math.round(Date.UTC(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)) / 86400000) + 25569;
  }
  function dayName(datum){ var p = datum.split('-'); return DNY[new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)).getDay()]; }
  function timeFrac(hhmm){
    if (!hhmm) return null;
    var p = String(hhmm).split(':'); var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return (h * 60 + m) / 1440;
  }
  function r2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }
  function workerName(id){ var w = id ? getWorkerById(id) : null; return w ? w.jmeno : (id ? '?' : ''); }
  function nowLabel(){
    var d = new Date();
    return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear() + ' v ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function venueName(ctx){ return (ctx.venue && ctx.venue.nazev) || 'Provozovna'; }
  function venueId(ctx){ return ctx.venue ? ctx.venue.id : null; }
  function slug(s){
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'export';
  }
  function workerIdSet(ctx){ var o = {}; ctx.workers.forEach(function(w){ o[w.id] = true; }); return o; }
  // Patří řádek (výplata, penalizace, ...) téhle provozovně? Kosatka je starší a její
  // záznamy můžou mít venue_id prázdné - u ní bereme i ty bez venue_id, ale jen
  // od brigádníků Kosatky.
  function belongs(ctx, row, ids){
    if (ctx.kosatka) return (row.venue_id == null || row.venue_id === venueId(ctx)) && ids[row.workerId];
    return row.venue_id === venueId(ctx);
  }

  // Generická tabulka -> list. cols: [{h, w, s}], rows: pole polí hodnot (nebo {v,s}).
  function table(name, title, sub, cols, rows, opt){
    opt = opt || {};
    var out = [];
    out.push([{ v: title, s: 'title' }]);
    out.push([{ v: sub, s: 'note' }]);
    out.push(cols.map(function(c){ return { v: c.h, s: 'hdr' }; }));
    var first = 4, last = 3 + rows.length;
    rows.forEach(function(r){
      out.push(r.map(function(v, i){
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) return v;
        if (v === null || v === undefined || v === '') return null;
        return { v: v, s: cols[i] ? cols[i].s : 'def' };
      }));
    });
    if (!rows.length) out.push([{ v: 'Za zvolené období tu nejsou žádná data.', s: 'note' }]);
    if (opt.totals && rows.length) {
      out.push([]);
      var tr = [];
      cols.forEach(function(c, i){
        if (i === (opt.totals.labelCol || 0)) { tr.push({ v: opt.totals.label || 'Celkem', s: 'tlabel' }); return; }
        if (opt.totals.sum.indexOf(i) !== -1) {
          var sum = 0;
          rows.forEach(function(r){ var cell = r[i]; var v = (cell !== null && typeof cell === 'object') ? cell.v : cell; if (typeof v === 'number') sum += v; });
          var L = Xlsx.colLetter(i);
          tr.push({ f: 'SUM(' + L + first + ':' + L + last + ')', v: r2(sum), s: 't' + (c.s === 'money' ? 'money' : (c.s === 'hours' ? 'hours' : 'int')) });
        } else tr.push({ v: '', s: 'tlabel' });
      });
      out.push(tr);
    }
    (opt.notes || []).forEach(function(n, i){ if (i === 0) out.push([]); out.push([{ v: n, s: 'note' }]); });
    return {
      name: name,
      cols: cols.map(function(c){ return c.w; }),
      rows: out,
      freeze: 3,
      hdrRow: 3,
      filter: rows.length ? ('A3:' + Xlsx.colLetter(cols.length - 1) + last) : null
    };
  }
  function subtitle(ctx, month){ return venueName(ctx) + ' · ' + periodLabel(month) + ' · vygenerováno ' + nowLabel(); }

  // ── Docházka: jeden řádek = jeden odpracovaný den brigádníka (stejné pravidlo jako při
  // počítání mzdy: den se bere jednou, budoucí dny se nepočítají). ──
  function dochazkaRows(ctx, month){
    var ids = workerIdSet(ctx), seen = {}, out = [], today = todayStr();
    var vid = venueId(ctx);
    PRACOVNI_DNY.forEach(function(p){
      if (!ids[p.workerId]) return;
      if (ctx.kosatka ? !(p.venue_id == null || p.venue_id === vid) : p.venue_id !== vid) return;
      if (!p.datum || p.datum > today || !inPeriod(p.datum, month)) return;
      var k = p.workerId + '|' + p.datum;
      if (seen[k]) return; seen[k] = true;
      var kompletni = !!(p.prichod && p.odchod);
      var hodiny = kompletni ? calcHodiny(p.prichod, p.odchod) : 0;
      var misto = null, sazba;
      if (ctx.kosatka) {
        var mistoId = getMistoProDen(p.workerId, p.datum);
        var st = mistoId ? getStanoviste(mistoId) : null;
        misto = st ? st.label : '';
        sazba = getSazba(mistoId, p.workerId);
      } else {
        sazba = getSazbaVenue(p.workerId, vid);
      }
      out.push({ datum: p.datum, workerId: p.workerId, jmeno: workerName(p.workerId), misto: misto, prichod: p.prichod || '', odchod: p.odchod || '',
        kompletni: kompletni, hodiny: hodiny, sazba: sazba, mzda: kompletni ? hodiny * sazba : 0 });
    });
    out.sort(function(a, b){ return a.datum.localeCompare(b.datum) || a.jmeno.localeCompare(b.jmeno, 'cs'); });
    return out;
  }

  function sheetDochazka(ctx, month){
    var rows = dochazkaRows(ctx, month), kos = ctx.kosatka;
    var cols = [{ h: 'Datum', w: 12, s: 'date' }, { h: 'Den', w: 6, s: 'def' }, { h: 'Brigádník', w: 26, s: 'def' }];
    if (kos) cols.push({ h: 'Stanoviště', w: 16, s: 'def' });
    cols.push({ h: 'Příchod', w: 9, s: 'time' }, { h: 'Odchod', w: 9, s: 'time' }, { h: 'Hodiny', w: 9, s: 'hours' },
      { h: 'Sazba (Kč/h)', w: 12, s: 'money' }, { h: 'Hrubá mzda', w: 14, s: 'money' }, { h: 'Poznámka', w: 22, s: 'def' });
    var data = rows.map(function(r){
      var row = [serial(r.datum), dayName(r.datum), r.jmeno];
      if (kos) row.push(r.misto);
      row.push(timeFrac(r.prichod), timeFrac(r.odchod), r.kompletni ? r.hodiny : null, r.sazba, r.kompletni ? r2(r.mzda) : null,
        r.kompletni ? '' : 'neúplný záznam (chybí příchod/odchod)');
      return row;
    });
    var hIdx = kos ? 6 : 5, mIdx = kos ? 8 : 7;
    var sh = table('Docházka', 'Docházka – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [hIdx, mIdx] } });
    sh._refs = { rows: rows.length, nameCol: 'C', hoursCol: Xlsx.colLetter(hIdx), wageCol: Xlsx.colLetter(mIdx) };
    return sh;
  }

  // Souhrn za brigádníka - vzorce nad listem Docházka (účetní si to může přepočítat/filtrovat).
  function sheetDochazkaSouhrn(ctx, month, dochSheet){
    var rows = dochazkaRows(ctx, month), by = {};
    rows.forEach(function(r){
      var b = by[r.workerId] || (by[r.workerId] = { jmeno: r.jmeno, dny: 0, hodiny: 0, mzda: 0 });
      b.dny++; b.hodiny += r.hodiny; b.mzda += r.mzda;
    });
    var list = Object.keys(by).map(function(k){ return by[k]; }).sort(function(a, b){ return a.jmeno.localeCompare(b.jmeno, 'cs'); });
    var cols = [{ h: 'Brigádník', w: 28, s: 'def' }, { h: 'Odpracované dny', w: 16, s: 'int' }, { h: 'Hodiny', w: 11, s: 'hours' }, { h: 'Hrubá mzda', w: 14, s: 'money' }];
    var ref = dochSheet._refs, last = 3 + ref.rows, nm = "'Docházka'!$" + ref.nameCol + '$4:$' + ref.nameCol + '$' + last;
    var hr = "'Docházka'!$" + ref.hoursCol + '$4:$' + ref.hoursCol + '$' + last;
    var wr = "'Docházka'!$" + ref.wageCol + '$4:$' + ref.wageCol + '$' + last;
    var data = list.map(function(b, i){
      var rr = 4 + i;
      return [b.jmeno,
        { f: 'COUNTIFS(' + nm + ',A' + rr + ',' + hr + ',"<>")', v: rows.filter(function(r){ return r.jmeno === b.jmeno && r.kompletni; }).length, s: 'int' },
        { f: 'SUMIFS(' + hr + ',' + nm + ',A' + rr + ')', v: roundH(b.hodiny), s: 'hours' },
        { f: 'SUMIFS(' + wr + ',' + nm + ',A' + rr + ')', v: r2(b.mzda), s: 'money' }];
    });
    var sh = table('Docházka – souhrn', 'Docházka – souhrn za brigádníka – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [1, 2, 3] } });
    return sh;
  }

  // ── Mzdy po měsících (hodiny × sazba), tak jak je počítá appka. ──
  function mzdyPoMesicich(ctx, month){
    var rows = dochazkaRows(ctx, month), map = {}, vid = venueId(ctx);
    rows.forEach(function(r){
      if (!r.kompletni) return;
      var key = r.datum.slice(0, 7) + '|' + r.workerId;
      var m = map[key] || (map[key] = { mesic: r.datum.slice(0, 7), workerId: r.workerId, jmeno: r.jmeno, dny: 0, hodiny: 0, mzda: 0, sazby: {} });
      m.dny++; m.hodiny += r.hodiny; m.mzda += r.mzda; m.sazby[r.sazba] = true;
    });
    var out = Object.keys(map).map(function(k){ return map[k]; });
    out.forEach(function(m){
      var sazbyList = Object.keys(m.sazby).map(Number);
      m.sazba = sazbyList.length === 1 ? sazbyList[0] : null;
      // Stejné zaokrouhlení jako appka (getVydelekVenueMonth: round(hodiny × sazba)).
      m.hruby = ctx.kosatka ? Math.round(m.mzda) : Math.round(m.hodiny * getSazbaVenue(m.workerId, vid));
      m.hodiny = roundH(m.hodiny);
    });
    out.sort(function(a, b){ return a.mesic.localeCompare(b.mesic) || a.jmeno.localeCompare(b.jmeno, 'cs'); });
    return out;
  }
  function sheetMzdyMesice(ctx, month){
    var list = mzdyPoMesicich(ctx, month);
    var cols = [{ h: 'Měsíc', w: 16, s: 'def' }, { h: 'Brigádník', w: 26, s: 'def' }, { h: 'Odpracované dny', w: 12, s: 'int' }, { h: 'Hodiny', w: 10, s: 'hours' },
      { h: 'Sazba (Kč/h)', w: 12, s: 'money' }, { h: 'Hrubá mzda', w: 14, s: 'money' }];
    var data = list.map(function(m){ return [monthLabelOfKey(m.mesic), m.jmeno, m.dny, m.hodiny, m.sazba, m.hruby]; });
    var notes = [];
    if (list.some(function(m){ return m.sazba === null; })) notes.push('Kde je sazba prázdná, měl brigádník v daném měsíci víc různých sazeb (různá stanoviště) – hrubá mzda je součet po dnech.');
    return table('Mzdy po měsících', 'Hrubé mzdy po měsících – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [2, 3, 5] }, notes: notes });
  }

  function vyplatyRows(ctx, month){
    var ids = workerIdSet(ctx);
    return VYPLATY.filter(function(v){ return belongs(ctx, v, ids) && inPeriod(v.datum, month); })
      .sort(function(a, b){ return (a.datum || '').localeCompare(b.datum || '') || a.id - b.id; });
  }
  function sheetVyplaty(ctx, month){
    var rows = vyplatyRows(ctx, month);
    var cols = [{ h: 'Datum výplaty', w: 14, s: 'date' }, { h: 'Brigádník', w: 26, s: 'def' }, { h: 'Vyplaceno', w: 14, s: 'money' }, { h: 'Za měsíce', w: 26, s: 'def' }, { h: 'Poznámka', w: 32, s: 'def' }];
    var data = rows.map(function(v){
      var mesice = {};
      (v.dny || []).forEach(function(d){ mesice[d.slice(0, 7)] = true; });
      var za = Object.keys(mesice).sort().map(function(k){ return MESICE[parseInt(k.slice(5, 7), 10)] + ' ' + k.slice(0, 4); }).join(', ');
      return [serial(v.datum), workerName(v.workerId), v.castka || 0, za, v.poznamka || ''];
    });
    return table('Výplaty', 'Vyplacené mzdy – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem vyplaceno', sum: [2] } });
  }

  // Aktuální stav: kolik komu zbývá vyplatit (nezávisí na zvoleném měsíci).
  function sheetKVyplate(ctx){
    var vid = venueId(ctx);
    var cols = [{ h: 'Brigádník', w: 28, s: 'def' }, { h: 'Nevyplacené hodiny', w: 14, s: 'hours' }, { h: 'Hrubá mzda', w: 14, s: 'money' }, { h: 'Penalizace', w: 13, s: 'money' },
      { h: 'Zálohy', w: 12, s: 'money' }, { h: 'K výplatě', w: 14, s: 'money' }, { h: 'Vyplaceno celkem', w: 16, s: 'money' }, { h: 'Dluh na účtech', w: 14, s: 'money' }];
    var data = ctx.workers.slice().sort(function(a, b){ return a.jmeno.localeCompare(b.jmeno, 'cs'); }).map(function(w){
      if (ctx.kosatka) {
        var k = getVydelek(w.id);
        return [w.jmeno, k.hodiny, Math.round(k.hruby), k.penalizaceTotal || 0, 0, Math.round(k.cisty), k.vyplaceno || 0, k.uctyDluh || 0];
      }
      var v = getVydelekVenue(w.id, vid);
      return [w.jmeno, v.hodiny, v.hruby, v.penalizaceTotal, v.zalohy, v.cisty, getVyplacenoVenue(vid, w.id), v.uctyDluh];
    });
    return table('K výplatě', 'Stav mezd k dnešnímu dni', venueName(ctx) + ' · stav k ' + nowLabel() + ' (nezávisí na zvoleném měsíci)', cols, data,
      { totals: { label: 'Celkem', sum: [1, 2, 3, 4, 5, 6, 7] }, notes: ['Dluh na účtech se od výplaty neodečítá – brigádník ho platí zvlášť.'] });
  }

  function penalizaceZalohyRows(ctx, month){
    var ids = workerIdSet(ctx), out = [];
    PENALIZACE.forEach(function(p){
      if (!belongs(ctx, p, ids) || !inPeriod(p.datum, month)) return;
      out.push({ datum: p.datum, typ: 'Penalizace', workerId: p.workerId, popis: p.duvod || '', pozn: p.poznamka || '', castka: p.castka || 0, stav: '' });
    });
    ZALOHY.forEach(function(z){
      if (!belongs(ctx, z, ids) || !inPeriod(z.datum, month)) return;
      out.push({ datum: z.datum, typ: 'Záloha', workerId: z.workerId, popis: '', pozn: z.poznamka || '', castka: z.castka || 0, stav: z.smazano ? 'uzavřená (vyrovnaná výplatou nebo smazaná)' : 'aktivní' });
    });
    out.sort(function(a, b){ return a.datum.localeCompare(b.datum) || a.typ.localeCompare(b.typ, 'cs'); });
    return out;
  }
  function sheetPenalizaceZalohy(ctx, month){
    var rows = penalizaceZalohyRows(ctx, month);
    var cols = [{ h: 'Datum', w: 12, s: 'date' }, { h: 'Typ', w: 12, s: 'def' }, { h: 'Brigádník', w: 26, s: 'def' }, { h: 'Důvod / poznámka', w: 34, s: 'def' }, { h: 'Částka', w: 13, s: 'money' }, { h: 'Stav', w: 36, s: 'def' }];
    var data = rows.map(function(r){ return [serial(r.datum), r.typ, workerName(r.workerId), [r.popis, r.pozn].filter(Boolean).join(' – '), r.castka, r.stav]; });
    return table('Penalizace a zálohy', 'Penalizace a zálohy – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [4] } });
  }

  // ── Tržby: jeden řádek = tržba jednoho místa za jeden den. ──
  function trzbyRows(ctx, month){
    var vid = venueId(ctx);
    return TRZBY.filter(function(t){
      if (ctx.kosatka ? !(t.venue_id == null || t.venue_id === vid) : t.venue_id !== vid) return false;
      return inPeriod(t.datum, month);
    }).sort(function(a, b){ return a.datum.localeCompare(b.datum) || String(a.mistoId).localeCompare(String(b.mistoId)); });
  }
  function mistoLabel(ctx, mistoId){
    if (ctx.kosatka) { var st = getStanoviste(mistoId); return st ? st.label : String(mistoId || ''); }
    var m = getTrzbaMistaForVenue(ctx.venue).filter(function(x){ return x.mistoId === mistoId; })[0];
    return (m && m.label) || (mistoId === 'hlavni' || !mistoId ? 'Hlavní' : String(mistoId));
  }
  function sheetTrzby(ctx, month){
    var rows = trzbyRows(ctx, month);
    var cols = [{ h: 'Datum', w: 12, s: 'date' }, { h: 'Den', w: 6, s: 'def' }, { h: 'Místo', w: 18, s: 'def' }, { h: 'Hotově', w: 13, s: 'money' }, { h: 'Kartou', w: 13, s: 'money' },
      { h: 'Celkem', w: 14, s: 'money' }, { h: 'Zapsal', w: 24, s: 'def' }, { h: 'Poznámka', w: 30, s: 'def' }];
    var bezRozpadu = false;
    var data = rows.map(function(t){
      if (t.hotove == null && t.kartou == null) bezRozpadu = true;
      return [serial(t.datum), dayName(t.datum), mistoLabel(ctx, t.mistoId), t.hotove != null ? t.hotove : null, t.kartou != null ? t.kartou : null, t.castka || 0, workerName(t.workerId), t.poznamka || ''];
    });
    var notes = bezRozpadu ? ['U některých (starších) záznamů není zapsaný rozpad na hotově/kartou, takže Hotově + Kartou nemusí dávat Celkem.'] : [];
    return table('Tržby', 'Tržby – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [3, 4, 5] }, notes: notes });
  }

  // ── Náklady a faktury (faktury + výdaje z pokladny, jako záložka Náklady). ──
  function sheetNaklady(ctx, month){
    var rows = getVsechnyNakladyVenueMonth(venueId(ctx), EXPORT_YEAR, month).slice().sort(function(a, b){
      return (a.datum || '').localeCompare(b.datum || '') || (a.id - b.id);
    });
    var cols = [{ h: 'Datum', w: 12, s: 'date' }, { h: 'Popis', w: 42, s: 'def' }, { h: 'Zdroj', w: 16, s: 'def' }, { h: 'Kategorie', w: 14, s: 'def' }, { h: 'Zapsal', w: 22, s: 'def' }, { h: 'Částka', w: 14, s: 'money' }, { h: 'Poznámka', w: 34, s: 'def' }];
    var maMzdy = false;
    var data = rows.map(function(n){
      var pozn = '';
      if (n.zdroj !== 'faktura' && /^(Výplata mzdy|Záloha) –/.test(n.popis || '')) { pozn = 'mzda/záloha – propsáno z Výplat'; maMzdy = true; }
      return [serial(n.datum), n.popis || '', n.zdroj === 'faktura' ? 'faktura / náklad' : n.zdroj, (n.kategorie && getNakladKategorieLabel(n.kategorie)) || '', workerName(n.workerId), n.castka || 0, pozn];
    });
    var notes = maMzdy ? ['Výdaje z pokladny zahrnují i vyplacené mzdy a zálohy (jsou označené v poznámce) – pozor, ať se neúčtují dvakrát spolu s listem Výplaty.'] : [];
    return table('Náklady a faktury', 'Náklady a faktury – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [5] }, notes: notes });
  }

  // ── Pokladní kniha (jen provozovny s pokladnou, ne Kosatka). ──
  function sheetPokladna(ctx, month){
    var vid = venueId(ctx), rows = [];
    var ucty = ['hotovost'];
    if (typeof isOnlinePenezenkaVenue === 'function' && isOnlinePenezenkaVenue(ctx.venue)) ucty.push('online');
    ucty.forEach(function(u){
      getPokladnaForVenueMonth(vid, u, EXPORT_YEAR, month).forEach(function(p){ rows.push({ p: p, ucet: u }); });
    });
    rows.sort(function(a, b){ return (a.p.datum || '').localeCompare(b.p.datum || '') || (a.p.id - b.p.id); });
    var cols = [{ h: 'Datum', w: 12, s: 'date' }, { h: 'Účet', w: 16, s: 'def' }, { h: 'Popis', w: 46, s: 'def' }, { h: 'Příjem', w: 13, s: 'money' }, { h: 'Výdaj', w: 13, s: 'money' }, { h: 'Zapsal', w: 24, s: 'def' }];
    var data = rows.map(function(r){
      var p = r.p;
      return [serial(p.datum), r.ucet === 'online' ? 'online peněženka' : 'hotovost', p.popis || '', p.typ === 'prijem' ? p.castka : null, p.typ === 'vydaj' ? p.castka : null, workerName(p.worker_id)];
    });
    return table('Pokladna', 'Pokladní kniha – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [3, 4] } });
  }

  // ── Statistiky: přehled, měsíční přehled a souhrn za brigádníky. ──
  function sheetStatPrehled(ctx, month){
    var vid = venueId(ctx), z = getZiskVenueMonth(vid, EXPORT_YEAR, month);
    var rows = dochazkaRows(ctx, month), hodiny = 0, mzdy = 0;
    mzdyPoMesicich(ctx, month).forEach(function(m){ hodiny += m.hodiny; mzdy += m.hruby; });
    var totalDluh = 0;
    ctx.workers.forEach(function(w){
      if (ctx.kosatka) totalDluh += (getVydelek(w.id).uctyDluh || 0); else totalDluh += getVydelekVenue(w.id, vid).uctyDluh;
    });
    var M = function(v){ return { v: v, s: 'money' }; };
    var data = [
      ['Tržby', M(z.trzby), ''],
      ['Náklady (faktury a náklady)', M(z.naklady), ''],
      ['Vyplacené mzdy', M(z.vyplaty), 'podle data výplaty'],
      [{ v: 'Čistý zisk', s: 'bold' }, { v: z.zisk, s: 'boldmoney' }, 'tržby − náklady − vyplacené mzdy'],
      ['Odpracované hodiny', { v: roundH(hodiny), s: 'hours' }, 'jen kompletní záznamy docházky'],
      ['Hrubé mzdy za odpracované hodiny', M(mzdy), 'odpracované hodiny × sazba (ne nutně vyplacené)'],
      ['Počet brigádníků', { v: ctx.workers.length, s: 'int' }, ''],
      ['Dluh na účtech celkem', M(totalDluh), 'stav k dnešku']
    ];
    if (!ctx.kosatka) {
      data.push(['Zůstatek v pokladně (hotovost)', M(getPokladnaZustatek(vid)), 'stav k dnešku']);
      if (typeof isOnlinePenezenkaVenue === 'function' && isOnlinePenezenkaVenue(ctx.venue)) data.push(['Zůstatek online peněženky', M(getPokladnaZustatek(vid, 'online')), 'stav k dnešku']);
    }
    var kat = getNakladyKategorieSoucty(vid, EXPORT_YEAR, month);
    data.push([{ v: '', s: 'def' }, '', '']);
    data.push([{ v: 'Náklady podle kategorie', s: 'bold' }, '', '']);
    NAKLAD_KATEGORIE.forEach(function(k){ data.push([k.label, M(kat[k.key]), '']); });
    var cols = [{ h: 'Ukazatel', w: 38, s: 'def' }, { h: 'Hodnota', w: 18, s: 'money' }, { h: 'Poznámka', w: 48, s: 'def' }];
    var sh = table('Statistiky', 'Statistiky – ' + periodLabel(month), subtitle(ctx, month), cols, data, {});
    sh.filter = null;
    return sh;
  }
  function sheetStatMesice(ctx){
    var vid = venueId(ctx), all = mzdyPoMesicich(ctx, 'all'), byM = {};
    all.forEach(function(m){ var b = byM[m.mesic] || (byM[m.mesic] = { hodiny: 0, hruby: 0 }); b.hodiny += m.hodiny; b.hruby += m.hruby; });
    var data = [];
    for (var m = 1; m <= 12; m++) {
      var z = getZiskVenueMonth(vid, EXPORT_YEAR, m), key = EXPORT_YEAR + '-' + String(m).padStart(2, '0'), b = byM[key] || { hodiny: 0, hruby: 0 };
      if (!z.trzby && !z.naklady && !z.vyplaty && !b.hodiny) continue;
      data.push([MESICE[m] + ' ' + EXPORT_YEAR, z.trzby, z.naklady, z.vyplaty, null, roundH(b.hodiny), b.hruby, z.zisk]);
    }
    // Čistý zisk jako vzorec (sloupec E) = tržby − náklady − mzdy; hodnota vedle ve sloupci H je kontrolní (z appky).
    var cols = [{ h: 'Měsíc', w: 20, s: 'def' }, { h: 'Tržby', w: 14, s: 'money' }, { h: 'Náklady', w: 14, s: 'money' }, { h: 'Vyplacené mzdy', w: 15, s: 'money' },
      { h: 'Čistý zisk', w: 14, s: 'money' }, { h: 'Odpracované hodiny', w: 12, s: 'hours' }, { h: 'Hrubé mzdy (hodiny × sazba)', w: 16, s: 'money' }];
    var rows = data.map(function(r, i){
      var rr = 4 + i;
      return [r[0], r[1], r[2], r[3], { f: 'B' + rr + '-C' + rr + '-D' + rr, v: r2(r[7]), s: 'money' }, r[5], r[6]];
    });
    return table('Měsíční přehled', 'Měsíční přehled – celá sezóna ' + EXPORT_YEAR, venueName(ctx) + ' · vygenerováno ' + nowLabel() + ' (nezávisí na zvoleném měsíci)', cols, rows, { totals: { label: 'Celkem', sum: [1, 2, 3, 4, 5, 6] } });
  }
  function sheetStatBrigadnici(ctx, month){
    var rows = dochazkaRows(ctx, month), by = {};
    rows.forEach(function(r){ if (!r.kompletni) return; var b = by[r.workerId] || (by[r.workerId] = { jmeno: r.jmeno, dny: 0 }); b.dny++; });
    var mz = {};
    mzdyPoMesicich(ctx, month).forEach(function(m){ var b = mz[m.workerId] || (mz[m.workerId] = { hodiny: 0, hruby: 0 }); b.hodiny += m.hodiny; b.hruby += m.hruby; });
    var vid = venueId(ctx);
    var data = ctx.workers.slice().sort(function(a, b){ return a.jmeno.localeCompare(b.jmeno, 'cs'); }).map(function(w){
      var d = by[w.id] ? by[w.id].dny : 0, m = mz[w.id] || { hodiny: 0, hruby: 0 };
      var dluh = ctx.kosatka ? (getVydelek(w.id).uctyDluh || 0) : getVydelekVenue(w.id, vid).uctyDluh;
      return [w.jmeno, d, roundH(m.hodiny), m.hruby, dluh];
    });
    var cols = [{ h: 'Brigádník', w: 28, s: 'def' }, { h: 'Odpracované dny', w: 14, s: 'int' }, { h: 'Hodiny', w: 11, s: 'hours' }, { h: 'Hrubá mzda', w: 14, s: 'money' }, { h: 'Dluh na účtech (k dnešku)', w: 18, s: 'money' }];
    return table('Brigádníci', 'Brigádníci – ' + periodLabel(month), subtitle(ctx, month), cols, data, { totals: { label: 'Celkem', sum: [1, 2, 3, 4] } });
  }

  // Přehled reportů: klíč -> popis + funkce, co vrátí listy.
  var REPORTS = {
    dochazka:  { label: 'Docházka',               desc: 'Každý odpracovaný den: příchod, odchod, hodiny, sazba, mzda. Plus souhrn za brigádníka.',        build: function(c, m){ var d = sheetDochazka(c, m); return [d, sheetDochazkaSouhrn(c, m, d)]; }, count: function(c, m){ return dochazkaRows(c, m).length; } },
    mzdy:      { label: 'Mzdy a výplaty',         desc: 'Hrubé mzdy po měsících, vyplacené částky, stav „k výplatě“, penalizace a zálohy.',                 build: function(c, m){ return [sheetMzdyMesice(c, m), sheetVyplaty(c, m), sheetKVyplate(c), sheetPenalizaceZalohy(c, m)]; }, count: function(c, m){ return mzdyPoMesicich(c, m).length + vyplatyRows(c, m).length; } },
    trzby:     { label: 'Tržby',                  desc: 'Denní tržby po místech, rozpad hotově/kartou.',                                                    build: function(c, m){ return [sheetTrzby(c, m)]; }, count: function(c, m){ return trzbyRows(c, m).length; } },
    naklady:   { label: 'Náklady a faktury',      desc: 'Faktury a náklady i výdaje z pokladny, s kategorií.',                                              build: function(c, m){ return [sheetNaklady(c, m)]; }, count: function(c, m){ return getVsechnyNakladyVenueMonth(venueId(c), EXPORT_YEAR, m).length; } },
    pokladna:  { label: 'Pokladní kniha',         desc: 'Příjmy a výdaje v hotovostní pokladně (a online peněžence).',                                       build: function(c, m){ return [sheetPokladna(c, m)]; }, count: function(c, m){ return getPokladnaForVenueMonth(venueId(c), 'hotovost', EXPORT_YEAR, m).length; }, notKosatka: true },
    statistiky:{ label: 'Statistiky',             desc: 'Tržby, náklady, mzdy a zisk; měsíční přehled sezóny a souhrn za brigádníky.',                       build: function(c, m){ return [sheetStatPrehled(c, m), sheetStatMesice(c), sheetStatBrigadnici(c, m)]; }, count: function(c, m){ return mzdyPoMesicich(c, m).length; } }
  };

  function availableKeys(ctx){
    return Object.keys(REPORTS).filter(function(k){ return !(REPORTS[k].notKosatka && ctx.kosatka); });
  }
  function buildSheets(ctx, keys, month){
    var sheets = [];
    keys.forEach(function(k){ if (REPORTS[k]) sheets = sheets.concat(REPORTS[k].build(ctx, month)); });
    return sheets;
  }
  function fileName(ctx, keys, month){
    var all = availableKeys(ctx);
    var part = (keys.length === all.length) ? 'pro-ucetni' : (keys.length === 1 ? keys[0] : keys.join('-'));
    return slug(venueName(ctx)) + '_' + part + '_' + periodTag(month) + '.xlsx';
  }

  return { REPORTS: REPORTS, availableKeys: availableKeys, buildSheets: buildSheets, fileName: fileName, periodLabel: periodLabel,
    dochazkaRows: dochazkaRows, mzdyPoMesicich: mzdyPoMesicich, vyplatyRows: vyplatyRows, trzbyRows: trzbyRows, slug: slug, serial: serial };
})();


// ───────────────────────── 3) UI ─────────────────────────
// Stáhne vybrané reporty jako jeden .xlsx. month = 1..12 nebo 'all'.
function exportDownload(keys, month){
  var ctx = exportContext();
  if (!ctx || !ctx.workers) { alert('Export se teď nepodařilo připravit, zkus obnovit stránku.'); return; }
  if (typeof LOAD_OK !== 'undefined') {
    var spatne = Object.keys(LOAD_OK).filter(function(k){ return !LOAD_OK[k]; });
    if (spatne.length && !confirm('Pozor: některá data se nepodařilo načíst (' + spatne.join(', ') + '). Export by mohl být neúplný – opravdu ho stáhnout?\n\nLepší je stránku obnovit (F5) a export udělat znovu.')) return;
  }
  try {
    var sheets = ExportReports.buildSheets(ctx, keys, month);
    Xlsx.download(ExportReports.fileName(ctx, keys, month), sheets);
  } catch (e) {
    console.error('Export selhal:', e);
    alert('Export se nepovedl: ' + (e && e.message ? e.message : e));
  }
}
// Tlačítko u jedné sekce (např. exportReport('dochazka', dochMonth)).
function exportReport(key, month){ exportDownload([key], month); }

// HTML malého tlačítka "Excel" pro hlavičku sekce. monthExpr je JS výraz (text), který se
// vyhodnotí až při kliknutí - ať export bere měsíc, který má admin zrovna vybraný.
function exportBtnHtml(key, monthExpr){
  return '<button type="button" class="btn btn-sm btn-secondary ex-btn" title="Stáhnout tuhle sekci jako Excel (.xlsx)" onclick="exportReport(\'' + key + '\', ' + (monthExpr || "'all'") + ')">⬇ Excel</button>';
}

var ExportUI = (function(){
  var state = { month: new Date().getFullYear() === EXPORT_YEAR ? (new Date().getMonth() + 1) : 'all', keys: null };
  var STYLE_ID = 'export-ui-style';
  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style'); st.id = STYLE_ID;
    st.textContent =
      '.ex-wrap{max-width:760px}'+
      '.ex-lead{font-size:14px;color:var(--text-muted,#5d6678);margin:0 0 14px;line-height:1.5}'+
      '.ex-label{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted,#5d6678);margin:16px 0 8px}'+
      '.ex-months{display:flex;flex-wrap:wrap;gap:6px}'+
      '.ex-list{display:flex;flex-direction:column;gap:8px}'+
      '.ex-row{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--sand-dark,#e1e4ea);border-radius:12px;cursor:pointer;background:#fff}'+
      '.ex-row:hover{border-color:var(--water,#2c4fd1)}'+
      '.ex-row input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:var(--water,#2c4fd1)}'+
      '.ex-row b{display:block;font-size:14px}'+
      '.ex-row span{display:block;font-size:12.5px;color:var(--text-muted,#5d6678);margin-top:2px}'+
      '.ex-row em{margin-left:auto;font-style:normal;font-size:12px;color:var(--text-muted,#5d6678);white-space:nowrap;padding-left:8px}'+
      '.ex-go{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px}'+
      '.ex-go .btn{min-height:44px;font-size:15px}'+
      '.ex-note{font-size:12.5px;color:var(--text-muted,#5d6678);margin-top:14px;line-height:1.5}'+
      '.ex-btn{white-space:nowrap}'+
      '.card-title.ex-title{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}';
    document.head.appendChild(st);
  }
  var MONTHS = [['Led', 1], ['Úno', 2], ['Bře', 3], ['Dub', 4], ['Kvě', 5], ['Čer', 6], ['Čvc', 7], ['Srp', 8], ['Zář', 9], ['Říj', 10], ['Lis', 11], ['Pro', 12]];

  function render(containerId){
    injectStyle();
    var el = document.getElementById(containerId);
    if (!el) return;
    var ctx = exportContext();
    var keys = ExportReports.availableKeys(ctx);
    if (!state.keys) state.keys = keys.slice();
    state.keys = state.keys.filter(function(k){ return keys.indexOf(k) !== -1; });
    var h = '<div class="card ex-wrap"><div class="card-title">Export pro účetní</div>'+
      '<p class="ex-lead">Stáhne Excel (.xlsx) s přehledy za zvolené období. Čísla jsou stejná jako v aplikaci. Každý přehled je zvlášť list, jde v nich filtrovat a sčítat.</p>'+
      '<div class="ex-label">Období</div><div class="ex-months">'+
      MONTHS.map(function(m){ return '<button type="button" class="btn btn-sm ' + (state.month === m[1] ? 'btn-primary' : 'btn-secondary') + '" onclick="ExportUI.setMonth(' + m[1] + ')">' + m[0] + '</button>'; }).join('')+
      '<button type="button" class="btn btn-sm ' + (state.month === 'all' ? 'btn-primary' : 'btn-secondary') + '" onclick="ExportUI.setMonth(\'all\')">📊 Celá sezóna</button></div>'+
      '<div class="ex-label">Co exportovat</div><div class="ex-list">'+
      keys.map(function(k){
        var r = ExportReports.REPORTS[k], n = r.count(ctx, state.month);
        return '<label class="ex-row"><input type="checkbox" ' + (state.keys.indexOf(k) !== -1 ? 'checked' : '') + ' onchange="ExportUI.toggle(\'' + k + '\', this.checked)"/>'+
          '<div><b>' + r.label + '</b><span>' + r.desc + '</span></div><em>' + n + ' ' + (n === 1 ? 'řádek' : (n >= 2 && n <= 4 ? 'řádky' : 'řádků')) + '</em></label>';
      }).join('')+
      '</div>'+
      '<div class="ex-go"><button type="button" class="btn btn-primary" id="ex-go-btn" onclick="ExportUI.go()"' + (state.keys.length ? '' : ' disabled') + '>⬇ Stáhnout Excel</button>'+
      '<span style="font-size:13px;color:var(--text-muted,#5d6678);">' + ExportReports.periodLabel(state.month) + ' · ' + state.keys.length + ' z ' + keys.length + ' přehledů</span></div>'+
      '<p class="ex-note">Do exportu se nepočítají budoucí dny. Záznamy docházky bez příchodu nebo odchodu jsou v listu označené jako neúplné a do hodin se nezapočítají. List „K výplatě“ a „Měsíční přehled“ ukazují vždy aktuální stav / celou sezónu, bez ohledu na vybraný měsíc.</p></div>';
    el.innerHTML = h;
  }
  function setMonth(m){ state.month = m; render(ExportUI._cid); }
  function toggle(k, on){
    var i = state.keys.indexOf(k);
    if (on && i === -1) state.keys.push(k);
    if (!on && i !== -1) state.keys.splice(i, 1);
    var b = document.getElementById('ex-go-btn'); if (b) b.disabled = !state.keys.length;
    render(ExportUI._cid);
  }
  function go(){
    var ctx = exportContext();
    var order = ExportReports.availableKeys(ctx).filter(function(k){ return state.keys.indexOf(k) !== -1; });
    if (order.length) exportDownload(order, state.month);
  }
  function mount(containerId){ ExportUI._cid = containerId; render(containerId); }
  return { mount: mount, setMonth: setMonth, toggle: toggle, go: go, state: state, injectStyle: injectStyle, _cid: null };
})();

// Styl tlačítek u sekcí je potřeba hned (ne až po otevření záložky Export).
try { if (typeof document !== 'undefined' && document.head) ExportUI.injectStyle(); } catch (e) {}
