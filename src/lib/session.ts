import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Classe, Profil } from "@/lib/supabase/types";

export type Utilisateur = { id: string; profil: Profil; classe: Classe | null };

/** L'utilisateur connecté et son profil, une seule fois par requête. */
export const utilisateurCourant = cache(async (): Promise<Utilisateur | null> => {
  const supabase = await supabaseServeur();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const { data: profil } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profil) return null;

  let classe: Classe | null = null;
  if (profil.classe_id) {
    const { data: c } = await supabase.from("classes").select("*").eq("id", profil.classe_id).maybeSingle();
    classe = c;
  }
  return { id, profil, classe };
});

export async function exigerEleve() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  if (u.profil.role === "prof") redirect("/prof");
  return u;
}

export async function exigerProf() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  if (u.profil.role !== "prof") redirect("/parcours");
  return u;
}

/** Les identifiants (prenom.nom) sont transformés en adresse interne pour Supabase Auth. */
export const DOMAINE_COMPTES = "eleves.atelier-jv.fr";
export function emailDepuisIdentifiant(identifiant: string) {
  return `${identifiant.trim().toLowerCase()}@${DOMAINE_COMPTES}`;
}
