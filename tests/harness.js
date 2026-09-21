// tests/harness.js
//
// Načte js/data.js do izolovaného VM kontextu, se zamockovaným Supabase
// klientem a minimálními stub verzemi browser globálů (document/window/
// localStorage), které data.js na pár místech používá jen uvnitř funkcí,
// co testy nevolají. Cílem není testovat síť ani Supabase samotné (to je
// zodpovědnost Supabase), ale ČISTOU BYZNYS LOGIKU appky - výpočty mezd,
// součty, formátování dat, atd.
//
// Každý test soubor by měl zavolat freshContext() na začátku KAŽDÉHO testu
// (ne jen jednou na celý soubor), ať si testy vzájemně nešahají do stejných
// polí (WORKERS, PRACOVNI_DNY, UCTY_POLOZKY, ...) a nejsou na sobě závislé.

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_JS_PATH = path.join(__dirname, '..', 'js', 'data.js');
const SRC = fs.readFileSync(DATA_JS_PATH, 'utf8');

// Minimální "thenable" query builder, co napodobuje řetězení Supabase JS
// klienta (.from().select().eq()... a pak `await` na konci). Testy business
// logiky nepotřebují, aby vracel reálná data - funkce v data.js si po
// úspěšném zápisu samy udržují pole v paměti (WORKERS, PRACOVNI_DNY, ...),
// takže stačí, že mock nikdy nevrátí chybu.
function makeQueryBuilder() {
  const builder = {
    select() { return builder; },
    insert() { return builder; },
    update() { return builder; },
    upsert() { return builder; },
    delete() { return builder; },
    eq() { return builder; },
    neq() { return builder; },
    order() { return builder; },
    limit() { return builder; },
    single() { return builder; },
    maybeSingle() { return builder; },
    in() { return builder; },
    then(resolve, reject) {
      return Promise.resolve({ data: [], error: null }).then(resolve, reject);
    },
  };
  return builder;
}

function makeMockSupabaseClient() {
  return {
    from() { return makeQueryBuilder(); },
    storage: {
      from(bucket) {
        return {
          upload() { return Promise.resolve({ data: {}, error: null }); },
          getPublicUrl() { return { data: { publicUrl: 'https://mock.local/' + bucket } }; },
          remove() { return Promise.resolve({ data: {}, error: null }); },
        };
      },
    },
    channel() { return { on() { return this; }, subscribe() { return this; } }; },
    removeChannel() {},
  };
}

// Vytvoří NOVÝ, čistý VM kontext s načteným data.js. Volej na začátku
// každého testu (ne jednou globálně), ať testy na sobě nejsou závislé.
function freshContext() {
  const sandbox = {
    console,
    fetch: async () => ({ ok: false, status: 599, json: async () => ({ error: 'mock: síť je v testech vypnutá' }) }),
    supabase: { createClient: () => makeMockSupabaseClient() },
    document: {
      getElementById() { return null; },
      createElement() { return { style: {}, appendChild() {} }; },
      body: { appendChild() {} },
    },
    window: {
      location: { pathname: '/index.html', href: '' },
      matchMedia: () => ({ matches: false }),
      navigator: {},
    },
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {},
    },
    navigator: {},
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  const context = vm.createContext(sandbox);
  new vm.Script(SRC, { filename: 'js/data.js' }).runInContext(context);
  return context;
}

module.exports = { freshContext };
