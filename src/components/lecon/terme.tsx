"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { dico } from "../../../contenu/dico";

/** Mot souligné dans une leçon : un clic affiche sa définition tirée du dico. */
export function Terme({ id, children }: { id: string; children: React.ReactNode }) {
  const entree = dico.find((t) => t.id === id);
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLSpanElement>(null);
  const idBulle = useId();

  useEffect(() => {
    if (!ouvert) return;
    const fermerSiDehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    const fermerEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("pointerdown", fermerSiDehors);
    document.addEventListener("keydown", fermerEchap);
    return () => {
      document.removeEventListener("pointerdown", fermerSiDehors);
      document.removeEventListener("keydown", fermerEchap);
    };
  }, [ouvert]);

  if (!entree) return <>{children}</>;

  return (
    <span ref={racine} className="relative inline">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls={idBulle}
        className="cursor-pointer border-b-2 border-dotted border-orange font-semibold text-orange-texte hover:bg-orange-pale"
      >
        {children}
      </button>
      {ouvert && (
        <span
          id={idBulle}
          role="dialog"
          aria-label={`Définition : ${entree.mot}`}
          className="absolute top-[calc(100%+8px)] left-0 z-20 flex w-[min(320px,80vw)] flex-col gap-1.5 rounded-2xl bg-encre px-4 py-3.5 text-left text-sm leading-normal font-normal text-creme shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]"
        >
          <span className="font-display text-base font-bold">{entree.mot}</span>
          <span className="text-[#ebdcc9]">{entree.definition}</span>
          <span className="text-[#f6b27e]">En clair : {entree.simple}</span>
          <Link href={`/dico?terme=${entree.id}`} className="font-semibold text-[#f6b27e] underline">
            Voir dans le dico
          </Link>
        </span>
      )}
    </span>
  );
}
