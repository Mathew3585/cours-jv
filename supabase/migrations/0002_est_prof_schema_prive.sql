-- est_prof() quitte le schéma public (exposé par l'API) pour un schéma privé.
create schema if not exists prive;
grant usage on schema prive to authenticated;

create or replace function prive.est_prof()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'prof');
$$;
revoke execute on function prive.est_prof() from public, anon;
grant execute on function prive.est_prof() to authenticated;

alter policy "profil lisible" on public.profiles using (id = (select auth.uid()) or (select prive.est_prof()));
alter policy "progression lisible" on public.progression_lecons using (eleve_id = (select auth.uid()) or (select prive.est_prof()));
alter policy "tentatives lisibles" on public.tentatives_quiz using (eleve_id = (select auth.uid()) or (select prive.est_prof()));
alter policy "réponses lisibles" on public.reponses_libres using (eleve_id = (select auth.uid()) or (select prive.est_prof()));
alter policy "défis lisibles" on public.defis_rendus using (eleve_id = (select auth.uid()) or (select prive.est_prof()));

drop function public.est_prof();
