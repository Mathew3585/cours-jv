// Généré depuis Supabase (generate_typescript_types), puis réduit aux tables du schéma public.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Requis extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Requis> & Partial<Omit<Row, Requis>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Classe = { id: string; nom: string; niveau: string; annee: string; created_at: string };
export type Profil = {
  id: string;
  identifiant: string;
  prenom: string;
  nom: string;
  role: string;
  classe_id: string | null;
  note_prof: string | null;
  created_at: string;
};
export type ClasseProjet = {
  classe_id: string;
  projet_slug: string;
  ouvert_le: string;
  deblocage_progressif: boolean;
  seuil_validation: number;
  notes_visibles: boolean;
};
export type Deadline = { classe_id: string; projet_slug: string; module_slug: string; date: string };
export type ProgressionLecon = { eleve_id: string; lecon_id: string; etape: number; termine: boolean; maj_le: string };
export type TentativeQuiz = {
  id: number;
  eleve_id: string;
  quiz_id: string;
  score: number;
  total: number;
  reponses: Json;
  created_at: string;
};
export type ReponseLibre = {
  id: number;
  eleve_id: string;
  question_id: string;
  reponse: string;
  note: number | null;
  commentaire: string | null;
  corrige_le: string | null;
  created_at: string;
  maj_le: string;
};
export type DefiRendu = {
  id: number;
  eleve_id: string;
  defi_id: string;
  lien: string | null;
  commentaire: string | null;
  created_at: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      classes: Table<Classe, "nom" | "niveau" | "annee">;
      profiles: Table<Profil, "id" | "identifiant" | "prenom" | "nom">;
      classe_projets: Table<ClasseProjet, "classe_id" | "projet_slug">;
      deadlines: Table<Deadline, "classe_id" | "projet_slug" | "module_slug" | "date">;
      progression_lecons: Table<ProgressionLecon, "eleve_id" | "lecon_id">;
      tentatives_quiz: Table<TentativeQuiz, "eleve_id" | "quiz_id" | "score" | "total">;
      reponses_libres: Table<ReponseLibre, "eleve_id" | "question_id" | "reponse">;
      defis_rendus: Table<DefiRendu, "eleve_id" | "defi_id">;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
