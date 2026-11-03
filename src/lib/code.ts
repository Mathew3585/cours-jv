import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHighlighter, type ThemeRegistration } from "shiki";

export type Jeton = { t: string; c: string; i?: boolean };
export type LigneCode = { n: number; jetons: Jeton[] };

// Thème aux couleurs du site : fond brun, accents chauds.
const theme: ThemeRegistration = {
  name: "atelier",
  type: "dark",
  colors: { "editor.background": "#2a1e14", "editor.foreground": "#f1e4d3" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#b09a82", fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: "#b7d88b" } },
    { scope: ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive", "entity.name.function.preprocessor"], settings: { foreground: "#d9a0ea" } },
    { scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new", "variable.language.this"], settings: { foreground: "#f0a35e" } },
    { scope: ["entity.name.type", "support.type", "entity.name.class", "storage.type.user-defined", "entity.name.scope-resolution"], settings: { foreground: "#f3d27a" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#7fc8e8" } },
    { scope: ["constant.numeric", "constant.language", "constant.other"], settings: { foreground: "#f6b27e" } },
  ],
};

let surligneur: ReturnType<typeof createHighlighter> | undefined;
function obtenirSurligneur() {
  surligneur ??= createHighlighter({ themes: [theme], langs: ["cpp", "csharp"] });
  return surligneur;
}

const cache = new Map<string, Promise<LigneCode[]>>();

/** Lit un fichier de code d'un projet et renvoie ses lignes colorées (numérotées à partir de 1). */
export function lireCode(projet: string, fichier: string): Promise<LigneCode[]> {
  const cle = `${projet}/${fichier}`;
  let resultat = cache.get(cle);
  if (!resultat) {
    resultat = (async () => {
      const chemin = path.join(process.cwd(), "contenu", "projets", projet, "code", path.basename(fichier));
      const texte = (await readFile(chemin, "utf8")).replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
      const s = await obtenirSurligneur();
      const { tokens } = s.codeToTokens(texte, { lang: fichier.endsWith(".cs") ? "csharp" : "cpp", theme });
      return tokens.map((ligne, i) => ({
        n: i + 1,
        jetons: ligne.map((j) => ({ t: j.content, c: j.color ?? "#f1e4d3", ...(j.fontStyle === 1 ? { i: true } : {}) })),
      }));
    })();
    cache.set(cle, resultat);
  }
  return resultat;
}

/** "3-5" → { debut: 3, fin: 5 } ; "12" → { debut: 12, fin: 12 } */
export function lirePlage(plage: string) {
  const [a, b] = plage.split("-").map((x) => Number.parseInt(x.trim(), 10));
  return { debut: a, fin: Number.isFinite(b) ? b : a };
}
