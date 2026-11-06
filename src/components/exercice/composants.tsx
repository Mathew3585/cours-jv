import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { BoutonCopier } from "@/components/exercice/bouton-copier";
import { Encadre } from "@/components/lecon/encadre";
import { colorerExtrait } from "@/lib/code";

// Composants des exercices écrits en MDX. Contrairement aux leçons, l'exercice est une page qui défile :
// ces composants s'affichent directement.

type PropsCode = { className?: string; children?: ReactNode };

function texteDe(noeud: ReactNode): string {
  if (typeof noeud === "string" || typeof noeud === "number") return String(noeud);
  if (Array.isArray(noeud)) return noeud.map(texteDe).join("");
  if (isValidElement(noeud)) return texteDe((noeud.props as { children?: ReactNode }).children);
  return "";
}

/** Remplace le <pre> des blocs ``` : code coloré, numéros de ligne, bouton copier. */
export async function BlocCode({ children, nom }: { children?: ReactNode; nom?: string }) {
  const code = Children.toArray(children).find(isValidElement) as ReactElement<PropsCode> | undefined;
  const langage = code?.props.className?.match(/language-([\w#+]+)/)?.[1];
  const texte = texteDe(code?.props.children ?? children).replace(/\n$/, "");
  const lignes = await colorerExtrait(texte, langage);
  const etiquette = nom ?? (langage === "cpp" ? "C++" : langage === "cs" || langage === "csharp" ? "C#" : undefined);

  return (
    <div className="bloc-code overflow-hidden rounded-[14px] bg-encre text-[#f1e4d3]">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-white/10 pr-1.5 pl-4">
        <span className="truncate font-mono text-[13px] text-[#d9c3a5]">{etiquette}</span>
        <BoutonCopier texte={texte} />
      </div>
      <pre className="overflow-x-auto py-3.5 font-mono text-[14px] leading-[1.7]">
        <code className="block min-w-max">
          {lignes.map((jetons, i) => (
            <span key={i} className="flex">
              <span
                aria-hidden="true"
                className="shrink-0 pr-4 pl-4 text-right text-[#8c7158] tabular-nums select-none"
                style={{ width: `calc(${String(lignes.length).length}ch + 2.25rem)` }}
              >
                {i + 1}
              </span>
              <span className="pr-5">
                {jetons.length === 0 ? "​" : null}
                {jetons.map((j, k) => (
                  <span key={k} style={{ color: j.c, fontStyle: j.i ? "italic" : undefined }}>
                    {j.t}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/** <Fichier nom="Porte.h"> autour d'un bloc ``` : affiche le nom du fichier où écrire le code. */
export function Fichier({ nom, children }: { nom: string; children?: ReactNode }) {
  return (
    <>
      {Children.map(children, (enfant) =>
        isValidElement(enfant) && enfant.type === BlocCode ? cloneElement(enfant as ReactElement<{ nom?: string }>, { nom }) : enfant,
      )}
    </>
  );
}

const iconeAmpoule = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
  </svg>
);

const chevron = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="chevron ml-auto shrink-0 transition-transform">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Indice qu'on déplie quand on bloque. Numérotés automatiquement dans l'ordre de la page. */
export function Indice({ titre, children }: { titre?: string; children?: ReactNode }) {
  return (
    <details className="indice depliable rounded-2xl border border-ligne bg-creme-2">
      <summary className="flex min-h-12 cursor-pointer items-center gap-2.5 px-[18px] py-3 font-semibold text-encre-2">
        <span className="text-orange-fonce">{iconeAmpoule}</span>
        <span className="indice-numero" />
        {titre && <span className="font-normal text-muet">· {titre}</span>}
        {chevron}
      </summary>
      <div className="depliable-contenu border-t border-ligne px-[18px] py-4">{children}</div>
    </details>
  );
}

/** La correction complète, cachée tant que l'élève ne la demande pas. */
export function Solution({ children }: { children?: ReactNode }) {
  return (
    <details className="depliable rounded-2xl border border-[#e8b48a] bg-white">
      <summary className="flex min-h-14 cursor-pointer items-center gap-3 px-5 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-pale text-orange-texte">
          <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>
        <span className="flex flex-col">
          <b className="font-display text-[18px]">Voir la solution</b>
          <span className="text-[13.5px] text-muet">Essaie vraiment avant : c&apos;est en cherchant qu&apos;on apprend.</span>
        </span>
        {chevron}
      </summary>
      <div className="depliable-contenu border-t border-ligne px-5 py-5">{children}</div>
    </details>
  );
}

export const composantsExercice = { pre: BlocCode, Fichier, Indice, Solution, Encadre };
