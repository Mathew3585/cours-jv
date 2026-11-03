import "server-only";
import type { MDXContent } from "mdx/types";
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { CodePasAPas, Etape, MarqueurQuestion, MarqueurQuiz, type PropsCode, type PropsEtape } from "@/components/lecon/marqueurs";
import { lirePlage } from "@/lib/code";

export type EtapeLecteur =
  | { type: "texte"; section?: string; titre: string; contenu: ReactNode; fichier?: string }
  | { type: "code"; section?: string; titre: string; contenu: ReactNode; fichier: string; debut: number; fin: number }
  | { type: "quiz" }
  | { type: "question"; id: string };

/** Nombre maximum de paragraphes par écran de texte, pour que tout tienne sans défiler. */
const BLOCS_PAR_ECRAN = 3;

function texteDe(noeud: ReactNode): string {
  if (typeof noeud === "string" || typeof noeud === "number") return String(noeud);
  if (Array.isArray(noeud)) return noeud.map(texteDe).join("");
  if (isValidElement(noeud)) return texteDe((noeud.props as { children?: ReactNode }).children);
  return "";
}

/**
 * Transforme une leçon MDX en suite d'écrans pour le lecteur plein écran :
 * chaque <Etape> devient un écran de code, le texte entre les blocs devient des écrans de texte,
 * <Quiz /> et <QuestionLibre /> deviennent leurs propres écrans.
 */
export function construireEtapes(Contenu: MDXContent, options: { quiz: boolean; questions: string[] }) {
  const racine = Contenu({ components: { CodePasAPas, Etape, Quiz: MarqueurQuiz, QuestionLibre: MarqueurQuestion } }) as ReactElement<{
    children?: ReactNode;
  }>;
  const noeuds = Children.toArray(racine?.props?.children ?? []);

  const etapes: EtapeLecteur[] = [];
  let section: string | undefined;
  let enAttente: ReactNode[] = [];
  let quizPlace = false;
  const questionsPlacees = new Set<string>();

  const viderTexte = () => {
    for (let i = 0; i < enAttente.length; i += BLOCS_PAR_ECRAN) {
      const morceau = enAttente.slice(i, i + BLOCS_PAR_ECRAN);
      etapes.push({ type: "texte", section, titre: section ?? "Introduction", contenu: <>{morceau}</> });
    }
    enAttente = [];
  };

  for (const n of noeuds) {
    if (!isValidElement(n)) {
      if (typeof n === "string" && n.trim()) enAttente.push(n);
      continue;
    }
    if (n.type === "h2") {
      viderTexte();
      section = texteDe((n.props as { children?: ReactNode }).children);
      continue;
    }
    if (n.type === CodePasAPas) {
      viderTexte();
      const p = n.props as PropsCode;
      for (const e of Children.toArray(p.children)) {
        if (!isValidElement(e)) continue;
        const pe = e.props as PropsEtape;
        if (!pe.lignes) continue;
        const { debut, fin } = lirePlage(pe.lignes);
        etapes.push({ type: "code", section, titre: pe.titre, contenu: pe.children, fichier: p.fichier, debut, fin });
      }
      continue;
    }
    if (n.type === MarqueurQuiz) {
      viderTexte();
      if (options.quiz && !quizPlace) etapes.push({ type: "quiz" });
      quizPlace = true;
      continue;
    }
    if (n.type === MarqueurQuestion) {
      viderTexte();
      const id = (n.props as { id: string }).id;
      if (options.questions.includes(id)) etapes.push({ type: "question", id });
      questionsPlacees.add(id);
      continue;
    }
    enAttente.push(n);
  }
  viderTexte();

  // Quiz et questions déclarés dans module.ts mais pas placés dans le MDX : à la fin.
  if (options.quiz && !quizPlace) etapes.push({ type: "quiz" });
  for (const id of options.questions) if (!questionsPlacees.has(id)) etapes.push({ type: "question", id });

  // Un écran de texte affiche le fichier du bloc de code qui suit (ou, à défaut, du précédent).
  const fichiers = [...new Set(etapes.flatMap((e) => (e.type === "code" ? [e.fichier] : [])))];
  for (let i = 0; i < etapes.length; i++) {
    const e = etapes[i];
    if (e.type !== "texte") continue;
    const apres = etapes.slice(i + 1).find((x) => x.type === "code");
    const avant = etapes.slice(0, i).reverse().find((x) => x.type === "code");
    e.fichier = (apres ?? avant)?.type === "code" ? ((apres ?? avant) as { fichier: string }).fichier : undefined;
  }

  return { etapes, fichiers };
}
