// Vérifie le contenu des cours : syntaxe MDX, fichiers de code, numéros de ligne, mots du dico, questions libres.
// Usage : npm run verifier-contenu
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..", "contenu");
const erreurs = [];
const avertissements = [];

// Ids du dico, lus dans les fichiers TypeScript
const idsDico = new Set();
for (const f of readdirSync(path.join(racine, "dico"))) {
  if (!f.endsWith(".ts") || f === "index.ts") continue;
  const texte = readFileSync(path.join(racine, "dico", f), "utf8");
  for (const m of texte.matchAll(/^\s*id:\s*"([^"]+)"/gm)) {
    if (idsDico.has(m[1])) avertissements.push(`dico : "${m[1]}" est défini deux fois (le premier gagne)`);
    idsDico.add(m[1]);
  }
}

const lignesDuFichier = new Map();
function nombreDeLignes(projet, fichier) {
  const cle = `${projet}/${fichier}`;
  if (!lignesDuFichier.has(cle)) {
    const chemin = path.join(racine, "projets", projet, "code", fichier);
    lignesDuFichier.set(cle, existsSync(chemin) ? readFileSync(chemin, "utf8").replace(/\r\n?/g, "\n").split("\n").length : -1);
  }
  return lignesDuFichier.get(cle);
}

let nbLecons = 0;
for (const projet of readdirSync(path.join(racine, "projets"))) {
  const dossierModules = path.join(racine, "projets", projet, "modules");
  if (!existsSync(dossierModules)) continue;

  for (const mod of readdirSync(dossierModules)) {
    const dossier = path.join(dossierModules, mod);
    const fichierModule = path.join(dossier, "module.ts");
    const texteModule = existsSync(fichierModule) ? readFileSync(fichierModule, "utf8") : "";
    if (!texteModule) erreurs.push(`${projet}/${mod} : module.ts manquant`);

    // Chaque leçon déclarée doit avoir son fichier MDX
    for (const m of texteModule.matchAll(/import\("\.\/([^"]+\.mdx)"\)/g)) {
      if (!existsSync(path.join(dossier, m[1]))) erreurs.push(`${projet}/${mod} : ${m[1]} est déclaré dans module.ts mais n'existe pas`);
    }

    for (const f of readdirSync(dossier).filter((x) => x.endsWith(".mdx"))) {
      nbLecons++;
      const ou = `${projet}/${mod}/${f}`;
      const source = readFileSync(path.join(dossier, f), "utf8");

      if (!texteModule.includes(`./${f}`)) avertissements.push(`${ou} : la leçon n'est pas déclarée dans module.ts`);

      try {
        await compile(source, { remarkPlugins: [remarkGfm] });
      } catch (e) {
        erreurs.push(`${ou} : MDX invalide, ligne ${e.line ?? "?"} : ${e.reason ?? e.message}`);
        continue;
      }

      // Blocs de code pas à pas
      for (const bloc of source.matchAll(/<CodePasAPas\s+([^>]*)>([\s\S]*?)<\/CodePasAPas>/g)) {
        const attrs = bloc[1];
        const fichier = attrs.match(/fichier="([^"]+)"/)?.[1];
        if (!fichier) {
          erreurs.push(`${ou} : <CodePasAPas> sans fichier`);
          continue;
        }
        const total = nombreDeLignes(projet, fichier);
        if (total < 0) {
          erreurs.push(`${ou} : le fichier de code "${fichier}" n'existe pas dans contenu/projets/${projet}/code`);
          continue;
        }
        const debut = Number(attrs.match(/debut=\{(\d+)\}/)?.[1] ?? 1);
        const fin = Number(attrs.match(/fin=\{(\d+)\}/)?.[1] ?? total);
        if (debut < 1 || fin > total || debut > fin) erreurs.push(`${ou} : ${fichier} lignes ${debut}-${fin} hors du fichier (${total} lignes)`);

        const etapes = [...bloc[2].matchAll(/<Etape\s+lignes="([^"]+)"\s+titre="([^"]*)"/g)];
        if (etapes.length === 0) avertissements.push(`${ou} : bloc ${fichier} ${debut}-${fin} sans étape`);
        if ((bloc[2].match(/<Etape\b/g) ?? []).length !== etapes.length) {
          erreurs.push(`${ou} : une <Etape> de ${fichier} n'a pas la forme <Etape lignes="a-b" titre="...">`);
        }
        for (const [, lignes, titre] of etapes) {
          const [a, b = a] = lignes.split("-").map(Number);
          if (!Number.isFinite(a) || !Number.isFinite(b) || a > b) erreurs.push(`${ou} : étape "${titre}" : lignes="${lignes}" invalide`);
          else if (a < debut || b > fin) erreurs.push(`${ou} : étape "${titre}" (l. ${lignes}) sort du bloc ${fichier} ${debut}-${fin}`);
        }
      }

      for (const m of source.matchAll(/<Terme\s+id="([^"]+)"/g)) {
        if (!idsDico.has(m[1])) erreurs.push(`${ou} : <Terme id="${m[1]}"> n'existe pas dans le dico`);
      }
      for (const m of source.matchAll(/<QuestionLibre\s+id="([^"]+)"/g)) {
        if (!texteModule.includes(`"${m[1]}"`)) erreurs.push(`${ou} : <QuestionLibre id="${m[1]}"> n'est pas déclarée dans module.ts`);
      }
      if (/<Quiz\s*\/>/.test(source) && !texteModule.includes(`import("./${f}")`)) {
        avertissements.push(`${ou} : contient <Quiz /> mais la leçon n'est pas déclarée`);
      }
    }
  }
}

