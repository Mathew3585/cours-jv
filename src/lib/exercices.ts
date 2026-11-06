import "server-only";
import { cache } from "react";
import { difficultes, exercicesDuNiveau, idExercice } from "@/contenu";
import type { Niveau } from "@/contenu/types";
import { supabaseServeur } from "@/lib/supabase/serveur";

/** Exercices réussis par un élève : id de l'exercice → date. Vide si la table n'est pas encore là. */
export const exercicesFaits = cache(async (eleveId: string): Promise<Map<string, string>> => {
  const supabase = await supabaseServeur();
  const { data, error } = await supabase.from("exercices_faits").select("*").eq("eleve_id", eleveId);
  if (error) return new Map();
  return new Map((data ?? []).map((l) => [l.exercice_id, l.fait_le]));
});

export function estNiveau(x: unknown): x is Niveau {
  return x === "JV1" || x === "JV2" || x === "JV3";
}

/** Nombre d'exercices faits / disponibles, par difficulté, pour un niveau. */
export function bilanExercices(niveau: Niveau, faits: Map<string, string>) {
  const liste = exercicesDuNiveau(niveau);
  return difficultes.map((d) => {
    const ceux = liste.filter((e) => e.difficulte === d.id);
    return { ...d, total: ceux.length, faits: ceux.filter((e) => faits.has(idExercice(e))).length };
  });
}

/** 30 → "30 min" ; 90 → "1 h 30" ; 120 → "2 h" */
export function duree(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export const libellesGenre = { coder: "À coder", bug: "Bug à corriger" } as const;

export const descriptionsDifficulte = {
  facile: "Une notion à la fois, pour te lancer.",
  moyen: "Plusieurs notions à combiner.",
  difficile: "Des systèmes complets, avec des notions nouvelles.",
  expert: "Pour les plus motivés : à toi de concevoir une bonne partie.",
} as const;
