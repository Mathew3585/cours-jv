import type { MDXContent } from "mdx/types";

export type Niveau = "JV1" | "JV2" | "JV3";

export type QuestionQuiz = {
  /** qcm : plusieurs choix ; vrai-faux : choix ["Vrai", "Faux"] ; code : compléter ou lire un extrait de code */
  type: "qcm" | "vrai-faux" | "code";
  enonce: string;
  /** Extrait de code affiché sous l'énoncé (utiliser ____ pour un trou) */
  code?: string;
  choix: string[];
  /** Index de la bonne réponse dans `choix` */
  bonne: number;
  /** Explication affichée après la réponse, juste ou fausse */
  explication: string;
};

export type Quiz = {
  /** Identifiant unique et stable : "projet/module/lecon" ou "projet/module/final" */
  id: string;
  questions: QuestionQuiz[];
};

export type QuestionLibre = {
  /** Identifiant unique et stable, ex. "mario-kart/pawn-controller/header/pourquoi-forward" */
  id: string;
  enonce: string;
  /** Ce que le prof attend dans la réponse (visible seulement par le prof) */
  attendus: string;
};

export type Lecon = {
  slug: string;
  titre: string;
  resume: string;
  dureeMin: number;
  /** Fichiers de code utilisés, ex. ["KartPawn.h"] */
  fichiers: string[];
  quiz?: Quiz;
  questionsLibres?: QuestionLibre[];
  charger: () => Promise<{ default: MDXContent }>;
};

export type TrancheCarte = {
  /** Slug de la leçon qui explique cette tranche */
  lecon: string;
  label: string;
  debut: number;
  fin: number;
};

export type Defi = { id: string; titre: string; consigne: string };

export type Module = {
  slug: string;
  titre: string;
  resume: string;
  intro: string;
  fichiers: string[];
  lecons: Lecon[];
  /** Découpage d'un gros fichier en tranches, une par leçon */
  carte?: { fichier: string; lignes: number; tranches: TrancheCarte[] };
  quizFinal: Quiz;
  defi?: Defi;
};

export type FichierProjet = { nom: string; role: string; module: string };

export type Projet = {
  slug: string;
  titre: string;
  niveau: Niveau;
  techno: string;
  description: string;
  modules: Module[];
  fichiers: FichierProjet[];
};

export type Difficulte = "facile" | "moyen" | "difficile" | "expert";

/**
 * Exercice bonus, en plus des projets : pas de deadline, ne compte pas dans la progression.
 * Rangé par niveau (JV1 Unity C#, JV2 Unreal Blueprints, JV3 Unreal C++).
 */
export type Exercice = {
  /** Unique dans le niveau, en minuscules avec tirets. L'identifiant complet est "jv3/slug". */
  slug: string;
  titre: string;
  niveau: Niveau;
  difficulte: Difficulte;
  /** coder : écrire une fonctionnalité ; bug : trouver et corriger un bug dans du code donné */
  genre: "coder" | "bug";
  /** Grand thème, ex. "Déplacement", "Physique", "Interface", "IA" */
  theme: string;
  /** Une phrase qui donne envie, affichée sur la carte */
  resume: string;
  dureeMin: number;
  /** Notions travaillées, ex. ["Raycast", "TArray"] */
  notions: string[];
  charger: () => Promise<{ default: MDXContent }>;
};

export type EntreeDico = {
  /** Identifiant en minuscules sans accents, ex. "uproperty" */
  id: string;
  mot: string;
  categorie: "C++" | "Macro Unreal" | "Classe Unreal" | "Fonction Unreal" | "Système Unreal" | "Concept" | "Maths";
  definition: string;
  /** Explication très simple, une phrase */
  simple: string;
  code?: string;
  /** Lien vers une documentation officielle */
  lien?: string;
};
