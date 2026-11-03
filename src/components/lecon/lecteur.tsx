"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { enregistrerEtape } from "@/actions/eleve";
import type { LigneCode } from "@/lib/code";
import { ListeDeroulante } from "@/components/champs";
import { useLecon } from "./contexte";
import { QuestionLibre } from "./question-libre";
import { QuizLecon } from "./quiz";

export type EcranLecteur =
  | { type: "texte"; section?: string; titre: string; contenu: ReactNode; fichier?: string }
  | { type: "code"; section?: string; titre: string; contenu: ReactNode; fichier: string; debut: number; fin: number }
  | { type: "quiz" }
  | { type: "question"; id: string };

const taillesCode = [13, 14.5, 16, 18];

function titreEcran(e: EcranLecteur) {
  if (e.type === "quiz") return "Quiz de la leçon";
  if (e.type === "question") return "Question libre";
  return e.titre;
}

function Pastille({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-orange-pale px-2.5 py-1 text-xs font-semibold text-orange-texte">{children}</span>;
}

export function Lecteur({
  titre,
  retour,
  ecrans,
  fichiers,
  etapeInitiale,
  fin,
}: {
  titre: string;
  retour: { href: string; label: string };
  ecrans: EcranLecteur[];
  fichiers: Record<string, LigneCode[]>;
  etapeInitiale: number;
  /** Contenu de l'écran de fin (bouton pour terminer la leçon) */
  fin: ReactNode;
}) {
  const lecon = useLecon();
  const total = ecrans.length + 1; // + l'écran de fin
  const [index, setIndex] = useState(Math.min(Math.max(0, etapeInitiale), total - 1));
  const [taille, setTaille] = useState(1);
  const zoneCode = useRef<HTMLDivElement>(null);
  const premierRendu = useRef(true);

  const ecran = index < ecrans.length ? ecrans[index] : null;
  const estCode = ecran?.type === "code";
  const plage = ecran?.type === "code" ? { debut: ecran.debut, fin: ecran.fin } : null;
  const lignes = ecran?.type === "code" ? (fichiers[ecran.fichier] ?? []) : [];

  const aller = useCallback((i: number) => setIndex(Math.min(Math.max(0, i), total - 1)), [total]);

  // Flèches du clavier (sauf quand on écrit dans un champ).
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") aller(index + 1);
      if (e.key === "ArrowLeft") aller(index - 1);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [index, aller]);

  // Fait défiler le code jusqu'aux lignes expliquées.
  useEffect(() => {
    const zone = zoneCode.current;
    if (!zone || !plage) return;
    const haut = zone.querySelector<HTMLElement>(`[data-ligne="${plage.debut}"]`);
    const bas = zone.querySelector<HTMLElement>(`[data-ligne="${plage.fin}"]`);
    if (haut && bas) {
      const hauteurBloc = bas.offsetTop + bas.offsetHeight - haut.offsetTop;
      const cible = hauteurBloc > zone.clientHeight * 0.75 ? haut.offsetTop - 24 : haut.offsetTop - (zone.clientHeight - hauteurBloc) / 3;
      zone.scrollTo({ top: Math.max(0, cible), behavior: premierRendu.current ? "auto" : "smooth" });
    }
    premierRendu.current = false;
  }, [plage?.debut, plage?.fin, ecran, taille]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retient l'étape pour « Reprendre » (un élève, pas l'aperçu prof).
  useEffect(() => {
    if (!lecon || lecon.apercu) return;
    const minuteur = setTimeout(() => {
      enregistrerEtape(lecon.leconId, index).catch(() => {});
    }, 800);
    return () => clearTimeout(minuteur);
  }, [index, lecon]);

  const largeurNumeros = String(lignes.length).length;
  const fichierPrecedent = ecrans
    .slice(0, index)
    .reverse()
    .find((e) => e.type === "code");
  const nouveauFichier = ecran?.type === "code" && (fichierPrecedent?.type !== "code" || fichierPrecedent.fichier !== ecran.fichier);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-creme">
      {/* Barre du haut */}
      <header className="flex shrink-0 items-center gap-3 border-b border-ligne bg-creme-2 px-4 py-2.5 md:px-6">
        <Link href={retour.href} className="btn min-h-10 shrink-0 bg-transparent px-3">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span className="hidden sm:inline">{retour.label}</span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-base font-bold md:text-lg">{titre}</h1>
        <ListeDeroulante
          id="sommaire"
          label="Aller à une étape"
          value={String(index)}
          onChange={(v) => aller(Number(v))}
          className="hidden w-[300px] shrink-0 md:block"
          options={[
            ...ecrans.map((e, i) => ({ value: String(i), label: `${i + 1}. ${titreEcran(e)}` })),
            { value: String(ecrans.length), label: `${total}. Fin de la leçon` },
          ]}
        />
      </header>
      <div className="h-1 shrink-0 bg-ligne" aria-hidden="true">
        <div className="h-full bg-orange transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Zone principale : jamais de défilement de page */}
      <main className="min-h-0 flex-1 p-3 md:p-5">
        {estCode && ecran?.type === "code" ? (
          <div key="code" className="mx-auto flex h-full max-w-[1600px] flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,500px)] lg:gap-5">
            {/* Fenêtre de code */}
            <section
              aria-label={`Code : ${ecran.fichier}`}
              className="flex min-h-0 min-w-0 flex-[1.2] flex-col overflow-hidden rounded-2xl border border-[#4a3a2c] bg-encre text-[#f1e4d3] shadow-[0_18px_40px_-22px_rgba(42,30,20,0.6)]"
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-brun bg-[#231912] px-4 py-2.5">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-3 rounded-full bg-[#e0695a]" />
                  <span className="size-3 rounded-full bg-[#e8b04a]" />
                  <span className="size-3 rounded-full bg-[#7fb069]" />
                </span>
                <span className="rounded-md bg-encre px-2.5 py-1 font-mono text-[12.5px] text-[#f1e4d3]">{ecran.fichier}</span>
                <span className="ml-auto hidden font-mono text-xs text-[#a8927b] sm:inline">
                  {ecran.debut === ecran.fin ? `ligne ${ecran.debut}` : `lignes ${ecran.debut}–${ecran.fin}`} sur {lignes.length}
                </span>
                <button
                  type="button"
                  onClick={() => setTaille((t) => (t + 1) % taillesCode.length)}
                  className="cursor-pointer rounded-md px-2 py-0.5 font-mono text-xs text-[#c2ac93] hover:bg-brun hover:text-creme"
                  aria-label="Changer la taille du code"
                  title="Taille du code"
                >
                  A<span className="text-sm">A</span>
                </button>
              </div>
              <div ref={zoneCode} className="relative min-h-0 flex-1 overflow-auto py-3 font-mono leading-[1.65]" style={{ fontSize: taillesCode[taille] }}>
                {lignes.map((ligne) => {
                  const allumee = plage && ligne.n >= plage.debut && ligne.n <= plage.fin;
                  return (
                    <div
                      key={ligne.n}
                      data-ligne={ligne.n}
                      className={`flex min-h-[1.65em] border-l-[3px] pr-4 whitespace-pre transition-[opacity,background-color] duration-300 ${
                        allumee ? "border-[#f6a56c] bg-[#f6a56c]/15" : "border-transparent opacity-40"
                      }`}
                    >
                      <span aria-hidden="true" className="mr-4 shrink-0 text-right text-[#8c7660] select-none" style={{ width: `${largeurNumeros + 1.5}ch` }}>
                        {ligne.n}
                      </span>
                      <span>
                        {ligne.jetons.map((j, i) => (
                          <span key={i} style={{ color: j.c, fontStyle: j.i ? "italic" : undefined }}>
                            {j.t}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Explication */}
            <section aria-live="polite" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ligne bg-white">
              <div key={index} className="lecteur-apparition flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  {ecran.section && <Pastille>{ecran.section}</Pastille>}
                  {nouveauFichier && <Pastille>Nouveau fichier : {ecran.fichier}</Pastille>}
                </div>
                <h2 className="font-display text-[22px] leading-snug font-bold text-balance md:text-2xl">{ecran.titre}</h2>
                <span className="-mt-1 font-mono text-[13px] text-muet">
                  {ecran.fichier}, {ecran.debut === ecran.fin ? `ligne ${ecran.debut}` : `lignes ${ecran.debut} à ${ecran.fin}`}
                </span>
                <div className="prose-lecon lecteur-texte">{ecran.contenu}</div>
              </div>
            </section>
          </div>
        ) : (
          /* Écrans pleine largeur : introduction, texte, quiz, question, fin */
          <div className="mx-auto flex h-full max-w-[1600px] items-stretch justify-center">
            <section
              aria-live="polite"
              key={index}
              className="lecteur-apparition flex min-h-0 w-full max-w-[900px] flex-col overflow-y-auto rounded-2xl border border-ligne bg-white p-6 md:p-12"
            >
              <div className="my-auto flex flex-col gap-5">
                {ecran === null ? (
                  fin
                ) : ecran.type === "texte" ? (
                  <>
                    <h2 className="font-display text-[30px] leading-tight font-extrabold text-balance md:text-[38px]">{ecran.titre}</h2>
                    <div className="prose-lecon lecteur-intro">{ecran.contenu}</div>
                  </>
                ) : ecran.type === "quiz" ? (
                  <QuizLecon />
                ) : (
                  <QuestionLibre id={ecran.id} />
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav aria-label="Étapes" className="flex shrink-0 items-center justify-center gap-3 border-t border-ligne bg-creme-2 px-4 py-3">
        <button type="button" className="btn min-h-12 w-[180px] whitespace-nowrap" onClick={() => aller(index - 1)} disabled={index === 0}>
          ← Précédent
        </button>
        <span className="min-w-[110px] text-center text-sm whitespace-nowrap text-muet tabular-nums">
          Étape {index + 1} / {total}
        </span>
        <button type="button" className="btn btn-pri min-h-12 w-[180px] whitespace-nowrap" onClick={() => aller(index + 1)} disabled={index === total - 1}>
          Suivant →
        </button>
      </nav>
    </div>
  );
}
