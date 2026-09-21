# hracholusky

## Testy

Testy pokrývají byznys logiku v `js/data.js` (výpočet mezd, účty, zálohy,
penalizace, pokladna, dostupnost, datumové helpery) - běží v Node.js bez
připojení na skutečnou Supabase databázi (viz `tests/harness.js`).

Spuštění lokálně:

```
npm test
```

Testy se automaticky spouští v CI (GitHub Actions, `.github/workflows/tests.yml`)
při každém pushi a pull requestu do `main`.
