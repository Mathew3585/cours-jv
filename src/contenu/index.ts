import { marioKart } from "../../contenu/projets/mario-kart/projet";
import { dico } from "../../contenu/dico";
import { exercicesJV1 } from "../../contenu/exercices/jv1";
import { exercicesJV2 } from "../../contenu/exercices/jv2";
import { exercicesJV3 } from "../../contenu/exercices/jv3";
import type { Difficulte, Exercice, Lecon, Module, Niveau, Projet, QuestionLibre, Quiz } from "./types";

export const projets: Projet[] = [marioKart];
export { dico };

export const niveaux: { niveau: Niveau; techno: string }[] = [
  { niveau: "JV1", techno: "Unity · C#" },
  { niveau: "JV2", techno: "Unreal Engine 5 · Blueprints" },
  { niveau: "JV3", techno: "Unreal Engine 5 · C++" },
];

export const difficultes: { id: Difficulte; label: string; ton: "vert" | "ambre" | "orange" | "rouge" }[] = [
  { id: "facile", label: "Facile", ton: "vert" },
  { id: "moyen", label: "Moyen", ton: "ambre" },
  { id: "difficile", label: "Difficile", ton: "orange" },
  { id: "expert", label: "Expert", ton: "rouge" },
];

const ordreDifficulte = (d: Difficulte) => difficultes.findIndex((x) => x.id === d);

/** Tous les exercices bonus, triés par niveau puis par difficulté (l'ordre des fichiers est gardé dans une difficulté). */
export const exercices: Exercice[] = [...exercicesJV1, ...exercicesJV2, ...exercicesJV3]
  .map((e, i) => ({ e, i }))
  .sort((a, b) => a.e.niveau.localeCompare(b.e.niveau) || ordreDifficulte(a.e.difficulte) - ordreDifficulte(b.e.difficulte) || a.i - b.i)
  .map(({ e }) => e);

export function idExercice(e: Pick<Exercice, "niveau" | "slug">) {
  return `${e.niveau.toLowerCase()}/${e.slug}`;
}

export function exercicesDuNiveau(niveau: Niveau) {
  return exercices.filter((e) => e.niveau === niveau);
}

export function trouverExercice(id: string) {
  return exercices.find((e) => idExercice(e) === id);
}

export function idLecon(projet: string, module: string, lecon: string) {
  return `${projet}/${module}/${lecon}`;
}

export function trouverProjet(slug: string) {
  return projets.find((p) => p.slug === slug);
}

export function trouverModule(projetSlug: string, moduleSlug: string) {
  const projet = trouverProjet(projetSlug);
  const mod = projet?.modules.find((m) => m.slug === moduleSlug);
  return projet && mod ? { projet, module: mod } : undefined;
}

export function trouverLecon(projetSlug: string, moduleSlug: string, leconSlug: string) {
  const trouve = trouverModule(projetSlug, moduleSlug);
  if (!trouve) return undefined;
  const index = trouve.module.lecons.findIndex((l) => l.slug === leconSlug);
  if (index < 0) return undefined;
  return {
    ...trouve,
    lecon: trouve.module.lecons[index],
    index,
    precedente: trouve.module.lecons[index - 1] as Lecon | undefined,
    suivante: trouve.module.lecons[index + 1] as Lecon | undefined,
  };
}

/** Toutes les leçons d'un projet, dans l'ordre, avec leur identifiant complet. */
export function leconsDuProjet(projet: Projet) {
  return projet.modules.flatMap((m) =>
    m.lecons.map((l) => ({ module: m, lecon: l, id: idLecon(projet.slug, m.slug, l.slug) })),
  );
}

type QuizIndexe = { quiz: Quiz; projet: Projet; module: Module; lecon?: Lecon };
type QuestionIndexee = { question: QuestionLibre; projet: Projet; module: Module; lecon: Lecon };

const indexQuiz = new Map<string, QuizIndexe>();
const indexQuestions = new Map<string, QuestionIndexee>();
for (const projet of projets) {
  for (const mod of projet.modules) {
    indexQuiz.set(mod.quizFinal.id, { quiz: mod.quizFinal, projet, module: mod });
    for (const lecon of mod.lecons) {
      if (lecon.quiz) indexQuiz.set(lecon.quiz.id, { quiz: lecon.quiz, projet, module: mod, lecon });
      for (const q of lecon.questionsLibres ?? []) indexQuestions.set(q.id, { question: q, projet, module: mod, lecon });
    }
  }
}

export function trouverQuiz(id: string) {
  return indexQuiz.get(id);
}

export function trouverQuestionLibre(id: string) {
  return indexQuestions.get(id);
}

export function nombreDeQuiz(projet: Projet) {
  return projet.modules.reduce((n, m) => n + 1 + m.lecons.filter((l) => l.quiz).length, 0);
}
