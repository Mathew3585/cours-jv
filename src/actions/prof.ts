"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trouverProjet } from "@/contenu";
import { estEmail, nomDepuisEmail } from "@/lib/comptes";
import { exigerProf } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/serveur";

export type EtatAction = { ok?: string; erreur?: string };
export type CompteCree = { prenom: string; nom: string; email: string; classe: string };
export type EtatCreation = { erreur?: string; crees?: CompteCree[]; echecs?: string[] };

function texte(formData: FormData, cle: string) {
  return String(formData.get(cle) ?? "").trim();
}

// ---------- Classes ----------

export async function creerClasse(_: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const niveau = texte(formData, "niveau");
  const annee = texte(formData, "annee");
  const nom = texte(formData, "nom") || niveau;
  if (!["JV1", "JV2", "JV3"].includes(niveau)) return { erreur: "Choisis un niveau : JV1, JV2 ou JV3." };
  if (!/^\d{4}-\d{4}$/.test(annee)) return { erreur: "L'année s'écrit comme 2026-2027." };

  const { error } = await supabaseAdmin().from("classes").insert({ nom, niveau, annee });
  if (error) return { erreur: "La classe n'a pas pu être créée." };
  revalidatePath("/prof", "layout");
  return { ok: `Classe ${nom} créée.` };
}

export async function supprimerClasse(classeId: string) {
  await exigerProf();
  await supabaseAdmin().from("classes").delete().eq("id", classeId);
  revalidatePath("/prof", "layout");
  redirect("/prof/classes");
}

// ---------- Comptes élèves ----------

type LigneCompte = { email: string; prenom?: string; nom?: string };

/** Crée les comptes à partir des adresses e-mail : pas de mot de passe, l'élève se connecte avec un code reçu par e-mail. */
async function creerComptes(lignes: LigneCompte[], classeId: string): Promise<EtatCreation> {
  const admin = supabaseAdmin();
  const { data: classe } = await admin.from("classes").select("nom, annee").eq("id", classeId).maybeSingle();
  if (!classe) return { erreur: "Choisis une classe." };

  const { data: existants } = await admin.from("profiles").select("identifiant");
  const pris = new Set((existants ?? []).map((p) => p.identifiant.toLowerCase()));
  const crees: CompteCree[] = [];
  const echecs: string[] = [];

  for (const ligne of lignes) {
    const email = ligne.email.trim().toLowerCase();
    if (!estEmail(email)) {
      echecs.push(`${ligne.email} : adresse e-mail invalide`);
      continue;
    }
    if (pris.has(email)) {
      echecs.push(`${email} : un compte existe déjà avec cette adresse`);
      continue;
    }
    const devine = nomDepuisEmail(email);
    const prenom = ligne.prenom?.trim() || devine.prenom;
    const nom = ligne.nom?.trim() || devine.nom;

    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { prenom, nom } });
    if (error || !data.user) {
      echecs.push(`${email} : ${error?.message ?? "erreur inconnue"}`);
      continue;
    }
    const { error: erreurProfil } = await admin
      .from("profiles")
      .insert({ id: data.user.id, identifiant: email, prenom, nom, role: "eleve", classe_id: classeId });
    if (erreurProfil) {
      await admin.auth.admin.deleteUser(data.user.id);
      echecs.push(`${email} : profil non créé`);
      continue;
    }
    pris.add(email);
    crees.push({ prenom, nom, email, classe: `${classe.nom} · ${classe.annee}` });
  }

  revalidatePath("/prof", "layout");
  return { crees, echecs };
}

export async function creerCompte(_: EtatCreation, formData: FormData): Promise<EtatCreation> {
  await exigerProf();
  const email = texte(formData, "email");
  if (!email) return { erreur: "Mets l'adresse e-mail de l'élève." };
  return creerComptes([{ email }], texte(formData, "classe"));
}

