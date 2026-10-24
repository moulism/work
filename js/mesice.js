// js/mesice.js - měsíční přehled hodin, mzdy a výplat (hezké zobrazení).
// Data počítá getMesicniPrehled()/getMesicniSouhrn() v data.js; tady je jen
// vykreslení, sdílené brigádníkem (podnik.html, app.html) i adminem
// (podnik-admin.html, admin.html), ať oba vidí stejná čísla stejným způsobem.
(function () {
  'use strict';

  var CSS = '' +
    '.mp-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;}' +
    '.mp-sum>div{background:var(--sand,#f4f1ea);border-radius:10px;padding:9px 11px;}' +
    '.mp-sum .l{font-size:11px;color:var(--text-muted,#6b7280);}' +
    '.mp-sum .v{font-size:16px;font-weight:700;margin-top:2px;}' +
    '.mp-m{border:1px solid var(--sand-dark,#e3ddd0);border-radius:12px;margin-bottom:8px;background:var(--white,#fff);overflow:hidden;}' +
    '.mp-m>summary{list-style:none;cursor:pointer;padding:10px 12px;display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:center;}' +
    '.mp-m>summary::-webkit-details-marker{display:none;}' +
    '.mp-m>summary .t{font-weight:700;font-size:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}' +
    '.mp-m>summary .n{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:var(--text-muted,#6b7280);justify-content:flex-end;text-align:right;}' +
    '.mp-m>summary .n b{color:var(--text,#1f2937);font-weight:600;}' +
    '.mp-m>summary::after{content:"▾";grid-column:2;grid-row:1;justify-self:end;font-size:12px;color:var(--text-muted,#6b7280);display:none;}' +
    '.mp-m[open]{box-shadow:0 1px 6px rgba(0,0,0,.06);}' +
    '.mp-body{padding:2px 12px 12px;border-top:1px dashed var(--sand-dark,#e3ddd0);font-size:13px;}' +
    '.mp-h{font-size:11px;font-weight:700;letter-spacing:.03em;color:var(--text-muted,#6b7280);margin:10px 0 4px;text-transform:uppercase;}' +
    '.mp-pay{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:0.5px solid var(--sand-dark,#e3ddd0);}' +
    '.mp-days{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;}' +
    '.mp-d{border:1px solid var(--sand-dark,#e3ddd0);border-radius:8px;padding:5px 8px;font-size:12px;display:flex;justify-content:space-between;gap:6px;}' +
    '.mp-d.ok{background:#eef8f0;border-color:#cfe9d5;}' +
    '.mp-d.cek{background:#fff7ea;border-color:#f3dcb4;}' +
    '.mp-b{display:inline-block;font-size:10.5px;font-weight:700;border-radius:999px;padding:2px 8px;}' +
    '.mp-b.ok{background:#dcf3e2;color:#14652b;}' +
    '.mp-b.cast{background:#fdebc8;color:#7a4b00;}' +
    '.mp-b.cek{background:#fde3d3;color:#8a3a10;}' +
    '.mp-b.ted{background:#e1e9fb;color:#1c3a8a;}' +
    '.mp-b.no{background:#eceef3;color:#4a5263;}' +
    '.mp-slip{margin-top:6px;}' +
    '.mp-r{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:5px 0;border-bottom:0.5px solid var(--sand-dark,#e3ddd0);}' +
    '.mp-r .k{flex:1;}' +
    '.mp-r .k small{display:block;font-size:11px;color:var(--text-muted,#6b7280);margin-top:1px;}' +
    '.mp-r .v{font-weight:600;white-space:nowrap;text-align:right;}' +
    '.mp-r.minus .v{color:#a12b2b;}' +
    '.mp-r.sum{border-top:1.5px solid var(--text,#1f2937);border-bottom:none;font-weight:700;font-size:14px;padding-top:7px;margin-top:2px;}' +
    '.mp-r.hrubá .v{font-size:14px;}' +
    '.mp-r.pozn{font-size:12px;color:var(--text-muted,#6b7280);}' +
    '.mp-li{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:3px 0;color:var(--text-muted,#6b7280);}' +
    '.mp-li b{color:var(--text,#1f2937);font-weight:600;white-space:nowrap;}' +
    '.mp-note{font-size:11px;color:var(--text-muted,#6b7280);margin-top:8px;}' +
    '.mp-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}' +
    '.mp-chip{font-size:10.5px;font-weight:600;border-radius:999px;padding:2px 8px;white-space:nowrap;}' +
    '.mp-chip.ok{background:#dcf3e2;color:#14652b;}' +
    '.mp-chip.cek{background:#fde3d3;color:#8a3a10;}' +
    '.mp-chip.cast{background:#fdebc8;color:#7a4b00;}' +
    '.mp-tbl{width:100%;border-collapse:collapse;font-size:13px;}' +
    '.mp-tbl th{text-align:left;font-size:11px;color:var(--text-muted,#6b7280);font-weight:600;padding:6px 8px;border-bottom:1px solid var(--sand-dark,#e3ddd0);}' +
    '.mp-tbl td{padding:7px 8px;border-bottom:0.5px solid var(--sand-dark,#e3ddd0);}' +
    '.mp-tbl td.r,.mp-tbl th.r{text-align:right;}' +
    '.mp-tbl tr.tot td{font-weight:700;background:var(--sand,#f4f1ea);border-bottom:none;}' +
    '.mp-pick{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}' +
    '.mp-pk{border:1.5px solid var(--sand-dark,#e3ddd0);background:var(--white,#fff);border-radius:999px;padding:8px 13px;font-size:13px;font-weight:600;font-family:inherit;color:var(--text,#1f2937);cursor:pointer;line-height:1.2;max-width:100%;}' +
    '.mp-pk.all{border-style:dashed;}' +
    '.mp-pk.on{background:var(--water,#2f4bc7);border-color:var(--water,#2f4bc7);color:#fff;border-style:solid;}' +
    '.mp-pk small{font-size:11px;font-weight:700;margin-left:3px;}' +
    '.mp-hd{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px;font-size:17px;font-weight:800;}' +
    '.mp-sum .s{font-size:10.5px;color:var(--text-muted,#6b7280);margin-top:2px;}' +
    '.mp-sum>div.hl{background:#e4eafc;}.mp-sum>div.gr{background:#e6f5ea;}.mp-sum>div.or{background:#fff1dc;}.mp-sum>div.rd{background:#fbe9e9;}' +
    '.mp-view{font-size:13px;}' +
    '@media(min-width:641px){.mp-tbl td.r{white-space:nowrap;}}' +
    '.mp-sec{margin-top:16px;}' +
    'tr.mp-click{cursor:pointer;}tr.mp-click:hover td{background:var(--sand,#f4f1ea);}' +
    '.mp-hint{font-size:12px;color:var(--text-muted,#6b7280);margin:0 0 8px;}' +
    '@media(max-width:560px){.mp-m>summary{grid-template-columns:1fr;}.mp-m>summary .n{justify-content:flex-start;text-align:left;}}' +
    // Na telefonu se široké tabulky (class mpr) přepnou na karty: jeden řádek = jedna karta, popisek vlevo, hodnota vpravo.
    '@media(max-width:640px){' +
    'table.mpr thead{display:none;}' +
    'table.mpr{min-width:0 !important;}' +
    'table.mpr td:first-child{position:static !important;box-shadow:none !important;}' +
    '.schedule-wrap:has(table.mpr)::after{display:none !important;}' +
    'table.mpr,table.mpr tbody,table.mpr tr,table.mpr td{display:block;width:100%;box-sizing:border-box;}' +
    'table.mpr tr{border:1px solid var(--sand-dark,#e3ddd0);border-radius:12px;margin-bottom:10px;padding:8px 12px;background:var(--white,#fff);}' +
    'table.mpr tr.tot{background:var(--sand,#f4f1ea);}' +
    'table.mpr td{display:flex;justify-content:space-between;align-items:center;gap:12px;border:none !important;padding:4px 0 !important;text-align:right;background:none !important;}' +
    'table.mpr td::before{content:attr(data-l);font-size:11.5px;font-weight:600;color:var(--text-muted,#6b7280);text-align:left;flex:0 0 auto;}' +
    'table.mpr td[data-l=""]{display:block;text-align:left;}' +
    'table.mpr td.mp-x{display:none;}' +
    'table.mpr td[data-l=""]::before{display:none;}' +
    'table.mpr td.mp-act .btn{width:100%;margin-top:4px;}' +
    '.mp-m>summary .t{font-size:15px;}' +
    '}';

  function injectCss() {
    if (document.getElementById('mp-css')) return;
    var st = document.createElement('style'); st.id = 'mp-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kc(n) { return Math.round(n || 0).toLocaleString('cs-CZ') + ' Kč'; }
  function hh(n) { return (Math.round((n || 0) * 100) / 100).toLocaleString('cs-CZ') + ' h'; }
  function dat(d) { return (typeof formatDate === 'function') ? formatDate(d) : d; }

  function stavBadge(m) {
    var ted = m.aktualni ? ' <span class="mp-b ted">probíhá</span>' : '';
    if (m.stav === 'vyplaceno') return '<span class="mp-b ok">✓ Vyplaceno' + (m.aktualni ? ' k dnešku' : '') + '</span>' + ted;
    if (m.stav === 'castecne') return '<span class="mp-b cast">Část. vyplaceno</span>' + ted;
    if (m.stav === 'ceka') return '<span class="mp-b cek">Čeká na výplatu</span>' + ted;
    return '<span class="mp-b no">bez hodin</span>' + ted;
  }


  // ---------- společné stavební kameny ----------
  var views = {}, seq = 0;
  function ensure(el) {
    if (!el._mpid) { el._mpid = 'mpv' + (++seq); }
    if (!views[el._mpid]) views[el._mpid] = { el: el, sel: null };
    return views[el._mpid];
  }
  function maData(m) { return m.dny.length || m.vyplaceno || m.penalizace || m.zalohy.celkem || m.ucty.celkem; }
  // Výplata s odečtenými účty má v poznámce "odečteno za účty: N Kč" (viz addVyplata*).
  function uctyZVyplaty(poznamka) { var m = /odečteno za účty: (\d+)/.exec(poznamka || ''); return m ? parseInt(m[1], 10) : 0; }
  function vRuce(castka, poznamka) {
    var u = uctyZVyplaty(poznamka);
    return u ? '<small style="display:block;font-weight:400;color:var(--text-muted,#6b7280);">z toho účty −' + kc(u) + ' · v hotovosti ' + kc(castka - u) + '</small>' : '';
  }
  function pocetDni(n) { return n + ' ' + (n === 1 ? 'den' : (n > 1 && n < 5 ? 'dny' : 'dní')); }
  function tiles(arr) {
    return '<div class="mp-sum">' + arr.map(function (t) {
      return '<div class="' + (t.cls || '') + '"><div class="l">' + t.l + '</div><div class="v"' + (t.col ? ' style="color:' + t.col + ';"' : '') + '>' + t.v + '</div>' + (t.s ? '<div class="s">' + t.s + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function picker(id, polozky, sel) {
    var html = '<div class="mp-pick">' + polozky.map(function (p) {
      return '<button type="button" class="mp-pk ' + (p.all ? 'all ' : '') + (p.key === sel ? 'on' : '') + '" onclick="MP.pick(\'' + id + '\',\'' + p.key + '\')">' + esc(p.label) + (p.mark ? '<small>' + p.mark + '</small>' : '') + '</button>';
    }).join('') + '</div>';
    return html;
  }
  function mesicPolozky(mesice) {
    var out = [{ key: 'all', label: '∑ Všechny měsíce dohromady', all: true }];
    mesice.forEach(function (m) {
      var mark = m.stav === 'vyplaceno' ? '✓' : (m.stav === 'nic' ? '' : '⏳');
      out.push({ key: m.key, label: m.label, mark: mark });
    });
    return out;
  }
  // Výplatní páska (výpočet mzdy) - stejné řádky pro měsíc i pro "vše dohromady".
  function slip(o) {
    function radek(klic, hodnota, cls, pozn) {
      return '<div class="mp-r ' + (cls || '') + '"><div class="k">' + klic + (pozn ? '<small>' + pozn + '</small>' : '') + '</div><div class="v">' + hodnota + '</div></div>';
    }
    var u = o.u;
    return '<div class="mp-slip">' +
      radek('Odpracováno <b>' + esc(hh(o.hodiny)) + '</b>' + (o.sazba ? ' × ' + kc(o.sazba) + '/h' : ''), kc(o.hruby), 'hrubá', o.sub) +
      (o.pen ? radek('Penalizace', '−' + kc(o.pen), 'minus', o.penN ? o.penN + '×' : '') : '') +
      (o.zOdectene ? radek('Zálohy odečtené při výplatě', '−' + kc(o.zOdectene), 'minus') : '') +
      (o.zOtevrene ? radek('Zálohy (odečtou se z příští výplaty)', '−' + kc(o.zOtevrene), 'minus') : '') +
      radek('Čistá mzda', kc(o.cista), 'sum', 'hrubá mzda minus penalizace a zálohy') +
      (u.celkem ? radek('Účty', kc(u.celkem), 'pozn') : '') +
      (u.zVyplaty ? radek('&nbsp;&nbsp;odečteno z výplaty', '−' + kc(u.zVyplaty), 'minus') : '') +
      (u.zvlast ? radek('&nbsp;&nbsp;zaplaceno zvlášť', kc(u.zvlast), 'pozn') : '') +
      (u.otevrene ? radek('&nbsp;&nbsp;zatím nezaplaceno', kc(u.otevrene), 'minus', 'zaplatí se zvlášť, nebo se odečte při výplatě (zaškrtávátko „Odečíst účty“)') : '') +
      (u.otevrene ? radek('Po odečtení otevřených účtů', kc(o.poOdectu), 'sum', 'čistá mzda minus nezaplacené účty') : '') +
      '</div>';
  }
  function badgeFlat(vyp, cek) {
    if (cek > 0 && vyp > 0) return '<span class="mp-b cast">Část. vyplaceno</span>';
    if (cek > 0) return '<span class="mp-b cek">Čeká na výplatu</span>';
    if (vyp > 0) return '<span class="mp-b ok">✓ Vyplaceno</span>';
    return '<span class="mp-b no">bez hodin</span>';
  }

  // ---------- jeden brigádník ----------
  function workerMonth(m) {
    var u = m.ucty, z = m.zalohy;
    var c = m.hodiny ? ' · ' : '';
    var hd = '<div class="mp-hd">' + esc(m.label) + ' ' + stavBadge(m) + '</div>';
    var t = tiles([
      { l: 'Odpracováno', v: esc(hh(m.hodiny)), s: pocetDni(m.dny.length) },
      { l: 'Hrubá mzda', v: kc(m.hruby), s: m.sazba ? 'sazba ' + kc(m.sazba) + '/h' : '' },
      { l: 'Odečty', v: (m.penalizace + z.celkem) ? '−' + kc(m.penalizace + z.celkem) : '–', cls: (m.penalizace + z.celkem) ? 'rd' : '', s: (m.penalizace || z.celkem) ? 'penalizace ' + kc(m.penalizace) + ' · zálohy ' + kc(z.celkem) : 'žádné' },
      { l: 'Čistá mzda', v: kc(m.cista), cls: 'hl', s: 'hrubá − odečty' },
      { l: 'Vyplaceno', v: kc(m.vyplaceno), cls: 'gr' },
      { l: 'Čeká na výplatu', v: m.nevyplacenoHruby ? kc(m.nevyplacenoHruby) : '✓ nic', cls: m.nevyplacenoHruby ? 'or' : '', s: m.nevyplacenoHruby ? 'hrubá za ' + esc(hh(m.nevyplacenoHodiny)) : '' }
    ]);
    var sl = '<div class="mp-h">Výpočet mzdy</div>' + slip({ hodiny: m.hodiny, sazba: m.sazba, hruby: m.hruby, sub: pocetDni(m.dny.length) + ' v měsíci · hrubá mzda', pen: m.penalizace, penN: m.penalizaceItems.length, zOdectene: z.odectene, zOtevrene: z.otevrene, cista: m.cista, u: u, poOdectu: m.poOdectuUctu });
    var pay = '<div class="mp-h">Výplaty za tenhle měsíc</div>' + (m.vyplaty.length ? m.vyplaty.map(function (v) {
      return '<div class="mp-pay"><span>' + esc(dat(v.datum)) + (v.poznamka ? ' <span style="color:var(--text-muted,#6b7280);">– ' + esc(v.poznamka) + '</span>' : '') +
        (v.rozdeleno ? ' <span style="color:var(--text-muted,#6b7280);">(výplata za víc měsíců, tady jen část)</span>' : '') + '</span><b style="text-align:right;">' + kc(v.podil) + (v.rozdeleno ? '' : vRuce(v.castka, v.poznamka)) + '</b></div>';
    }).join('') : '<div style="color:var(--text-muted,#6b7280);padding:4px 0;">Za tenhle měsíc zatím žádná výplata.</div>') +
      (m.nevyplacenoHruby ? '<div class="mp-pay"><span>Ještě nevyplaceno (hrubá mzda za ' + esc(hh(m.nevyplacenoHodiny)) + ')</span><b style="color:#8a3a10;">' + kc(m.nevyplacenoHruby) + '</b></div>' : '');
    var stavLbl = { otevrene: 'nezaplaceno', zVyplaty: 'odečteno z výplaty', zvlast: 'zaplaceno zvlášť' };
    var polozky = '';
    if (m.penalizaceItems.length) polozky += '<div class="mp-h">Penalizace</div>' + m.penalizaceItems.map(function (p) {
      return '<div class="mp-li"><span>' + esc(dat(p.datum)) + ' · ' + esc(p.duvod || 'penalizace') + (p.poznamka ? ' – ' + esc(p.poznamka) : '') + '</span><b>−' + kc(p.castka) + '</b></div>';
    }).join('');
    if (u.items.length) polozky += '<div class="mp-h">Účty</div>' + u.items.map(function (p) {
      return '<div class="mp-li"><span>' + esc(dat(p.datum)) + ' · ' + esc(p.popis) + ' <i>(' + stavLbl[p.stav] + ')</i></span><b>' + kc(p.castka) + '</b></div>';
    }).join('');
    if (z.items.length) polozky += '<div class="mp-h">Zálohy</div>' + z.items.map(function (p) {
      return '<div class="mp-li"><span>' + esc(dat(p.datum)) + (p.poznamka ? ' · ' + esc(p.poznamka) : '') + ' <i>(' + (p.stav === 'odectena' ? 'odečteno při výplatě' : 'zatím neodečteno') + ')</i></span><b>' + kc(p.castka) + '</b></div>';
    }).join('');
    var dny = '<div class="mp-h">Odpracované dny (✓ vyplaceno · ⏳ čeká)</div>' + (m.dny.length ? '<div class="mp-days">' + m.dny.map(function (d) {
      return '<div class="mp-d ' + (d.vyplaceno ? 'ok' : 'cek') + '"><span>' + (d.vyplaceno ? '✓ ' : '⏳ ') + esc(dat(d.datum)) + '</span><span>' + esc(hh(d.hodiny)) + ' · ' + kc(d.hruby) + '</span></div>';
    }).join('') + '</div>' : '<div style="color:var(--text-muted,#6b7280);">Žádné odpracované dny.</div>');
    return hd + t + sl + pay + polozky + dny;
  }

  function workerAll(id, mp, mesice) {
    var c = mp.celkem;
    var uc = { celkem: 0, zVyplaty: 0, zvlast: 0, otevrene: 0 }, zO = 0, zN = 0, penN = 0, dnu = 0;
    mesice.forEach(function (m) {
      ['celkem', 'zVyplaty', 'zvlast', 'otevrene'].forEach(function (k) { uc[k] += m.ucty[k]; });
      zO += m.zalohy.odectene; zN += m.zalohy.otevrene; penN += m.penalizaceItems.length; dnu += m.dny.length;
    });
    var odecty = c.penalizace + c.zalohy;
    var hd = '<div class="mp-hd">Všechny měsíce dohromady</div>';
    var t = tiles([
      { l: 'Odpracováno', v: esc(hh(c.hodiny)), s: pocetDni(dnu) + ' · ' + mesice.length + ' měs.' },
      { l: 'Hrubá mzda', v: kc(c.hruby) },
      { l: 'Odečty', v: odecty ? '−' + kc(odecty) : '–', cls: odecty ? 'rd' : '', s: odecty ? 'penalizace ' + kc(c.penalizace) + ' · zálohy ' + kc(c.zalohy) : 'žádné' },
      { l: 'Čistá mzda', v: kc(c.cista), cls: 'hl', s: 'hrubá − odečty' },
      { l: 'Vyplaceno', v: kc(c.vyplaceno), cls: 'gr' },
      { l: 'Čeká na výplatu', v: c.nevyplacenoHruby ? kc(c.nevyplacenoHruby) : '✓ nic', cls: c.nevyplacenoHruby ? 'or' : '', s: c.nevyplacenoHruby ? 'hrubá za ' + esc(hh(c.nevyplacenoHodiny)) : '' }
    ]);
    var sl = '<div class="mp-h">Výpočet mzdy za všechny měsíce</div>' + slip({ hodiny: c.hodiny, hruby: c.hruby, sub: 'součet za všechny měsíce', pen: c.penalizace, penN: penN, zOdectene: zO, zOtevrene: zN, cista: c.cista, u: uc, poOdectu: c.cista - uc.otevrene });
    var tb = '<div class="mp-h">Po měsících <span style="text-transform:none;font-weight:500;">(klikni na měsíc pro detail)</span></div><div class="schedule-wrap"><table class="mp-tbl mpr"><thead><tr><th>Měsíc</th><th class="r">Hodin</th><th class="r">Hrubá mzda</th><th class="r">Penalizace</th><th class="r">Zálohy</th><th class="r">Čistá mzda</th><th class="r">Vyplaceno</th><th class="r">Čeká</th></tr></thead><tbody>';
    mesice.forEach(function (m) {
      tb += '<tr class="mp-click" onclick="MP.pick(\'' + id + '\',\'' + m.key + '\')"><td data-l=""><b>' + esc(m.label) + '</b> ' + stavBadge(m) + '</td>' +
        '<td class="r" data-l="Hodin">' + esc(hh(m.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(m.hruby) + '</td>' +
        '<td class="r" data-l="Penalizace" style="color:' + (m.penalizace ? '#a12b2b' : 'inherit') + ';">' + (m.penalizace ? '−' + kc(m.penalizace) : '–') + '</td>' +
        '<td class="r" data-l="Zálohy" style="color:' + (m.zalohy.celkem ? '#a12b2b' : 'inherit') + ';">' + (m.zalohy.celkem ? '−' + kc(m.zalohy.celkem) : '–') + '</td>' +
        '<td class="r" data-l="Čistá mzda" style="font-weight:600;">' + kc(m.cista) + '</td>' +
        '<td class="r" data-l="Vyplaceno" style="color:#14652b;font-weight:600;">' + kc(m.vyplaceno) + '</td>' +
        '<td class="r" data-l="Čeká" style="color:' + (m.nevyplacenoHruby ? '#8a3a10' : 'inherit') + ';font-weight:600;">' + (m.nevyplacenoHruby ? kc(m.nevyplacenoHruby) : '✓ nic') + '</td></tr>';
    });
    tb += '<tr class="tot"><td data-l="">Celkem</td><td class="r" data-l="Hodin">' + esc(hh(c.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(c.hruby) + '</td><td class="r" data-l="Penalizace">' + (c.penalizace ? '−' + kc(c.penalizace) : '–') + '</td><td class="r" data-l="Zálohy">' + (c.zalohy ? '−' + kc(c.zalohy) : '–') + '</td><td class="r" data-l="Čistá mzda">' + kc(c.cista) + '</td><td class="r" data-l="Vyplaceno">' + kc(c.vyplaceno) + '</td><td class="r" data-l="Čeká">' + (c.nevyplacenoHruby ? kc(c.nevyplacenoHruby) : '✓ nic') + '</td></tr></tbody></table></div>';
    var vyp = mp.vyplaty || [];
    var pay = '<div class="mp-h">Všechny výplaty (' + vyp.length + ')</div>' + (vyp.length ? vyp.map(function (v) {
      return '<div class="mp-pay"><span>' + esc(dat(v.datum)) + (v.poznamka ? ' <span style="color:var(--text-muted,#6b7280);">– ' + esc(v.poznamka) + '</span>' : '') + '</span><b style="text-align:right;">' + kc(v.castka) + vRuce(v.castka, v.poznamka) + '</b></div>';
    }).join('') : '<div style="color:var(--text-muted,#6b7280);padding:4px 0;">Zatím žádná výplata.</div>');
    return hd + t + sl + tb + pay;
  }

  function renderWorker(id) {
    var v = views[id], mp = v.mp;
    var mesice = mp.mesice.filter(maData);
    if (!mesice.length) { v.el.innerHTML = '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné odpracované hodiny ani výplaty.</div>'; return; }
    var m = mesice.filter(function (x) { return x.key === v.sel; })[0];
    v.el.innerHTML = picker(id, mesicPolozky(mesice), v.sel) + '<div class="mp-view">' + (m ? workerMonth(m) : workerAll(id, mp, mesice)) + '</div>' +
      '<div class="mp-note">Vyplacená částka = hrubá mzda minus penalizace, zálohy a případně účty odečtené při výplatě. Účty se jinak platí zvlášť.</div>';
  }
  // Přehled jednoho brigádníka: nahoře výběr měsíce (+ „Všechny měsíce dohromady“),
  // pod tím detail vybraného měsíce. Výchozí = nejnovější měsíc.
  function mountWorker(el, mp, opts) {
    injectCss();
    var v = ensure(el); v.type = 'worker'; v.mp = mp;
    var mesice = mp.mesice.filter(maData);
    if (!v.sel || (v.sel !== 'all' && !mesice.some(function (m) { return m.key === v.sel; }))) v.sel = (opts && opts.vse) || !mesice.length ? 'all' : mesice[0].key;
    renderWorker(el._mpid);
  }

  // Malé "bublinky" s měsíci pro řádek v tabulce adminu - hned je vidět, za
  // který měsíc se ještě platí a který už je vyplacený. Nejnovější vlevo.
  function monthChips(mp, max) {
    injectCss();
    max = max || 5;
    var ms = mp.mesice.filter(function (m) { return m.dny.length || m.vyplaceno; });
    if (!ms.length) return '';
    var shown = ms.slice(0, max);
    var html = shown.map(function (m) {
      var short = m.label.split(' ')[0].slice(0, 3);
      if (m.stav === 'vyplaceno') return '<span class="mp-chip ok" title="' + esc(m.label) + ': vyplaceno ' + kc(m.vyplaceno) + '">' + esc(short) + ' ✓</span>';
      if (m.stav === 'castecne') return '<span class="mp-chip cast" title="' + esc(m.label) + ': část vyplacena, čeká ' + kc(m.nevyplacenoHruby) + '">' + esc(short) + ' ' + kc(m.nevyplacenoHruby) + '</span>';
      return '<span class="mp-chip cek" title="' + esc(m.label) + ': čeká na výplatu">' + esc(short) + ' ' + kc(m.nevyplacenoHruby) + '</span>';
    }).join('');
    if (ms.length > max) html += '<span class="mp-chip ok" style="background:#eceef3;color:#4a5263;">+' + (ms.length - max) + ' starších</span>';
    return '<div class="mp-chips">' + html + '</div>';
  }

  // ---------- celá provozovna (admin) ----------
  function souhrnTable(s, id) {
    if (!s.radky.length) return '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné hodiny ani výplaty.</div>';
    var html = '<div class="schedule-wrap"><table class="mp-tbl mpr"><thead><tr><th>Měsíc</th><th class="r">Brigádníků</th><th class="r">Hodin</th><th class="r">Hrubá mzda</th><th class="r">Penalizace</th><th class="r">Zálohy</th><th class="r">Čistá mzda</th><th class="r">Účty (otevřené)</th><th class="r">Vyplaceno</th><th class="r">Čeká na výplatu</th></tr></thead><tbody>';
    s.radky.forEach(function (r) {
      html += '<tr class="mp-click" onclick="MP.pick(\'' + id + '\',\'' + r.key + '\')"><td data-l=""><b>' + esc(r.label) + '</b>' + (r.aktualni ? ' <span class="mp-b ted">probíhá</span>' : '') + ' ' + badgeFlat(r.vyplaceno, r.nevyplacenoHruby) + '</td><td class="r" data-l="Brigádníků">' + r.brigadniku + '</td><td class="r" data-l="Hodin">' + esc(hh(r.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(r.hruby) +
        '</td><td class="r" data-l="Penalizace" style="color:' + (r.penalizace ? '#a12b2b' : 'inherit') + ';">' + (r.penalizace ? '−' + kc(r.penalizace) : '–') +
        '</td><td class="r" data-l="Zálohy" style="color:' + (r.zalohy ? '#a12b2b' : 'inherit') + ';">' + (r.zalohy ? '−' + kc(r.zalohy) : '–') +
        '</td><td class="r" data-l="Čistá mzda" style="font-weight:600;">' + kc(r.cista) +
        '</td><td class="r" data-l="Účty (otevřené)">' + (r.uctyOtevrene ? kc(r.uctyOtevrene) : '–') +
        '</td><td class="r" data-l="Vyplaceno" style="color:#14652b;font-weight:600;">' + kc(r.vyplaceno) + '</td><td class="r" data-l="Čeká na výplatu" style="color:' + (r.nevyplacenoHruby ? '#8a3a10' : 'inherit') + ';font-weight:600;">' + (r.nevyplacenoHruby ? kc(r.nevyplacenoHruby) : '✓ nic') + '</td></tr>';
    });
    var c = s.celkem;
    html += '<tr class="tot"><td data-l="">Celkem</td><td class="r mp-x"></td><td class="r" data-l="Hodin">' + esc(hh(c.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(c.hruby) + '</td><td class="r" data-l="Penalizace">' + (c.penalizace ? '−' + kc(c.penalizace) : '–') + '</td><td class="r" data-l="Zálohy">' + (c.zalohy ? '−' + kc(c.zalohy) : '–') + '</td><td class="r" data-l="Čistá mzda">' + kc(c.cista) + '</td><td class="r" data-l="Účty (otevřené)">' + (c.uctyOtevrene ? kc(c.uctyOtevrene) : '–') + '</td><td class="r" data-l="Vyplaceno">' + kc(c.vyplaceno) + '</td><td class="r" data-l="Čeká na výplatu">' + kc(c.nevyplacenoHruby) + '</td></tr>';
    return html + '</tbody></table></div>';
  }

  // Tabulka lidí. rows: [{id,jmeno,f:{hodiny,hruby,pen,zal,cista,uc,vyp,cek,kdy}}]
  function lidiTable(rows, venueId, popisek) {
    if (!rows.length) return '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Nikdo tu nemá hodiny ani výplaty.</div>';
    var t = { h: 0, hr: 0, pen: 0, zal: 0, cis: 0, uc: 0, vyp: 0, cek: 0 };
    var vid = venueId == null ? 'null' : venueId;
    var html = '<div class="schedule-wrap"><table class="mp-tbl mpr"><thead><tr><th>Brigádník</th><th class="r">Hodin</th><th class="r">Hrubá mzda</th><th class="r">Penalizace</th><th class="r">Zálohy</th><th class="r">Čistá mzda</th><th class="r">Účty (otevřené)</th><th class="r">Vyplaceno</th><th class="r">Čeká</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var f = r.f;
      t.h += f.hodiny; t.hr += f.hruby; t.pen += f.pen; t.zal += f.zal; t.cis += f.cista; t.uc += f.uc; t.vyp += f.vyp; t.cek += f.cek;
      html += '<tr><td data-l=""><a href="#" style="font-weight:600;font-size:14px;color:inherit;text-decoration:underline dotted;" onclick="mpOpenWorker(' + r.id + ',' + vid + ');return false;">' + esc(r.jmeno) + '</a> <span style="margin-left:4px;">' + badgeFlat(f.vyp, f.cek) + '</span></td>' +
        '<td class="r" data-l="Hodin">' + esc(hh(f.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(f.hruby) + '</td>' +
        '<td class="r" data-l="Penalizace" style="color:' + (f.pen ? '#a12b2b' : 'inherit') + ';">' + (f.pen ? '−' + kc(f.pen) : '–') + '</td>' +
        '<td class="r" data-l="Zálohy" style="color:' + (f.zal ? '#a12b2b' : 'inherit') + ';">' + (f.zal ? '−' + kc(f.zal) : '–') + '</td>' +
        '<td class="r" data-l="Čistá mzda" style="font-weight:600;">' + kc(f.cista) + '</td>' +
        '<td class="r" data-l="Účty (otevřené)">' + (f.uc ? kc(f.uc) : '–') + '</td>' +
        '<td class="r" data-l="Vyplaceno" style="color:#14652b;font-weight:600;"><span>' + kc(f.vyp) + (f.kdy ? '<div style="font-size:10.5px;font-weight:400;color:var(--text-muted,#6b7280);">' + esc(f.kdy) + '</div>' : '') + '</span></td>' +
        '<td class="r" data-l="Čeká" style="color:' + (f.cek ? '#8a3a10' : 'inherit') + ';font-weight:600;">' + (f.cek ? kc(f.cek) : '✓ nic') + '</td></tr>';
    });
    html += '<tr class="tot"><td data-l="">Celkem ' + esc(popisek) + '</td><td class="r" data-l="Hodin">' + esc(hh(t.h)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(t.hr) + '</td><td class="r" data-l="Penalizace">' + (t.pen ? '−' + kc(t.pen) : '–') + '</td><td class="r" data-l="Zálohy">' + (t.zal ? '−' + kc(t.zal) : '–') + '</td><td class="r" data-l="Čistá mzda">' + kc(t.cis) + '</td><td class="r" data-l="Účty (otevřené)">' + (t.uc ? kc(t.uc) : '–') + '</td><td class="r" data-l="Vyplaceno">' + kc(t.vyp) + '</td><td class="r" data-l="Čeká">' + kc(t.cek) + '</td></tr>';
    return html + '</tbody></table></div><div class="mp-note">Klikni na jméno a uvidíš všechny měsíce a jednotlivé dny toho brigádníka.</div>';
  }

  function venueTiles(r, brigadniku) {
    var odecty = r.penalizace + r.zalohy;
    return tiles([
      { l: 'Brigádníků', v: String(brigadniku) },
      { l: 'Odpracováno', v: esc(hh(r.hodiny)) },
      { l: 'Hrubá mzda', v: kc(r.hruby) },
      { l: 'Odečty', v: odecty ? '−' + kc(odecty) : '–', cls: odecty ? 'rd' : '', s: odecty ? 'penalizace ' + kc(r.penalizace) + ' · zálohy ' + kc(r.zalohy) : 'žádné' },
      { l: 'Čistá mzda', v: kc(r.cista), cls: 'hl', s: r.uctyOtevrene ? 'otevřené účty ' + kc(r.uctyOtevrene) : 'hrubá − odečty' },
      { l: 'Vyplaceno', v: kc(r.vyplaceno), cls: 'gr' },
      { l: 'Čeká na výplatu', v: r.nevyplacenoHruby ? kc(r.nevyplacenoHruby) : '✓ nic', cls: r.nevyplacenoHruby ? 'or' : '' }
    ]);
  }

  function renderVenue(id) {
    var v = views[id];
    var s = v.souhrn;
    if (!s.radky.length) { v.el.innerHTML = '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné hodiny ani výplaty.</div>'; return; }
    var polozky = [{ key: 'all', label: '∑ Všechny měsíce dohromady', all: true }].concat(s.radky.map(function (r) {
      return { key: r.key, label: r.label, mark: r.nevyplacenoHruby ? '⏳' : '✓' };
    }));
    var html = picker(id, polozky, v.sel), body;
    if (v.sel === 'all') {
      var rows = v.prehledy.map(function (p) {
        var w = getWorkerById(p.id), c = p.mp.celkem;
        var kdy = (p.mp.vyplaty || []).map(function (x) { return dat(x.datum); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3).join(', ');
        return { id: p.id, jmeno: w ? w.jmeno : '?', f: { hodiny: c.hodiny, hruby: c.hruby, pen: c.penalizace, zal: c.zalohy, cista: c.cista, uc: c.uctyOtevrene, vyp: c.vyplaceno, cek: c.nevyplacenoHruby, kdy: kdy }, ma: c.hodiny || c.vyplaceno || c.penalizace || c.zalohy };
      }).filter(function (r) { return r.ma; }).sort(function (a, b) { return a.jmeno.localeCompare(b.jmeno, 'cs'); });
      body = '<div class="mp-hd">Všechny měsíce dohromady</div>' + venueTiles(s.celkem, rows.length) +
        '<div class="mp-h">Po měsících <span style="text-transform:none;font-weight:500;">(klikni na měsíc pro detail)</span></div>' + souhrnTable(s, id) +
        '<div class="mp-h" style="margin-top:18px;">Po lidech – za všechny měsíce</div>' + lidiTable(rows, v.venueId, 'za všechny měsíce');
    } else {
      var r = s.radky.filter(function (x) { return x.key === v.sel; })[0];
      var rows2 = v.prehledy.map(function (p) {
        var w = getWorkerById(p.id), m = p.mp.mesice.filter(function (x) { return x.key === v.sel; })[0];
        if (!m || !maData(m)) return null;
        var kdy = m.vyplaty.map(function (x) { return dat(x.datum); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ');
        return { id: p.id, jmeno: w ? w.jmeno : '?', f: { hodiny: m.hodiny, hruby: m.hruby, pen: m.penalizace, zal: m.zalohy.celkem, cista: m.cista, uc: m.ucty.otevrene, vyp: m.vyplaceno, cek: m.nevyplacenoHruby, kdy: kdy } };
      }).filter(Boolean).sort(function (a, b) { return a.jmeno.localeCompare(b.jmeno, 'cs'); });
      body = '<div class="mp-hd">' + esc(r.label) + (r.aktualni ? ' <span class="mp-b ted">probíhá</span>' : '') + ' ' + badgeFlat(r.vyplaceno, r.nevyplacenoHruby) + '</div>' + venueTiles(r, rows2.length) +
        '<div class="mp-h">Po lidech – ' + esc(r.label) + '</div>' + lidiTable(rows2, v.venueId, 'za ' + r.label);
    }
    v.el.innerHTML = html + '<div class="mp-view">' + body + '</div><div class="mp-note">Hrubá mzda = hodiny × sazba. Čistá mzda = hrubá minus penalizace a zálohy. Účty se platí zvlášť, nebo se odečtou při výplatě. Vyplaceno = skutečně zapsané výplaty.</div>';
  }
  // Celková přehled provozovny: výběr měsíce nahoře + „Všechny měsíce dohromady“.
  function mountVenue(el, workerIds, venueId) {
    injectCss();
    var v = ensure(el); v.type = 'venue'; v.venueId = venueId;
    v.prehledy = workerIds.map(function (wid) { return { id: wid, mp: getMesicniPrehled(wid, venueId) }; });
    v.souhrn = getMesicniSouhrn(workerIds, venueId);
    var klice = v.souhrn.radky.map(function (r) { return r.key; });
    if (!v.sel || (v.sel !== 'all' && klice.indexOf(v.sel) === -1)) v.sel = klice[0] || 'all';
    renderVenue(el._mpid);
  }

  function pick(id, key) {
    var v = views[id]; if (!v) return;
    v.sel = key;
    if (v.type === 'worker') renderWorker(id); else renderVenue(id);
  }

  // Vlastní modál (nezávislý na stránce, aby fungoval stejně v admin.html i podnik-admin.html).
  function openModal(title, bodyHtml) {
    injectCss();
    var ov = document.getElementById('mp-modal');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'mp-modal'; ov.className = 'modal-overlay';
      ov.innerHTML = '<div class="modal-box" style="max-width:720px;max-height:88vh;overflow-y:auto;"><div class="modal-title" id="mp-modal-title"></div><div id="mp-modal-body"></div>' +
        '<div class="modal-actions"><button class="btn btn-secondary" type="button" onclick="mpCloseModal()">Zavřít</button></div></div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) window.mpCloseModal(); });
      document.body.appendChild(ov);
    }
    document.getElementById('mp-modal-title').textContent = title;
    document.getElementById('mp-modal-body').innerHTML = bodyHtml;
    ov.classList.remove('hidden');
    ov.style.display = 'flex';
    return document.getElementById('mp-modal-body');
  }
  window.mpCloseModal = function () {
    var ov = document.getElementById('mp-modal');
    if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
  };
  window.mpOpenWorker = function (workerId, venueId, key) {
    var w = getWorkerById(workerId);
    var mp = getMesicniPrehled(workerId, venueId === 'null' || venueId === '' ? null : venueId);
    var body = openModal('📅 Měsíce a výplaty – ' + (w ? w.jmeno : ''), '<div id="mp-modal-view"></div>');
    var el = document.getElementById('mp-modal-view');
    mountWorker(el, mp, {});
    if (key) pick(el._mpid, key);
  };

  window.MP = { mountWorker: mountWorker, mountVenue: mountVenue, pick: pick, monthChips: monthChips, openModal: openModal, esc: esc, kc: kc };
})();
