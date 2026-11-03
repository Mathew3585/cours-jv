"use server";

import { redirect } from "next/navigation";
import { emailDepuisIdentifiant } from "@/lib/session";
import { supabaseServeur } from "@/lib/supabase/serveur";

export type EtatConnexion = { erreur?: string; identifiant?: string };

export async function connexion(_: EtatConnexion, formData: FormData): Promise<EtatConnexion> {
  const identifiant = String(formData.get("identifiant") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("mot-de-passe") ?? "");
  if (!identifiant || !motDePasse) return { erreur: "Remplis ton identifiant et ton mot de passe.", identifiant };

  const supabase = await supabaseServeur();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailDepuisIdentifiant(identifiant),
    password: motDePasse,
  });
  if (error || !data.user) {
    return { erreur: "Identifiant ou mot de passe incorrect. Vérifie l'orthographe, ou demande à ton prof.", identifiant };
  }

  const { data: profil } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(profil?.role === "prof" ? "/prof" : "/parcours");
}

export async function deconnexion() {
  const supabase = await supabaseServeur();
  await supabase.auth.signOut();
  redirect("/connexion");
}
