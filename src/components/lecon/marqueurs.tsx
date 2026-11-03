import type { ReactNode } from "react";

// Composants utilisés dans le MDX des leçons. Ils n'affichent rien eux-mêmes :
// la page de leçon lit leurs props pour construire les écrans du lecteur.

export type PropsEtape = { lignes: string; titre: string; children?: ReactNode };
export type PropsCode = { fichier: string; debut?: number; fin?: number; children?: ReactNode };

export function Etape(props: PropsEtape) {
  void props;
  return null;
}

export function CodePasAPas(props: PropsCode) {
  void props;
  return null;
}

export function MarqueurQuiz() {
  return null;
}

export function MarqueurQuestion(props: { id: string }) {
  void props;
  return null;
}
