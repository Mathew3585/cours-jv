"use server";

import { redirect } from "next/navigation";
import { estEmail } from "@/lib/comptes";
import { emailDepuisIdentifiant } from "@/lib/session";
import { supabaseServeur } from "@/lib/supabase/serveur";

async function redirigerSelonRole(userId: string): Promise<never> {
  const supabase = await supabaseServeur();
  const { data: profil } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  redirect(profil?.role === "prof" ? "/prof" : "/parcours");
}

// ---------- Élèves : code reçu par e-mail ----------

export type EtatCode = { etape: "email" | "code"; email?: string; erreur?: string; info?: string };

/** Étape 1 : envoie un code à l'adresse de l'élève (seulement si son compte existe). */
export async function envoyerCode(_: EtatCode, formData: FormData): Promise<EtatCode> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!estEmail(email)) return { etape: "email", email, erreur: "Tape ton adresse e-mail complète, par exemple prenom.nom@ecole.fr." };

  const supabase = await supabaseServeur();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    const inconnu = /signups not allowed|not found|user not found/i.test(error.message);
    const tropVite = error.status === 429 || /rate limit|security purposes/i.test(error.message);
    return {
      etape: "email",
      email,
      erreur: inconnu
        ? "Aucun compte n'existe avec cette adresse. Vérifie l'orthographe, ou demande à ton prof de t'ajouter."
        : tropVite
          ? "Trop de codes demandés d'un coup. Attends une minute avant de réessayer."
          : "Le code n'a pas pu être envoyé. Réessaie dans un instant.",
    };
  }
  return { etape: "code", email, info: `Un code vient d'être envoyé à ${email}. Regarde aussi dans les indésirables.` };
}

/** Étape 2 : vérifie le code et connecte l'élève. */
export async function verifierCode(_: EtatCode, formData: FormData): Promise<EtatCode> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(code)) return { etape: "code", email, erreur: "Le code est fait de chiffres, recopie-le depuis l'e-mail." };

  const supabase = await supabaseServeur();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error || !data.user) {
    return { etape: "code", email, erreur: "Ce code est faux ou a expiré. Vérifie-le, ou demande un nouveau code." };
  }
  return redirigerSelonRole(data.user.id);
}

// ---------- Prof : identifiant et mot de passe ----------

export type EtatConnexion = { erreur?: string; identifiant?: string };

export async function connexion(_: EtatConnexion, formData: FormData): Promise<EtatConnexion> {
  const identifiant = String(formData.get("identifiant") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("mot-de-passe") ?? "");
  if (!identifiant || !motDePasse) return { erreur: "Remplis ton identifiant et ton mot de passe.", identifiant };

  const supabase = await supabaseServeur();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifiant.includes("@") ? identifiant : emailDepuisIdentifiant(identifiant),
    password: motDePasse,
  });
  if (error || !data.user) return { erreur: "Identifiant ou mot de passe incorrect.", identifiant };
  return redirigerSelonRole(data.user.id);
}

export async function deconnexion() {
  const supabase = await supabaseServeur();
  await supabase.auth.signOut();
  redirect("/connexion");
}
