// ui.js – sdílené UI pomůcky (Kosatka 2026+)

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
