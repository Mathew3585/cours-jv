"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trouverExercice, trouverQuestionLibre, trouverQuiz } from "@/contenu";
import { exigerEleve } from "@/lib/session";
import { supabaseAdmin, supabaseServeur } from "@/lib/supabase/serveur";

/** Retient l'étape où l'élève en est dans une leçon, pour « Reprendre ». */
export async function enregistrerEtape(leconId: string, etape: number) {
  const u = await exigerEleve();
  if (!Number.isInteger(etape) || etape < 0 || etape > 500) return;
  const supabase = await supabaseServeur();
  await supabase
    .from("progression_lecons")
    .update({ etape, maj_le: new Date().toISOString() })
    .eq("eleve_id", u.id)
    .eq("lecon_id", leconId);
}

export async function terminerLecon(leconId: string, destination: string) {
  const u = await exigerEleve();
  const supabase = await supabaseServeur();
  await supabase
    .from("progression_lecons")
    .upsert({ eleve_id: u.id, lecon_id: leconId, termine: true, maj_le: new Date().toISOString() });
  revalidatePath("/", "layout");
  redirect(destination.startsWith("/") ? destination : "/parcours");
}

export type ResultatQuiz = { score: number; total: number; corrections: boolean[] } | { erreur: string };

/** Le score est recalculé ici, à partir des réponses : l'élève ne peut pas envoyer un faux score. */
export async function soumettreQuiz(quizId: string, reponses: number[]): Promise<ResultatQuiz> {
  const u = await exigerEleve();
  const trouve = trouverQuiz(quizId);
  if (!trouve) return { erreur: "Ce quiz n'existe pas." };

  const { questions } = trouve.quiz;
  const corrections = questions.map((q, i) => reponses[i] === q.bonne);
  const score = corrections.filter(Boolean).length;

  const { error } = await supabaseAdmin()
    .from("tentatives_quiz")
    .insert({ eleve_id: u.id, quiz_id: quizId, score, total: questions.length, reponses });
  if (error) return { erreur: "Ton score n'a pas pu être enregistré. Réessaie dans un instant." };

  revalidatePath("/", "layout");
  return { score, total: questions.length, corrections };
}

export type EtatEnvoi = { ok?: boolean; erreur?: string };

export async function enregistrerReponseLibre(questionId: string, _: EtatEnvoi, formData: FormData): Promise<EtatEnvoi> {
  const u = await exigerEleve();
  if (!trouverQuestionLibre(questionId)) return { erreur: "Cette question n'existe pas." };
  const reponse = String(formData.get("reponse") ?? "").trim();
  if (reponse.length < 3) return { erreur: "Écris au moins une phrase avant d'envoyer." };
  if (reponse.length > 4000) return { erreur: "Ta réponse est trop longue (4000 caractères maximum)." };

  const supabase = await supabaseServeur();
  const { data: existante } = await supabase
    .from("reponses_libres")
    .select("id, corrige_le")
    .eq("eleve_id", u.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existante?.corrige_le) return { erreur: "Ton prof a déjà corrigé cette réponse, tu ne peux plus la modifier." };

  const { error } = existante
    ? await supabase.from("reponses_libres").update({ reponse, maj_le: new Date().toISOString() }).eq("id", existante.id)
    : await supabase.from("reponses_libres").insert({ eleve_id: u.id, question_id: questionId, reponse });
  if (error) return { erreur: "Ta réponse n'a pas pu être enregistrée. Réessaie dans un instant." };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** L'élève ferme le bandeau d'un message : on note qu'il l'a lu. */
export async function marquerMessageLu(messageId: number) {
  const u = await exigerEleve();
  const supabase = await supabaseServeur();
  await supabase.from("messages").update({ lu_le: new Date().toISOString() }).eq("id", messageId).eq("eleve_id", u.id).is("lu_le", null);
}

/** L'élève coche (ou décoche) « J'ai réussi cet exercice ». Les exercices bonus ne sont pas notés. */
export async function marquerExercice(exerciceId: string, fait: boolean) {
  const u = await exigerEleve();
  const exercice = trouverExercice(exerciceId);
  if (!exercice || exercice.niveau !== u.classe?.niveau) return;
  const supabase = await supabaseServeur();
  if (fait) await supabase.from("exercices_faits").upsert({ eleve_id: u.id, exercice_id: exerciceId }, { ignoreDuplicates: true });
  else await supabase.from("exercices_faits").delete().eq("eleve_id", u.id).eq("exercice_id", exerciceId);
  revalidatePath("/exercices", "layout");
}
