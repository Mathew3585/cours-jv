"use server";

import { redirect } from "next/navigation";
import { emailDepuisIdentifiant } from "@/lib/session";
import { supabaseServeur } from "@/lib/supabase/serveur";

async function redirigerSelonRole(userId: string): Promise<never> {
  const supabase = await supabaseServeur();
  const { data: profil } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  redirect(profil?.role === "prof" ? "/prof" : "/parcours");
}

// ---------- Connexion : adresse e-mail (ou identifiant du prof) et mot de passe ----------

export type EtatConnexion = { erreur?: string; identifiant?: string };

export async function connexion(_: EtatConnexion, formData: FormData): Promise<EtatConnexion> {
  const identifiant = String(formData.get("identifiant") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("mot-de-passe") ?? "");
  if (!identifiant || !motDePasse) return { erreur: "Remplis ton adresse e-mail et ton mot de passe.", identifiant };

  const supabase = await supabaseServeur();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifiant.includes("@") ? identifiant : emailDepuisIdentifiant(identifiant),
    password: motDePasse,
  });
  if (error || !data.user) {
    return { erreur: "Adresse e-mail ou mot de passe incorrect. Vérifie l'orthographe, ou demande à ton prof.", identifiant };
  }
  return redirigerSelonRole(data.user.id);
}

export async function deconnexion() {
  const supabase = await supabaseServeur();
  await supabase.auth.signOut();
  redirect("/connexion");
}
