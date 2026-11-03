import type { MDXComponents } from "mdx/types";
import { CodePasAPas, Etape } from "@/components/lecon/marqueurs";
import { Encadre } from "@/components/lecon/encadre";
import { QuestionLibre } from "@/components/lecon/question-libre";
import { QuizLecon } from "@/components/lecon/quiz";
import { Terme } from "@/components/lecon/terme";

// Composants disponibles dans toutes les leçons MDX.
// Ce sont des marqueurs : la page de leçon les transforme en écrans du lecteur.
const components: MDXComponents = {
  Terme,
  Encadre,
  Etape,
  CodePasAPas,
  Quiz: QuizLecon,
  QuestionLibre,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
