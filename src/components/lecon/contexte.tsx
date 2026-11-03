"use client";

import { createContext, useContext } from "react";
import type { Quiz } from "@/contenu/types";

export type ReponseEnregistree = { texte: string; note: number | null; commentaire: string | null; corrigee: boolean };

export type ValeurLecon = {
  leconId: string;
  quiz?: Quiz;
  meilleurScore?: { score: number; total: number };
  /** Questions libres de la leçon, sans les attendus (réservés au prof) */
  questionsLibres: Record<string, { enonce: string; reponse?: ReponseEnregistree }>;
  notesVisibles: boolean;
  /** Le prof regarde la leçon : rien n'est enregistré */
  apercu: boolean;
};

const Contexte = createContext<ValeurLecon | null>(null);

export function FournisseurLecon({ valeur, children }: { valeur: ValeurLecon; children: React.ReactNode }) {
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useLecon() {
  return useContext(Contexte);
}
