"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { dico } from "../../../contenu/dico";

const LARGEUR_BULLE = 320;
const MARGE = 12;

/** Mot souligné dans une leçon : un clic affiche sa définition tirée du dico. */
export function Terme({ id, children }: { id: string; children: React.ReactNode }) {
  const entree = dico.find((t) => t.id === id);
  const [ouvert, setOuvert] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; enHaut: boolean } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const bulle = useRef<HTMLSpanElement>(null);
  const idBulle = useId();

  // La bulle est affichée au-dessus de toute la page (portail), placée sous le mot,
  // ou au-dessus s'il n'y a pas la place : aucun cadre ne peut la couper.
  useLayoutEffect(() => {
    if (!ouvert || !bouton.current) return;
    const placer = () => {
      const r = bouton.current!.getBoundingClientRect();
      const hauteur = bulle.current?.offsetHeight ?? 180;
      const largeur = Math.min(LARGEUR_BULLE, window.innerWidth - 2 * MARGE);
      const left = Math.min(Math.max(MARGE, r.left), window.innerWidth - largeur - MARGE);
      const enHaut = r.bottom + 8 + hauteur > window.innerHeight - MARGE && r.top - 8 - hauteur > MARGE;
      setPosition({ top: enHaut ? r.top - 8 - hauteur : r.bottom + 8, left, enHaut });
    };
    placer();
    window.addEventListener("resize", placer);
    window.addEventListener("scroll", placer, true);
    return () => {
      window.removeEventListener("resize", placer);
      window.removeEventListener("scroll", placer, true);
    };
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return;
    const fermerSiDehors = (e: PointerEvent) => {
      const cible = e.target as Node;
      if (!bouton.current?.contains(cible) && !bulle.current?.contains(cible)) setOuvert(false);
    };
    const fermerEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        bouton.current?.focus();
      }
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
    <>
      <button
        ref={bouton}
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls={ouvert ? idBulle : undefined}
        className="cursor-pointer border-b-2 border-dotted border-orange font-semibold text-orange-texte hover:bg-orange-pale"
      >
        {children}
      </button>
      {ouvert &&
        createPortal(
          <span
            ref={bulle}
            id={idBulle}
            role="dialog"
            aria-label={`Définition : ${entree.mot}`}
            style={{
              position: "fixed",
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: Math.min(LARGEUR_BULLE, typeof window === "undefined" ? LARGEUR_BULLE : window.innerWidth - 2 * MARGE),
            }}
            className="z-[100] flex flex-col gap-1.5 rounded-2xl bg-encre px-4 py-3.5 text-left text-sm leading-normal font-normal text-creme shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]"
          >
            <span className="font-display text-base font-bold">{entree.mot}</span>
            <span className="text-[#ebdcc9]">{entree.definition}</span>
            <span className="text-[#f6b27e]">En clair : {entree.simple}</span>
            <Link href={`/dico?terme=${entree.id}`} className="font-semibold text-[#f6b27e] underline">
              Voir dans le dico
            </Link>
          </span>,
          document.body,
        )}
    </>
  );
}