/**
 * Import d'une liste : une adresse e-mail par ligne.
 * On peut ajouter le prénom et le nom après l'adresse (« adresse ; prénom ; nom »), sinon ils sont devinés.
 */
export async function importerComptes(_: EtatCreation, formData: FormData): Promise<EtatCreation> {
  await exigerProf();
  const lignes = texte(formData, "liste")
    .split(/\r?\n/)
    .map((l) => l.split(/[;,\t]/).map((c) => c.trim().replace(/^"|"$/g, "")))
    .map((cellules): LigneCompte | null => {
      const i = cellules.findIndex((c) => c.includes("@"));
      if (i < 0) return null;
      const autres = cellules.filter((_, j) => j !== i && cellules[j]);
      return { email: cellules[i], prenom: autres[0], nom: autres[1] };
    })
    .filter((l): l is LigneCompte => l !== null);
  if (lignes.length === 0) return { erreur: "Aucune adresse e-mail trouvée. Mets une adresse par ligne." };
  if (lignes.length > 60) return { erreur: "60 élèves maximum par import." };
  return creerComptes(lignes, texte(formData, "classe"));
}

/** Corrige le prénom, le nom ou l'adresse e-mail d'un élève. */
export async function modifierEleve(eleveId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const email = texte(formData, "email").toLowerCase();
  if (!prenom) return { erreur: "Le prénom ne peut pas être vide." };
  if (!estEmail(email)) return { erreur: "Adresse e-mail invalide." };

  const admin = supabaseAdmin();
  const { data: profil } = await admin.from("profiles").select("identifiant, role").eq("id", eleveId).maybeSingle();
  if (profil?.role !== "eleve") return { erreur: "Élève introuvable." };
  if (email !== profil.identifiant.toLowerCase()) {
    const { data: doublon } = await admin.from("profiles").select("id").eq("identifiant", email).maybeSingle();
    if (doublon) return { erreur: "Un autre compte utilise déjà cette adresse." };
    const { error } = await admin.auth.admin.updateUserById(eleveId, { email, email_confirm: true });
    if (error) return { erreur: "L'adresse n'a pas pu être changée." };
  }
  const { error } = await admin.from("profiles").update({ prenom, nom, identifiant: email }).eq("id", eleveId);
  if (error) return { erreur: "Les informations n'ont pas pu être enregistrées." };
  revalidatePath("/prof", "layout");
  return { ok: "Informations enregistrées." };
}

export async function changerClasse(eleveId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const classeId = texte(formData, "classe") || null;
  const { error } = await supabaseAdmin().from("profiles").update({ classe_id: classeId }).eq("id", eleveId).eq("role", "eleve");
  if (error) return { erreur: "La classe n'a pas pu être changée." };
  revalidatePath("/prof", "layout");
  return { ok: "Classe mise à jour." };
}

export async function enregistrerNotePrivee(eleveId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const note = texte(formData, "note").slice(0, 2000) || null;
  const { error } = await supabaseAdmin().from("profiles").update({ note_prof: note }).eq("id", eleveId);
  if (error) return { erreur: "La note n'a pas pu être enregistrée." };
  return { ok: "Note enregistrée." };
}

export async function supprimerEleve(eleveId: string) {
  const u = await exigerProf();
  if (eleveId === u.id) return;
  const admin = supabaseAdmin();
  const { data: profil } = await admin.from("profiles").select("role").eq("id", eleveId).maybeSingle();
  if (profil?.role !== "eleve") return;
  await admin.auth.admin.deleteUser(eleveId);
  revalidatePath("/prof", "layout");
  redirect("/prof/comptes");
}

// ---------- Projets et deadlines ----------

