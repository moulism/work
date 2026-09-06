-- ============================================================
-- MIGRACE: Online peněženka (platby kartou) + kategorie nákladů
-- Spustit v Supabase → SQL editor. Bezpečné spustit i vícekrát
-- (IF NOT EXISTS všude, kde to jde).
-- ============================================================

-- 1) Pokladní kniha teď rozlišuje "ucet": klasická hotovostní pokladna
--    (safu) vs. "online peněženka" (platby kartou) - používá Anděl Café
--    a Anděl Music Club. Staré řádky dostanou výchozí 'hotovost', ať
--    zůstane zpětně kompatibilní se vším, co appka do teď zapsala.
alter table pokladna add column if not exists ucet text not null default 'hotovost';
alter table pokladna drop constraint if exists pokladna_ucet_check;
alter table pokladna add constraint pokladna_ucet_check check (ucet in ('hotovost','online'));

-- 2) Kategorie nákladů (mzdy, odvody, teplo, elektřina, telefon,
--    internet, DPH) - nepovinné, ať se dá náklad/faktura zařadit a
--    appka pak sama sečte, kolik stálo co za daný měsíc (Statistiky).
--    Bez kategorie (NULL) = "Ostatní", nic se tím nerozbije.
alter table naklady add column if not exists kategorie text;
alter table naklady_opakovane add column if not exists kategorie text;

-- ============================================================
-- Poznámka k RLS: pokud máš na "pokladna"/"naklady"/"naklady_opakovane"
-- zapnuté Row Level Security, tahle migrace nic v politikách nemění -
-- nové sloupce se řídí stejnými pravidly jako zbytek řádku.
-- ============================================================
