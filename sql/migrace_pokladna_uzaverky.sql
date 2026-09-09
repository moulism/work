-- ============================================================
-- MIGRACE: Měsíční uzávěrky pokladny (počáteční/konečný stav)
-- Spustit v Supabase → SQL editor. Bezpečné spustit i vícekrát
-- (IF NOT EXISTS všude, kde to jde).
-- ============================================================

-- Sem se ukládá, kolik admin fyzicky napočítal v pokladně (nebo na online
-- peněžence) na začátku a na konci měsíce. Appka si sama spočítá, kolik by
-- tam podle pokladní knihy (tabulka "pokladna") mělo být, a porovná to -
-- proto tahle tabulka drží jen ten "skutečný" zápis, ne výpočet.
create table if not exists pokladna_uzaverky (
  id bigint primary key,
  venue_id bigint not null references venues(id),
  ucet text not null default 'hotovost' check (ucet in ('hotovost','online')),
  rok int not null,
  mesic int not null check (mesic between 1 and 12),
  typ text not null check (typ in ('pocatecni','konecny')),
  castka numeric not null,
  poznamka text,
  datum date not null default current_date,
  admin_id bigint references workers(id)
);

-- Jeden zápis na (provozovna, účet, rok, měsíc, typ) - "Uložit" pak vždycky
-- jen přepíše ten stávající, ať omylem nevzniknou duplicity.
create unique index if not exists pokladna_uzaverky_unique
  on pokladna_uzaverky(venue_id, ucet, rok, mesic, typ);

-- ============================================================
-- Poznámka k RLS: pokud máš na "pokladna" zapnuté Row Level Security,
-- přidej stejné politiky i sem, ať do tabulky anon klíč z appky může
-- číst a zapisovat.
-- ============================================================