export async function enregistrerProjetClasse(projetSlug: string, classeId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const projet = trouverProjet(projetSlug);
  if (!projet) return { erreur: "Projet inconnu." };
  const admin = supabaseAdmin();

  const seuil = Number.parseInt(texte(formData, "seuil"), 10);
  const { error } = await admin.from("classe_projets").upsert({
    classe_id: classeId,
    projet_slug: projetSlug,
    ouvert_le: texte(formData, "ouvert_le") || new Date().toISOString().slice(0, 10),
    deblocage_progressif: formData.get("deblocage_progressif") === "on",
    notes_visibles: formData.get("notes_visibles") === "on",
    seuil_validation: Number.isFinite(seuil) ? Math.min(100, Math.max(0, seuil)) : 70,
  });
  if (error) return { erreur: "Le projet n'a pas pu être ouvert." };

  for (const mod of projet.modules) {
    const date = texte(formData, `deadline-${mod.slug}`);
    const cle = { classe_id: classeId, projet_slug: projetSlug, module_slug: mod.slug };
    if (date) await admin.from("deadlines").upsert({ ...cle, date });
    else await admin.from("deadlines").delete().match(cle);
  }

  revalidatePath("/", "layout");
  return { ok: "Enregistré. Les élèves de la classe voient le projet et ses deadlines." };
}

export async function fermerProjetClasse(projetSlug: string, classeId: string) {
  await exigerProf();
  const admin = supabaseAdmin();
  await admin.from("classe_projets").delete().match({ classe_id: classeId, projet_slug: projetSlug });
  await admin.from("deadlines").delete().match({ classe_id: classeId, projet_slug: projetSlug });
  revalidatePath("/", "layout");
}

// ---------- Corrections ----------

export async function corrigerReponse(reponseId: number, _: EtatAction, formData: FormData): Promise<EtatAction> {
  await exigerProf();
  const note = Number.parseInt(texte(formData, "note"), 10);
  if (!Number.isInteger(note) || note < 0 || note > 5) return { erreur: "Choisis une note de 0 à 5." };
  const commentaire = texte(formData, "commentaire").slice(0, 2000) || null;
  const { error } = await supabaseAdmin()
    .from("reponses_libres")
    .update({ note, commentaire, corrige_le: new Date().toISOString() })
    .eq("id", reponseId);
  if (error) return { erreur: "La correction n'a pas pu être enregistrée." };
  revalidatePath("/", "layout");
  return { ok: "Correction enregistrée." };
}

// ---------- Messages ----------

function texteMessage(formData: FormData) {
  return String(formData.get("message") ?? "").trim();
}

export async function envoyerMessage(eleveId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  const u = await exigerProf();
  const texte = texteMessage(formData);
  if (!texte) return { erreur: "Écris un message avant d'envoyer." };
  if (texte.length > 500) return { erreur: "500 caractères maximum." };
  const { error } = await supabaseAdmin().from("messages").insert({ eleve_id: eleveId, auteur_id: u.id, texte });
  if (error) return { erreur: "Le message n'a pas pu être envoyé." };
  revalidatePath(`/prof/eleves/${eleveId}`);
  return { ok: "Message envoyé. Il s'affiche tout de suite chez l'élève s'il est connecté, sinon à sa prochaine connexion." };
}

export async function envoyerMessageClasse(classeId: string, _: EtatAction, formData: FormData): Promise<EtatAction> {
  const u = await exigerProf();
  const texte = texteMessage(formData);
  if (!texte) return { erreur: "Écris un message avant d'envoyer." };
  if (texte.length > 500) return { erreur: "500 caractères maximum." };
  const admin = supabaseAdmin();
  const { data: eleves } = await admin.from("profiles").select("id").eq("classe_id", classeId).eq("role", "eleve");
  if (!eleves?.length) return { erreur: "Il n'y a aucun élève dans cette classe." };
  const { error } = await admin.from("messages").insert(eleves.map((e) => ({ eleve_id: e.id, auteur_id: u.id, texte })));
  if (error) return { erreur: "Le message n'a pas pu être envoyé." };
  return { ok: `Message envoyé aux ${eleves.length} élèves de la classe.` };
}
