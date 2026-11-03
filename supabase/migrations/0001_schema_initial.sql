-- Atelier JV : comptes, classes, projets ouverts, deadlines, progression, quiz, réponses libres, défis.
-- Les écritures sensibles (scores, notes, comptes) passent par le serveur avec la clé secrète :
-- les élèves n'ont le droit d'écrire que leur progression et le texte de leurs réponses.

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  niveau text not null check (niveau in ('JV1', 'JV2', 'JV3')),
  annee text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  identifiant text not null unique,
  prenom text not null,
  nom text not null,
  role text not null default 'eleve' check (role in ('eleve', 'prof')),
  classe_id uuid references public.classes (id) on delete set null,
  note_prof text,
  created_at timestamptz not null default now()
);
create index profiles_classe_id_idx on public.profiles (classe_id);

create table public.classe_projets (
  classe_id uuid not null references public.classes (id) on delete cascade,
  projet_slug text not null,
  ouvert_le date not null default current_date,
  deblocage_progressif boolean not null default false,
  seuil_validation integer not null default 70 check (seuil_validation between 0 and 100),
  notes_visibles boolean not null default true,
  primary key (classe_id, projet_slug)
);

create table public.deadlines (
  classe_id uuid not null references public.classes (id) on delete cascade,
  projet_slug text not null,
  module_slug text not null,
  date date not null,
  primary key (classe_id, projet_slug, module_slug)
);

-- Une ligne par élève et par leçon ; lecon_id = "projet/module/lecon"
create table public.progression_lecons (
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  lecon_id text not null,
  etape integer not null default 0,
  termine boolean not null default false,
  maj_le timestamptz not null default now(),
  primary key (eleve_id, lecon_id)
);

create table public.tentatives_quiz (
  id bigint generated always as identity primary key,
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  quiz_id text not null,
  score integer not null,
  total integer not null,
  reponses jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index tentatives_quiz_eleve_idx on public.tentatives_quiz (eleve_id, quiz_id);

create table public.reponses_libres (
  id bigint generated always as identity primary key,
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  reponse text not null,
  note integer check (note between 0 and 5),
  commentaire text,
  corrige_le timestamptz,
  created_at timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  unique (eleve_id, question_id)
);

create table public.defis_rendus (
  id bigint generated always as identity primary key,
  eleve_id uuid not null references public.profiles (id) on delete cascade,
  defi_id text not null,
  lien text,
  commentaire text,
  created_at timestamptz not null default now(),
  unique (eleve_id, defi_id)
);

-- ---------- Fonctions d'aide pour les règles d'accès ----------

create or replace function public.est_prof()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'prof');
$$;

-- ---------- Règles d'accès (RLS) ----------

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.classe_projets enable row level security;
alter table public.deadlines enable row level security;
alter table public.progression_lecons enable row level security;
alter table public.tentatives_quiz enable row level security;
alter table public.reponses_libres enable row level security;
alter table public.defis_rendus enable row level security;

-- Classes, projets ouverts et deadlines : lisibles par tout utilisateur connecté, modifiés par le serveur seulement
create policy "classes lisibles" on public.classes for select to authenticated using (true);
create policy "projets ouverts lisibles" on public.classe_projets for select to authenticated using (true);
create policy "deadlines lisibles" on public.deadlines for select to authenticated using (true);

-- Profils : chacun lit le sien, le prof lit tout
create policy "profil lisible" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.est_prof()));

-- Progression : l'élève lit et écrit la sienne, le prof lit tout
create policy "progression lisible" on public.progression_lecons for select to authenticated
  using (eleve_id = (select auth.uid()) or (select public.est_prof()));
create policy "progression ajoutée par l'élève" on public.progression_lecons for insert to authenticated
  with check (eleve_id = (select auth.uid()));
create policy "progression modifiée par l'élève" on public.progression_lecons for update to authenticated
  using (eleve_id = (select auth.uid())) with check (eleve_id = (select auth.uid()));

-- Quiz : lecture seulement (les scores sont calculés et enregistrés par le serveur)
create policy "tentatives lisibles" on public.tentatives_quiz for select to authenticated
  using (eleve_id = (select auth.uid()) or (select public.est_prof()));

-- Réponses libres : l'élève écrit le texte de la sienne ; la note est posée par le serveur
create policy "réponses lisibles" on public.reponses_libres for select to authenticated
  using (eleve_id = (select auth.uid()) or (select public.est_prof()));
create policy "réponse ajoutée par l'élève" on public.reponses_libres for insert to authenticated
  with check (eleve_id = (select auth.uid()) and note is null and commentaire is null and corrige_le is null);
create policy "réponse modifiée par l'élève" on public.reponses_libres for update to authenticated
  using (eleve_id = (select auth.uid()) and corrige_le is null) with check (eleve_id = (select auth.uid()));

revoke insert, update on public.reponses_libres from authenticated;
grant insert (eleve_id, question_id, reponse) on public.reponses_libres to authenticated;
grant update (reponse, maj_le) on public.reponses_libres to authenticated;

-- Défis : l'élève rend le sien
create policy "défis lisibles" on public.defis_rendus for select to authenticated
  using (eleve_id = (select auth.uid()) or (select public.est_prof()));
create policy "défi rendu par l'élève" on public.defis_rendus for insert to authenticated
  with check (eleve_id = (select auth.uid()));
create policy "défi modifié par l'élève" on public.defis_rendus for update to authenticated
  using (eleve_id = (select auth.uid())) with check (eleve_id = (select auth.uid()));

-- Les visiteurs non connectés n'ont accès à rien
revoke all on all tables in schema public from anon;
