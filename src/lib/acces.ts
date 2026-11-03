import "server-only";
import { notFound, redirect } from "next/navigation";
import { trouverProjet } from "@/contenu";
import { donneesEleve, type DonneesEleve } from "@/lib/progression";
import { utilisateurCourant, type Utilisateur } from "@/lib/session";
import type { ClasseProjet } from "@/lib/supabase/types";

export type Acces =
  | { prof: true; u: Utilisateur; donnees: null; regles: ClasseProjet }
  | { prof: false; u: Utilisateur; donnees: DonneesEleve; regles: ClasseProjet };

/** Règles par défaut quand le prof regarde un projet en aperçu. */
const reglesApercu: ClasseProjet = {
  classe_id: "",
  projet_slug: "",
  ouvert_le: "",
  deblocage_progressif: false,
  seuil_validation: 70,
  notes_visibles: true,
};

/**
 * Vérifie qu'on peut voir ce projet : un élève seulement s'il est ouvert pour sa classe,
 * le prof toujours (en aperçu, sans rien enregistrer).
 */
export async function accesProjet(projetSlug: string): Promise<Acces> {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  if (!trouverProjet(projetSlug)) notFound();

  if (u.profil.role === "prof") return { prof: true, u, donnees: null, regles: { ...reglesApercu, projet_slug: projetSlug } };

  const donnees = await donneesEleve(u);
  const ouvert = donnees.projetsOuverts.find((x) => x.projet.slug === projetSlug);
  if (!ouvert) notFound();
  return { prof: false, u, donnees, regles: ouvert.regles };
}
