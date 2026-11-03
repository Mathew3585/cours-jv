"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trouverProjet } from "@/contenu";
import { identifiantDepuisNom, identifiantLibre, motDePasseProvisoire } from "@/lib/comptes";
import { emailDepuisIdentifiant, exigerProf } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/serveur";

export type EtatAction = { ok?: string; erreur?: string };
export type CompteCree = { prenom: string; nom: string; identifiant: string; motDePasse: string; classe: string };
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

async function creerComptes(lignes: { prenom: string; nom: string }[], classeId: string): Promise<EtatCreation> {
  const admin = supabaseAdmin();
  const { data: classe } = await admin.from("classes").select("nom, annee").eq("id", classeId).maybeSingle();
  if (!classe) return { erreur: "Choisis une classe." };

  const { data: existants } = await admin.from("profiles").select("identifiant");
  const pris = new Set((existants ?? []).map((p) => p.identifiant));
  const crees: CompteCree[] = [];
  const echecs: string[] = [];

  for (const { prenom, nom } of lignes) {
    const base = identifiantDepuisNom(prenom, nom);
    if (base.length < 3 || base.startsWith(".") || base.endsWith(".")) {
      echecs.push(`${prenom} ${nom} : nom ou prénom vide`);
      continue;
    }
    const identifiant = identifiantLibre(base, pris);
    const motDePasse = motDePasseProvisoire();
    const { data, error } = await admin.auth.admin.createUser({
      email: emailDepuisIdentifiant(identifiant),
      password: motDePasse,
      email_confirm: true,
      user_metadata: { prenom, nom },
    });
    if (error || !data.user) {
      echecs.push(`${prenom} ${nom} : ${error?.message ?? "erreur inconnue"}`);
      continue;
    }
    const { error: erreurProfil } = await admin
      .from("profiles")
      .insert({ id: data.user.id, identifiant, prenom, nom, role: "eleve", classe_id: classeId });
    if (erreurProfil) {
      await admin.auth.admin.deleteUser(data.user.id);
      echecs.push(`${prenom} ${nom} : profil non créé`);
      continue;
    }
    pris.add(identifiant);
    crees.push({ prenom, nom, identifiant, motDePasse, classe: `${classe.nom} · ${classe.annee}` });
  }

  revalidatePath("/prof", "layout");
  return { crees, echecs };
}

export async function creerCompte(_: EtatCreation, formData: FormData): Promise<EtatCreation> {
  await exigerProf();
  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  if (!prenom || !nom) return { erreur: "Remplis le prénom et le nom." };
  return creerComptes([{ prenom, nom }], texte(formData, "classe"));
}

/** Import d'une liste : une ligne par élève, « prénom ; nom » ou « prénom, nom » (une ligne d'en-tête est ignorée). */
export async function importerComptes(_: EtatCreation, formData: FormData): Promise<EtatCreation> {
  await exigerProf();
  const brut = texte(formData, "liste");
  const lignes = brut
    .split(/\r?\n/)
    .map((l) => l.split(/[;,\t]/).map((c) => c.trim().replace(/^"|"$/g, "")))
    .filter((c) => c.length >= 2 && c[0] && c[1])
    .filter((c, i) => !(i === 0 && /pr[ée]nom/i.test(c[0])))
    .map(([prenom, nom]) => ({ prenom, nom }));
  if (lignes.length === 0) return { erreur: "Aucun élève trouvé. Une ligne par élève : prénom ; nom." };
  if (lignes.length > 60) return { erreur: "60 élèves maximum par import." };
  return creerComptes(lignes, texte(formData, "classe"));
}

export async function reinitialiserMotDePasse(eleveId: string): Promise<EtatAction> {
  await exigerProf();
  const motDePasse = motDePasseProvisoire();
  const { error } = await supabaseAdmin().auth.admin.updateUserById(eleveId, { password: motDePasse });
  if (error) return { erreur: "Le mot de passe n'a pas pu être changé." };
  return { ok: motDePasse };
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
