// ui.js – sdílené UI pomůcky (Kosatka 2026+)

// ===================== TLAČÍTKO "NAHORU" (scroll-to-top) =====================
// Na dlouhých strankách (hlavně admin.html/podnik-admin.html se spoustou tabulek)
// se dřív dalo nahoru dostat jen ručním scrollováním. Tohle přidá plovoucí
// tlačítko vpravo dole, co se objeví po odscrollování kousek dolů a klikem
// hladce vyjede zpátky nahoru - funguje samo na každé stránce, co načte ui.js.
(function initScrollTopBtn(){
  function setup(){
    if (document.getElementById('scroll-top-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'scroll-top-btn';
    btn.className = 'scroll-top-btn';
    btn.type = 'button';
    btn.title = 'Nahoru';
    btn.setAttribute('aria-label', 'Přejít nahoru');
    btn.textContent = '↑';
    btn.onclick = function(){ window.scrollTo({ top:0, behavior:'smooth' }); };
    document.body.appendChild(btn);
    function toggle(){ btn.classList.toggle('show', (window.scrollY||window.pageYOffset||0) > 320); }
    window.addEventListener('scroll', toggle, { passive:true });
    toggle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

// Hledatelný výběr (combobox) pro dlouhé seznamy - místo scrollování v <select>
// se dá rovnou napsat pár písmen a vybrat z filtrovaného seznamu.
//
// opts:
//   searchInputId  - text input, kam se píše hledaný text
//   resultsId      - div, kam se vykreslí filtrovaný seznam
//   hiddenInputId  - hidden input, kam se uloží vybrané id (prázdné = nic nevybráno)
//   clearBtnId     - (nepovinné) tlačítko na zrušení výběru
//   getItems()     - funkce vracející aktuální pole [{id, label, sub}]
//   onPick(item)   - zavolá se po výběru položky
//   onClear()      - zavolá se po zrušení výběru
//   placeholder    - placeholder textu, když nic není vybráno
function initSearchSelect(opts) {
  var input = document.getElementById(opts.searchInputId);
  var results = document.getElementById(opts.resultsId);
  var hidden = document.getElementById(opts.hiddenInputId);
  var clearBtn = opts.clearBtnId ? document.getElementById(opts.clearBtnId) : null;
  if (!input || !results || !hidden) return null;

  function render(filterText) {
    var items = opts.getItems() || [];
    var q = (filterText || '').trim().toLowerCase();
    var filtered = q ? items.filter(function(it) {
      return it.label.toLowerCase().indexOf(q) !== -1 || (it.sub && it.sub.toLowerCase().indexOf(q) !== -1);
    }) : items;
    if (!filtered.length) {
      results.innerHTML = '<div class="searchsel-empty">Nic nenalezeno' + (items.length ? '' : ' – seznam je prázdný') + '.</div>';
    } else {
      results.innerHTML = filtered.slice(0, 60).map(function(it) {
        return '<div class="searchsel-item" data-id="' + it.id + '">' +
          '<span>' + it.label + '</span>' +
          (it.sub ? '<span class="ss-sub">' + it.sub + '</span>' : '') +
          '</div>';
      }).join('');
    }
    results.classList.add('open');
    results.querySelectorAll('.searchsel-item').forEach(function(el) {
      el.onclick = function() {
        var id = el.getAttribute('data-id');
        var item = items.find(function(x) { return String(x.id) === String(id); });
        pick(item);
      };
    });
  }

  function pick(item) {
    if (!item) return;
    hidden.value = item.id;
    input.value = item.label;
    results.classList.remove('open');
    if (clearBtn) clearBtn.classList.add('show');
    if (opts.onPick) opts.onPick(item);
  }

  function clear() {
    hidden.value = '';
    input.value = '';
    results.classList.remove('open');
    if (clearBtn) clearBtn.classList.remove('show');
    if (opts.onClear) opts.onClear();
  }

  input.addEventListener('input', function() {
    // ruční psaní = zrušit dřívější přesný výběr, dokud se zase něco nevybere kliknutím
    if (hidden.value) { hidden.value = ''; if (opts.onClear) opts.onClear(); }
    if (clearBtn) clearBtn.classList.remove('show');
    render(input.value);
  });
  input.addEventListener('focus', function() { render(input.value); });
  document.addEventListener('click', function(e) {
    if (!results.contains(e.target) && e.target !== input) results.classList.remove('open');
  });
  if (clearBtn) clearBtn.onclick = clear;

  return { render: render, pick: pick, clear: clear };
}

// ===================== FULLSCREEN "ULOŽENO" OVERLAY =====================
// Po uložení důležité věci (směna, tržba, ...) přes celou obrazovku na chvíli
// potvrdí, že se to fakt uložilo - na mobilu se slabým signálem člověk jinak
// neví jistě, jestli se zápis povedl, a radši si to zapíše ještě jednou.
function showSavedOverlay(text, sub) {
  var ov = document.getElementById('saved-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'saved-overlay';
    ov.className = 'saved-overlay';
    ov.innerHTML = '<div class="saved-overlay-box"><div class="saved-overlay-check">✓</div><div class="saved-overlay-text"></div><div class="saved-overlay-sub"></div><div class="saved-overlay-hint">Klepnutím zavřeš</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(){ hideSavedOverlay(); });
  }
  ov.querySelector('.saved-overlay-text').textContent = text || 'Uloženo';
  ov.querySelector('.saved-overlay-sub').textContent = sub || '';
  ov.classList.add('show');
  clearTimeout(ov._hideTimer);
  ov._hideTimer = setTimeout(hideSavedOverlay, 1600);
}
function hideSavedOverlay() {
  var ov = document.getElementById('saved-overlay');
  if (ov) ov.classList.remove('show');
}

// ===================== PUSH NOTIFIKACE - UI POMŮCKA =====================
// Zobrazí/aktualizuje tlačítko "Povolit oznámení" podle aktuálního stavu.
// btnId = id tlačítka, workerId = pro koho se přihlašuje.
async function initPushButton(btnId, workerId) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  if (!await pushIsSupported()) {
    btn.style.display = 'none';
    var reasonEl = document.getElementById(btnId + '-reason');
    if (!reasonEl) {
      reasonEl = document.createElement('div');
      reasonEl.id = btnId + '-reason';
      reasonEl.style.cssText = 'font-size:12px;color:var(--red,#c1666b);margin-top:6px;';
      btn.parentNode.insertBefore(reasonEl, btn.nextSibling);
    }
    reasonEl.textContent = '⚠️ ' + (typeof pushUnsupportedReason === 'function' ? pushUnsupportedReason() : 'Tenhle prohlížeč/appka push notifikace nepodporuje.');
    return;
  }
  var perm = await pushGetPermissionState();
  function render() {
    if (perm === 'granted') { btn.textContent = '🔔 Oznámení zapnutá'; btn.disabled = true; btn.classList.remove('btn-primary'); btn.classList.add('btn-secondary'); }
    else if (perm === 'denied') { btn.textContent = '🔕 Oznámení zablokovaná v prohlížeči'; btn.disabled = true; }
    else { btn.textContent = '🔔 Povolit oznámení'; btn.disabled = false; }
  }
  render();
  btn.onclick = async function() {
    btn.disabled = true; btn.textContent = 'Zapínám...';
    var res = await subscribeToPush(workerId);
    perm = await pushGetPermissionState();
    render();
    if (!res.ok) alert('Nepovedlo se zapnout oznámení: ' + (res.error && res.error.message ? res.error.message : res.error));
  };
}
