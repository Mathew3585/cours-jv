-- Exercices bonus réussis : l'élève coche lui-même « J'ai réussi » (et peut décocher).
-- Rien de noté : le prof voit seulement ce qui a été fait, sur la fiche de l'élève.
create table public.exercices_faits (
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  exercice_id text not null check (char_length(exercice_id) between 1 and 120),
  fait_le timestamptz not null default now(),
  primary key (eleve_id, exercice_id)
);

alter table public.exercices_faits enable row level security;

create policy "exercices faits lisibles" on public.exercices_faits for select to authenticated
  using (eleve_id = (select auth.uid()) or (select prive.est_prof()));
create policy "exercice coché par l'élève" on public.exercices_faits for insert to authenticated
  with check (eleve_id = (select auth.uid()));
create policy "exercice décoché par l'élève" on public.exercices_faits for delete to authenticated
  using (eleve_id = (select auth.uid()));

revoke update on public.exercices_faits from authenticated;
revoke all on public.exercices_faits from anon;
