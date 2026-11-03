import "server-only";
import { cache } from "react";
import { idLecon, projets, trouverProjet } from "@/contenu";
import type { Module, Projet } from "@/contenu/types";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { ClasseProjet, Deadline, ProgressionLecon, ReponseLibre, TentativeQuiz } from "@/lib/supabase/types";
import type { Utilisateur } from "@/lib/session";

export type StatutLecon = "fait" | "en-cours" | "a-faire";

export type DonneesEleve = {
  projetsOuverts: { projet: Projet; regles: ClasseProjet }[];
  deadlines: Map<string, string>;
  progression: Map<string, ProgressionLecon>;
  meilleursScores: Map<string, { score: number; total: number; tentatives: number; derniere: string }>;
  tentatives: TentativeQuiz[];
  reponses: Map<string, ReponseLibre>;
};

export function cleDeadline(projet: string, module: string) {
  return `${projet}/${module}`;
}

/** Tout ce qu'il faut pour afficher la progression d'un élève, chargé une fois par requête. */
export const donneesEleve = cache(async (u: Utilisateur): Promise<DonneesEleve> => {
  const supabase = await supabaseServeur();
  const classeId = u.profil.classe_id;

  const [ouverts, dl, prog, tent, rep] = await Promise.all([
    classeId ? supabase.from("classe_projets").select("*").eq("classe_id", classeId) : Promise.resolve({ data: [] as ClasseProjet[] }),
    classeId ? supabase.from("deadlines").select("*").eq("classe_id", classeId) : Promise.resolve({ data: [] as Deadline[] }),
    supabase.from("progression_lecons").select("*").eq("eleve_id", u.id),
    supabase.from("tentatives_quiz").select("*").eq("eleve_id", u.id).order("created_at", { ascending: false }),
    supabase.from("reponses_libres").select("*").eq("eleve_id", u.id),
  ]);

  return assemblerDonnees({
    ouverts: ouverts.data ?? [],
    deadlines: dl.data ?? [],
    progression: prog.data ?? [],
    tentatives: tent.data ?? [],
    reponses: rep.data ?? [],
  });
});

/** Construit les données d'un élève à partir de lignes déjà chargées (utilisé aussi par l'espace prof). */
export function assemblerDonnees(lignes: {
  ouverts: ClasseProjet[];
  deadlines: Deadline[];
  progression: ProgressionLecon[];
  /** Triées de la plus récente à la plus ancienne */
  tentatives: TentativeQuiz[];
  reponses: ReponseLibre[];
}): DonneesEleve {
  const projetsOuverts = lignes.ouverts
    .map((regles) => ({ projet: trouverProjet(regles.projet_slug), regles }))
    .filter((x): x is { projet: Projet; regles: ClasseProjet } => Boolean(x.projet))
    .sort((a, b) => projets.indexOf(a.projet) - projets.indexOf(b.projet));

  const meilleursScores: DonneesEleve["meilleursScores"] = new Map();
  for (const t of lignes.tentatives) {
    const actuel = meilleursScores.get(t.quiz_id);
    if (!actuel) meilleursScores.set(t.quiz_id, { score: t.score, total: t.total, tentatives: 1, derniere: t.created_at });
    else {
      actuel.tentatives += 1;
      if (t.score / t.total > actuel.score / actuel.total) Object.assign(actuel, { score: t.score, total: t.total });
    }
  }

  return {
    projetsOuverts,
    deadlines: new Map(lignes.deadlines.map((d) => [cleDeadline(d.projet_slug, d.module_slug), d.date])),
    progression: new Map(lignes.progression.map((p) => [p.lecon_id, p])),
    meilleursScores,
    tentatives: lignes.tentatives,
    reponses: new Map(lignes.reponses.map((r) => [r.question_id, r])),
  };
}

/** Moyenne des meilleures notes de quiz, sur 20 (null si aucun quiz). */
export function moyenneQuiz(d: DonneesEleve) {
  const scores = [...d.meilleursScores.values()].filter((s) => s.total > 0);
  if (scores.length === 0) return null;
  return (scores.reduce((n, s) => n + s.score / s.total, 0) / scores.length) * 20;
}

export type StatutEleve = "retard" | "heure" | "avance" | "pas-commence";

/**
 * En retard : un module dont la deadline est passée n'est pas validé.
 * En avance : le module de la prochaine deadline est déjà validé.
 */
