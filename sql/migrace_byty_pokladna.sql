-- ============================================================
-- MIGRACE: Byty/nájmy, pokladní kniha, automatické platby
-- Spustit v Supabase → SQL editor. Bezpečné spustit i vícekrát
-- (IF NOT EXISTS všude, kde to jde).
-- ============================================================

-- 1) Nové provozovny (byty/domy k pronájmu) -----------------

insert into businesses (nazev, ikona, poradi)
select 'Pronájmy', '🏘️', (select coalesce(max(poradi),0)+1 from businesses)
where not exists (select 1 from businesses where nazev = 'Pronájmy');

insert into venues (business_id, nazev, slug, ikona, rezim, poradi)
select b.id, 'Zborovská', 'zborovska', '🏢', 'byty',
       (select coalesce(max(poradi),0)+1 from venues)
from businesses b where b.nazev='Pronájmy'
and not exists (select 1 from venues where slug='zborovska');

insert into venues (business_id, nazev, slug, ikona, rezim, poradi)
select b.id, 'Veleslavínova', 'veleslavinova', '🏢', 'byty',
       (select coalesce(max(poradi),0)+2 from venues)
from businesses b where b.nazev='Pronájmy'
and not exists (select 1 from venues where slug='veleslavinova');

insert into venues (business_id, nazev, slug, ikona, rezim, poradi)
select b.id, 'Křimice', 'krimice', '🏠', 'byty',
       (select coalesce(max(poradi),0)+3 from venues)
from businesses b where b.nazev='Pronájmy'
and not exists (select 1 from venues where slug='krimice');

-- 2) Byty/jednotky ------------------------------------------
-- Jeden řádek = jeden byt/dům. mesicni_castka = kolik má měsíčně platit.
create table if not exists byty (
  id bigint primary key,
  venue_id bigint not null references venues(id),
  nazev text not null,               -- např. "Byt 3", "Přízemí"
  najemnik text,                     -- jméno nájemníka
  mesicni_castka numeric not null default 0,
  poznamka text,
  aktivni boolean not null default true
);

-- 3) Platby za byty (měsíční příjmy od nájemníků) ------------
create table if not exists byty_platby (
  id bigint primary key,
  byt_id bigint not null references byty(id),
  mesic text not null,               -- formát 'YYYY-MM'
  datum date not null default current_date,
  castka numeric not null,
  poznamka text
);
create index if not exists byty_platby_byt_mesic on byty_platby(byt_id, mesic);

-- Automaticky vyplní byty podle zadání (20 bytů Zborovská, 9 bytů
-- Veleslavínova, 1 dům Křimice) - jen pokud tam ještě žádné nejsou.
insert into byty (id, venue_id, nazev, mesicni_castka)
select (select coalesce(max(id),0) from byty) + row_number() over (),
       v.id, 'Byt ' || gs, 0
from venues v, generate_series(1,20) gs
where v.slug='zborovska' and not exists (select 1 from byty where venue_id=v.id);

insert into byty (id, venue_id, nazev, mesicni_castka)
select (select coalesce(max(id),0) from byty) + row_number() over (),
       v.id, 'Byt ' || gs, 0
from venues v, generate_series(1,9) gs
where v.slug='veleslavinova' and not exists (select 1 from byty where venue_id=v.id);

insert into byty (id, venue_id, nazev, mesicni_castka)
select (select coalesce(max(id),0) from byty) + 1, v.id, 'Dům', 0
from venues v
where v.slug='krimice' and not exists (select 1 from byty where venue_id=v.id);

-- 4) Pokladní kniha (příjmy/výdaje hotovosti pro nové podniky) --
create table if not exists pokladna (
  id bigint primary key,
  venue_id bigint not null references venues(id),
  datum date not null default current_date,
  typ text not null check (typ in ('prijem','vydaj')),
  castka numeric not null,
  popis text not null,
  worker_id bigint references workers(id)
);
create index if not exists pokladna_venue on pokladna(venue_id, datum);

-- 5) Automatické (opakované) platby - elektřina, voda apod. -----
create table if not exists naklady_opakovane (
  id bigint primary key,
  venue_id bigint not null references venues(id),
  popis text not null,
  castka numeric not null,
  den_v_mesici int not null default 1,   -- kterého dne v měsíci se má zapsat
  aktivni boolean not null default true
);

-- naklady potřebuje vědět, že daný řádek vznikl automaticky
-- (aby se stejná platba nezapsala dvakrát za jeden měsíc)
alter table naklady add column if not exists opakovany_id bigint references naklady_opakovane(id);
alter table naklady add column if not exists mesic text; -- 'YYYY-MM' - jen u automatických plateb

-- 6) ÚČTY - podpora "vymazání" po výplatě (soft-delete, položky
--    zůstávají v databázi pro admina/audit, jen se skryjí brigádníkovi) --
alter table ucty add column if not exists smazano_at timestamptz;
alter table ucty add column if not exists smazano_by bigint references workers(id);

-- ============================================================
-- Poznámka k RLS: pokud máš na těchto tabulkách zapnuté Row Level
-- Security, přidej politiky podle vzoru tabulky "naklady"/"ucty",
-- ať do nich anon klíč z appky může číst a zapisovat.
-- ============================================================
