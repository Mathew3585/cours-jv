-- Messages du prof à un élève, affichés en bandeau en temps réel.
-- Seul le serveur écrit les messages (clé secrète, après vérification du rôle prof) ;
-- l'élève lit les siens et ne peut modifier que la date de lecture.
create table public.messages (
  id bigint generated always as identity primary key,
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  auteur_id uuid references public.profiles (id) on delete set null,
  texte text not null check (char_length(texte) between 1 and 500),
  created_at timestamptz not null default now(),
  lu_le timestamptz
);
create index messages_eleve_idx on public.messages (eleve_id, created_at desc);

alter table public.messages enable row level security;

create policy "messages lisibles" on public.messages for select to authenticated
  using (eleve_id = (select auth.uid()) or (select prive.est_prof()));
create policy "message marqué lu par l'élève" on public.messages for update to authenticated
  using (eleve_id = (select auth.uid())) with check (eleve_id = (select auth.uid()));

revoke insert, update, delete on public.messages from authenticated;
grant update (lu_le) on public.messages to authenticated;
revoke all on public.messages from anon;

-- Temps réel : l'élève reçoit le message sans recharger la page
alter publication supabase_realtime add table public.messages;