// ---------- Couverture : chaque fichier de code doit être expliqué en entier, dans l'ordre ----------
// Les élèves recopient le script en suivant les leçons : aucune ligne non vide ne doit être sautée,
// et dans un module les étapes d'un même fichier avancent du haut vers le bas.
for (const projet of readdirSync(path.join(racine, "projets"))) {
  const dossierModules = path.join(racine, "projets", projet, "modules");
  if (!existsSync(dossierModules)) continue;
  const couvertes = new Map(); // fichier -> Set de lignes
  for (const mod of readdirSync(dossierModules)) {
    const dossier = path.join(dossierModules, mod);
    const texteModule = existsSync(path.join(dossier, "module.ts")) ? readFileSync(path.join(dossier, "module.ts"), "utf8") : "";
    const ordreLecons = [...texteModule.matchAll(/import\("\.\/([^"]+\.mdx)"\)/g)].map((m) => m[1]);
    const dernierParFichier = new Map();
    for (const f of ordreLecons) {
      if (!existsSync(path.join(dossier, f))) continue;
      const source = readFileSync(path.join(dossier, f), "utf8");
      for (const bloc of source.matchAll(/<CodePasAPas\s+([^>]*)>([\s\S]*?)<\/CodePasAPas>/g)) {
        const fichier = bloc[1].match(/fichier="([^"]+)"/)?.[1];
        if (!fichier) continue;
        if (!couvertes.has(fichier)) couvertes.set(fichier, new Set());
        for (const [, lignes, titre] of bloc[2].matchAll(/<Etape\s+lignes="([^"]+)"\s+titre="([^"]*)"/g)) {
          const [a, b = a] = lignes.split("-").map(Number);
          const precedent = dernierParFichier.get(fichier) ?? 0;
          if (a <= precedent) {
            erreurs.push(`${projet}/${mod}/${f} : étape "${titre}" (${fichier} l. ${lignes}) revient en arrière (déjà vu jusqu'à la ligne ${precedent}). Le fichier doit être suivi du haut vers le bas.`);
          }
          dernierParFichier.set(fichier, Math.max(precedent, b));
          for (let n = a; n <= b; n++) couvertes.get(fichier).add(n);
        }
      }
    }
  }
  for (const fichier of readdirSync(path.join(racine, "projets", projet, "code"))) {
    const lignes = readFileSync(path.join(racine, "projets", projet, "code", fichier), "utf8").replace(/\r\n?/g, "\n").split("\n");
    const vues = couvertes.get(fichier);
    if (!vues) {
      avertissements.push(`${projet} : ${fichier} n'est expliqué dans aucune leçon`);
      continue;
    }
    const manquantes = [];
    lignes.forEach((l, i) => {
      if (l.trim() && !vues.has(i + 1)) manquantes.push(i + 1);
    });
    if (manquantes.length) {
      // Regroupe 12, 13, 14 en "12-14"
      const plages = [];
      for (const n of manquantes) {
        const der = plages.at(-1);
        if (der && der[1] === n - 1) der[1] = n;
        else plages.push([n, n]);
      }
      erreurs.push(`${projet} : ${fichier}, lignes non expliquées : ${plages.map(([a, b]) => (a === b ? a : `${a}-${b}`)).join(", ")}`);
    }
  }
}

for (const a of avertissements) console.log(`⚠ ${a}`);
for (const e of erreurs) console.log(`✗ ${e}`);
console.log(`\n${nbLecons} leçon(s) vérifiée(s), ${idsDico.size} mots dans le dico : ${erreurs.length} erreur(s), ${avertissements.length} avertissement(s).`);
process.exit(erreurs.length > 0 ? 1 : 0);
