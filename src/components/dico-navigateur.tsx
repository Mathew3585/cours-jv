"use client";

import { useMemo, useState } from "react";
import type { EntreeDico } from "@/contenu/types";

function normaliser(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function DicoNavigateur({ termes, initial }: { termes: EntreeDico[]; initial?: string }) {
  const [recherche, setRecherche] = useState("");
  const [choisi, setChoisi] = useState(termes.find((t) => t.id === initial)?.id ?? termes[0]?.id);

  const filtres = useMemo(() => {
    const q = normaliser(recherche.trim());
    if (!q) return termes;
    return termes.filter((t) => normaliser(`${t.mot} ${t.categorie} ${t.simple}`).includes(q));
  }, [recherche, termes]);

  const actuel = termes.find((t) => t.id === choisi) ?? filtres[0];

  return (
    <>
      <div className="flex max-w-[380px] flex-col gap-1.5">
        <label htmlFor="dico-recherche" className="text-[13px] font-semibold text-encre-2">
          Chercher un mot
        </label>
        <div className="relative">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muet">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="dico-recherche"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="ex. override, Tick, produit scalaire"
            className="min-h-[46px] w-full rounded-xl border border-ligne-3 bg-white pr-11 pl-10 text-[15px] text-encre transition-colors hover:border-[#d9c3a5] focus-visible:border-orange"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label="Effacer la recherche"
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muet hover:bg-creme-2 hover:text-encre"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <section aria-label="Liste des mots" className="carte flex max-h-[640px] flex-[1_1_280px] flex-col gap-0.5 overflow-y-auto p-2.5">
          {filtres.map((t) => {
            const actif = t.id === actuel?.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setChoisi(t.id)}
                aria-pressed={actif}
                className={`flex min-h-[52px] shrink-0 cursor-pointer flex-col gap-0.5 rounded-xl border px-3.5 py-2.5 text-left ${
                  actif ? "border-orange bg-[#fff1e2]" : "border-transparent hover:bg-creme-2"
                }`}
              >
                <b className="text-[15px]">{t.mot}</b>
                <span className="text-[13px] text-muet">{t.categorie}</span>
              </button>
            );
          })}
          {filtres.length === 0 && <span className="p-3.5 text-sm text-muet">Aucun mot trouvé. Essaie un autre mot.</span>}
        </section>

        {actuel && (
          <article className="carte flex min-w-0 flex-[999_1_480px] flex-col gap-[18px] p-8">
            <span className="self-start rounded-full bg-orange-pale px-2.5 py-1 text-[12.5px] font-semibold text-orange-texte">{actuel.categorie}</span>
            <h2 className="font-display text-4xl font-extrabold">{actuel.mot}</h2>
            <p className="max-w-[62ch] text-[17px] leading-relaxed">{actuel.definition}</p>
            <div className="flex flex-col gap-1 rounded-2xl bg-creme-2 px-[18px] py-4">
              <b className="text-sm text-orange-texte">En clair</b>
              <span className="text-[15.5px] leading-normal">{actuel.simple}</span>
            </div>
            {actuel.code && (
              <pre className="overflow-x-auto rounded-[14px] bg-encre px-[18px] py-4 font-mono text-sm leading-[1.7] text-[#f1e4d3]">{actuel.code}</pre>
            )}
            {actuel.lien && (
              <a href={actuel.lien} target="_blank" rel="noreferrer" className="self-start text-sm font-semibold text-orange-fonce underline">
                Documentation officielle
              </a>
            )}
          </article>
        )}
      </div>
    </>
  );
}
