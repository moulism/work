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

  // Celý přehled jednoho brigádníka (karta s měsíci). opts.otevrit = kolik
  // nejnovějších měsíců je rozbalených (výchozí 1).
  function workerCard(mp, opts) {
    injectCss();
    opts = opts || {};
    var otevrit = opts.otevrit == null ? 1 : opts.otevrit;
    var c = mp.celkem;
    var html = '<div class="mp-sum">' +
      '<div><div class="l">Odpracováno celkem</div><div class="v">' + esc(hh(c.hodiny)) + '</div></div>' +
      '<div><div class="l">Hrubá mzda celkem</div><div class="v">' + kc(c.hruby) + '</div></div>' +
      '<div><div class="l">Vyplaceno celkem</div><div class="v" style="color:#14652b;">' + kc(c.vyplaceno) + '</div></div>' +
      '<div><div class="l">Čeká na výplatu</div><div class="v" style="color:' + (c.nevyplacenoHruby ? '#8a3a10' : 'inherit') + ';">' + kc(c.nevyplacenoHruby) + '</div></div>' +
      '</div>';
    if (!mp.mesice.length) return html + '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné odpracované hodiny ani výplaty.</div>';
    html += mp.mesice.map(function (m, i) {
      var pay = m.vyplaty.length ? m.vyplaty.map(function (v) {
        return '<div class="mp-pay"><span>' + esc(dat(v.datum)) + (v.poznamka ? ' <span style="color:var(--text-muted,#6b7280);">– ' + esc(v.poznamka) + '</span>' : '') +
          (v.rozdeleno ? ' <span style="color:var(--text-muted,#6b7280);">(výplata za víc měsíců, tady jen část)</span>' : '') + '</span><b>' + kc(v.podil) + '</b></div>';
      }).join('') : '<div style="color:var(--text-muted,#6b7280);padding:4px 0;">Za tenhle měsíc zatím žádná výplata.</div>';
      var dny = m.dny.length ? '<div class="mp-days">' + m.dny.map(function (d) {
        return '<div class="mp-d ' + (d.vyplaceno ? 'ok' : 'cek') + '"><span>' + (d.vyplaceno ? '✓ ' : '⏳ ') + esc(dat(d.datum)) + '</span><span>' + esc(hh(d.hodiny)) + ' · ' + kc(d.hruby) + '</span></div>';
      }).join('') + '</div>' : '<div style="color:var(--text-muted,#6b7280);">Žádné odpracované dny.</div>';
      return '<details class="mp-m"' + (i < otevrit ? ' open' : '') + '><summary>' +
        '<div class="t">' + esc(m.label) + ' ' + stavBadge(m) + '</div>' +
        '<div class="n"><span><b>' + esc(hh(m.hodiny)) + '</b> odprac.</span><span>hrubá <b>' + kc(m.hruby) + '</b></span><span>vyplaceno <b>' + kc(m.vyplaceno) + '</b></span></div>' +
        '</summary><div class="mp-body">' +
        '<div class="mp-h">Výplaty za tenhle měsíc</div>' + pay +
        (m.penalizace ? '<div class="mp-pay"><span>Penalizace v měsíci (odečítají se z výplaty)</span><b style="color:#a12b2b;">−' + kc(m.penalizace) + '</b></div>' : '') +
        (m.nevyplacenoHruby ? '<div class="mp-pay"><span>Ještě nevyplaceno (hrubá mzda)</span><b style="color:#8a3a10;">' + kc(m.nevyplacenoHruby) + '</b></div>' : '') +
        '<div class="mp-h">Odpracované dny (✓ vyplaceno · ⏳ čeká)</div>' + dny +
        '</div></details>';
    }).join('');
    html += '<div class="mp-note">Vyplacená částka může být nižší než hrubá mzda o penalizace, zálohy nebo účty, které se při výplatě odečetly.</div>';
    return html;
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

  // Tabulka celkových výplat po měsících za celou provozovnu.
  function souhrnTable(s) {
    injectCss();
    if (!s.radky.length) return '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné hodiny ani výplaty.</div>';
    var html = '<div class="schedule-wrap"><table class="mp-tbl mpr"><thead><tr><th>Měsíc</th><th class="r">Brigádníků</th><th class="r">Hodin</th><th class="r">Hrubá mzda</th><th class="r">Vyplaceno</th><th class="r">Čeká na výplatu</th></tr></thead><tbody>';
    s.radky.forEach(function (r) {
      html += '<tr><td data-l=""><b>' + esc(r.label) + '</b>' + (r.aktualni ? ' <span class="mp-b ted">probíhá</span>' : '') + '</td><td class="r" data-l="Brigádníků">' + r.brigadniku + '</td><td class="r" data-l="Hodin">' + esc(hh(r.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(r.hruby) +
        '</td><td class="r" data-l="Vyplaceno" style="color:#14652b;font-weight:600;">' + kc(r.vyplaceno) + '</td><td class="r" data-l="Čeká na výplatu" style="color:' + (r.nevyplacenoHruby ? '#8a3a10' : 'inherit') + ';font-weight:600;">' + (r.nevyplacenoHruby ? kc(r.nevyplacenoHruby) : '✓ nic') + '</td></tr>';
    });
    var c = s.celkem;
    html += '<tr class="tot"><td data-l="">Celkem</td><td class="r" data-l="Hodin">' + esc(hh(c.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(c.hruby) + '</td><td class="r" data-l="Vyplaceno">' + kc(c.vyplaceno) + '</td><td class="r" data-l="Čeká na výplatu">' + kc(c.nevyplacenoHruby) + '</td></tr>';
    return html + '</tbody></table></div><div class="mp-note">Hrubá mzda = odpracované hodiny × sazba. Vyplaceno = skutečně zapsané výplaty (po odečtení penalizací, záloh a účtů), proto se může od hrubé mzdy lišit.</div>';
  }

  // Výplaty po lidech za JEDEN vybraný měsíc: nahoře tlačítka měsíců, pod nimi
  // tabulka brigádník po brigádníkovi (hodiny, hrubá mzda, penalizace, vyplaceno,
  // co čeká). Stav (vybraný měsíc) si drží modul, stránka jen zavolá render().
  var po = { btns: null, tbl: null, ids: [], venueId: null, key: null };
  function poLidech(btnsEl, tblEl, workerIds, venueId) {
    injectCss();
    po.btns = btnsEl; po.tbl = tblEl; po.ids = workerIds; po.venueId = venueId;
    var prehledy = workerIds.map(function (id) { return { id: id, mp: getMesicniPrehled(id, venueId) }; });
    var klice = {};
    prehledy.forEach(function (p) { p.mp.mesice.forEach(function (m) { if (m.dny.length || m.vyplaceno) klice[m.key] = m.label; }); });
    var seznam = Object.keys(klice).sort().reverse();
    if (!seznam.length) { btnsEl.innerHTML = ''; tblEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted,#6b7280);">Zatím žádné hodiny ani výplaty.</div>'; return; }
    if (!po.key || seznam.indexOf(po.key) === -1) po.key = seznam[0];
    btnsEl.innerHTML = seznam.map(function (k) {
      return '<button type="button" class="btn btn-sm ' + (k === po.key ? 'btn-primary' : 'btn-secondary') + '" style="margin:0 6px 6px 0;" onclick="MP.vyberMesic(\'' + k + '\')">' + esc(klice[k]) + '</button>';
    }).join('');
    var radky = prehledy.map(function (p) {
      var w = getWorkerById(p.id);
      var m = p.mp.mesice.filter(function (x) { return x.key === po.key; })[0];
      return { id: p.id, jmeno: w ? w.jmeno : '?', m: m };
    }).filter(function (r) { return r.m && (r.m.dny.length || r.m.vyplaceno); })
      .sort(function (a, b) { return a.jmeno.localeCompare(b.jmeno, 'cs'); });
    var t = { h: 0, hr: 0, pen: 0, vyp: 0, cek: 0 };
    var html = '<div class="schedule-wrap"><table class="mp-tbl mpr"><thead><tr><th>Brigádník</th><th class="r">Hodin</th><th class="r">Hrubá mzda</th><th class="r">Penalizace</th><th class="r">Vyplaceno</th><th class="r">Čeká</th></tr></thead><tbody>';
    radky.forEach(function (r) {
      var m = r.m;
      t.h += m.hodiny; t.hr += m.hruby; t.pen += m.penalizace; t.vyp += m.vyplaceno; t.cek += m.nevyplacenoHruby;
      var kdy = m.vyplaty.map(function (v) { return dat(v.datum); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ');
      html += '<tr><td data-l=""><a href="#" style="font-weight:600;font-size:14px;color:inherit;text-decoration:underline dotted;" onclick="mpOpenWorker(' + r.id + ',' + (venueId == null ? 'null' : venueId) + ');return false;">' + esc(r.jmeno) + '</a> <span style="margin-left:4px;">' + stavBadge(m) + '</span></td>' +
        '<td class="r" data-l="Hodin">' + esc(hh(m.hodiny)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(m.hruby) + '</td>' +
        '<td class="r" data-l="Penalizace" style="color:' + (m.penalizace ? '#a12b2b' : 'inherit') + ';">' + (m.penalizace ? '−' + kc(m.penalizace) : '–') + '</td>' +
        '<td class="r" data-l="Vyplaceno" style="color:#14652b;font-weight:600;"><span>' + kc(m.vyplaceno) + (kdy ? '<div style="font-size:10.5px;font-weight:400;color:var(--text-muted,#6b7280);">' + esc(kdy) + '</div>' : '') + '</span></td>' +
        '<td class="r" data-l="Čeká" style="color:' + (m.nevyplacenoHruby ? '#8a3a10' : 'inherit') + ';font-weight:600;">' + (m.nevyplacenoHruby ? kc(m.nevyplacenoHruby) : '✓ nic') + '</td></tr>';
    });
    html += '<tr class="tot"><td data-l="">Celkem za ' + esc(klice[po.key]) + '</td><td class="r" data-l="Hodin">' + esc(hh(t.h)) + '</td><td class="r" data-l="Hrubá mzda">' + kc(t.hr) + '</td><td class="r" data-l="Penalizace">' + (t.pen ? '−' + kc(t.pen) : '–') + '</td><td class="r" data-l="Vyplaceno">' + kc(t.vyp) + '</td><td class="r" data-l="Čeká">' + kc(t.cek) + '</td></tr>';
    tblEl.innerHTML = html + '</tbody></table></div><div class="mp-note">Klikni na jméno a uvidíš všechny měsíce a jednotlivé dny toho brigádníka. Vyplaceno může být nižší než hrubá mzda o penalizace, zálohy nebo účty odečtené při výplatě.</div>';
  }
  function vyberMesic(k) { po.key = k; if (po.btns) poLidech(po.btns, po.tbl, po.ids, po.venueId); }

  // Vlastní modál (nezávislý na stránce, aby fungoval stejně v admin.html i podnik-admin.html).
  function openModal(title, bodyHtml) {
    injectCss();
    var ov = document.getElementById('mp-modal');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'mp-modal'; ov.className = 'modal-overlay';
      ov.innerHTML = '<div class="modal-box" style="max-width:640px;max-height:88vh;overflow-y:auto;"><div class="modal-title" id="mp-modal-title"></div><div id="mp-modal-body"></div>' +
        '<div class="modal-actions"><button class="btn btn-secondary" type="button" onclick="mpCloseModal()">Zavřít</button></div></div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) window.mpCloseModal(); });
      document.body.appendChild(ov);
    }
    document.getElementById('mp-modal-title').textContent = title;
    document.getElementById('mp-modal-body').innerHTML = bodyHtml;
    ov.classList.remove('hidden');
    ov.style.display = 'flex';
  }
  window.mpCloseModal = function () {
    var ov = document.getElementById('mp-modal');
    if (ov) { ov.classList.add('hidden'); ov.style.display = 'none'; }
  };
  window.mpOpenWorker = function (workerId, venueId) {
    var w = getWorkerById(workerId);
    var mp = getMesicniPrehled(workerId, venueId === 'null' || venueId === '' ? null : venueId);
    openModal('📅 Měsíce a výplaty – ' + (w ? w.jmeno : ''), workerCard(mp, { otevrit: 2 }));
  };

  window.MP = { poLidech: poLidech, vyberMesic: vyberMesic, workerCard: workerCard, monthChips: monthChips, souhrnTable: souhrnTable, openModal: openModal, esc: esc, kc: kc };
})();