export function statutEleve(d: DonneesEleve, aujourdhui = new Date().toISOString().slice(0, 10)): StatutEleve {
  if (d.progression.size === 0 && d.tentatives.length === 0) {
    const deadlinePassee = [...d.deadlines.values()].some((date) => date < aujourdhui);
    return deadlinePassee ? "retard" : "pas-commence";
  }
  let prochaine: { pct: number; date: string } | undefined;
  for (const { projet, regles } of d.projetsOuverts) {
    for (const mod of projet.modules) {
      const date = d.deadlines.get(cleDeadline(projet.slug, mod.slug));
      if (!date || mod.lecons.length === 0) continue;
      const pct = progressionModule(d, projet, mod, regles.seuil_validation);
      if (date < aujourdhui && pct < 100) return "retard";
      if (date >= aujourdhui && (!prochaine || date < prochaine.date)) prochaine = { pct, date };
    }
  }
  return prochaine && prochaine.pct >= 100 ? "avance" : "heure";
}

/** Dernière activité connue d'un élève (leçon ouverte, quiz, réponse). */
export function derniereActivite(d: DonneesEleve) {
  const dates = [
    ...[...d.progression.values()].map((p) => p.maj_le),
    ...d.tentatives.map((t) => t.created_at),
    ...[...d.reponses.values()].map((r) => r.maj_le),
  ];
  return dates.sort().at(-1) ?? null;
}

/** La leçon la plus récemment ouverte, pour la colonne « Leçon actuelle ». */
export function leconActuelle(d: DonneesEleve) {
  return leconAReprendre(d);
}

export function statutLecon(d: DonneesEleve, id: string): StatutLecon {
  const p = d.progression.get(id);
  if (!p) return "a-faire";
  return p.termine ? "fait" : "en-cours";
}

export function quizValide(d: DonneesEleve, quizId: string, seuil: number) {
  const s = d.meilleursScores.get(quizId);
  return Boolean(s && s.total > 0 && (s.score / s.total) * 100 >= seuil);
}

/** Pourcentage d'un module : chaque leçon terminée compte 1, le quiz final validé compte 1. */
export function progressionModule(d: DonneesEleve, projet: Projet, mod: Module, seuil: number) {
  const total = mod.lecons.length + (mod.quizFinal.questions.length > 0 ? 1 : 0);
  if (total === 0) return 0;
  const faites = mod.lecons.filter((l) => statutLecon(d, idLecon(projet.slug, mod.slug, l.slug)) === "fait").length;
  const quiz = mod.quizFinal.questions.length > 0 && quizValide(d, mod.quizFinal.id, seuil) ? 1 : 0;
  return Math.round(((faites + quiz) / total) * 100);
}

export function progressionProjet(d: DonneesEleve, projet: Projet, seuil: number) {
  const modules = projet.modules.filter((m) => m.lecons.length > 0);
  if (modules.length === 0) return 0;
  return Math.round(modules.reduce((n, m) => n + progressionModule(d, projet, m, seuil), 0) / modules.length);
}

/** Module verrouillé si le déblocage progressif est actif et que le module précédent n'est pas validé. */
export function moduleVerrouille(d: DonneesEleve, projet: Projet, index: number, regles: ClasseProjet) {
  if (!regles.deblocage_progressif || index === 0) return false;
  const precedent = projet.modules[index - 1];
  return progressionModule(d, projet, precedent, regles.seuil_validation) < 100;
}

/** La leçon commencée la plus récente, ou la première leçon pas encore faite. */
export function leconAReprendre(d: DonneesEleve) {
  let recente: { projet: Projet; module: Module; lecon: Module["lecons"][number]; maj: string } | undefined;
  for (const { projet } of d.projetsOuverts) {
    for (const m of projet.modules) {
      for (const l of m.lecons) {
        const p = d.progression.get(idLecon(projet.slug, m.slug, l.slug));
        if (p && !p.termine && (!recente || p.maj_le > recente.maj)) recente = { projet, module: m, lecon: l, maj: p.maj_le };
      }
    }
  }
  if (recente) return { ...recente, commencee: true };

  for (const { projet } of d.projetsOuverts) {
    for (const m of projet.modules) {
      for (const l of m.lecons) {
        if (statutLecon(d, idLecon(projet.slug, m.slug, l.slug)) === "a-faire") return { projet, module: m, lecon: l, commencee: false };
      }
    }
  }
  return undefined;
}
