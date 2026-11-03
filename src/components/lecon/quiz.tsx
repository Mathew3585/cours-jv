"use client";

import { useState, useTransition } from "react";
import { soumettreQuiz } from "@/actions/eleve";
import type { Quiz as QuizType } from "@/contenu/types";
import { useLecon } from "./contexte";

const lettres = ["A", "B", "C", "D", "E", "F"];
const etiquettes = { qcm: "QCM", "vrai-faux": "Vrai ou faux", code: "Lis le code" } as const;

export function QuizInteractif({
  quiz,
  meilleurScore,
  titre = "Vérifie que tu as compris",
  seuil,
  apresValidation,
  apercu = false,
}: {
  apercu?: boolean;
  quiz: QuizType;
  meilleurScore?: { score: number; total: number };
  titre?: string;
  /** Pourcentage minimum pour valider (quiz final de module) */
  seuil?: number;
  apresValidation?: React.ReactNode;
}) {
  const [demarre, setDemarre] = useState(false);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [verifie, setVerifie] = useState(false);
  const [reponses, setReponses] = useState<number[]>([]);
  const [resultat, setResultat] = useState<{ score: number; total: number } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, demarrerEnvoi] = useTransition();

  const total = quiz.questions.length;
  if (total === 0) return null;
  const q = quiz.questions[index];

  function recommencer() {
    setIndex(0);
    setChoix(null);
    setVerifie(false);
    setReponses([]);
    setResultat(null);
    setErreur(null);
    setDemarre(true);
  }

  function suivante() {
    const toutes = [...reponses, choix as number];
    setReponses(toutes);
    if (index < total - 1) {
      setIndex(index + 1);
      setChoix(null);
      setVerifie(false);
      return;
    }
    if (apercu) {
      setResultat({ score: toutes.filter((r, i) => r === quiz.questions[i].bonne).length, total });
      return;
    }
    demarrerEnvoi(async () => {
      const r = await soumettreQuiz(quiz.id, toutes);
      if ("erreur" in r) setErreur(r.erreur);
      else setResultat({ score: r.score, total: r.total });
    });
  }

  if (!demarre) {
    return (
      <section className="not-prose my-8 flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-ligne bg-white p-6">
        <div className="flex flex-col gap-1.5">
          <b className="font-display text-[22px]">{titre}</b>
          <span className="text-[15px] text-muet">
            {total} question{total > 1 ? "s" : ""}
            {seuil !== undefined && ` · ${seuil} % pour valider`}
            {meilleurScore ? ` · ta meilleure note : ${meilleurScore.score} / ${meilleurScore.total}` : " · ton score est enregistré"}
          </span>
        </div>
        <button type="button" className="btn btn-pri min-h-[50px] px-6" onClick={() => setDemarre(true)}>
          {meilleurScore ? "Refaire le quiz" : "Faire le quiz"}
        </button>
      </section>
    );
  }

  if (resultat || erreur || envoi) {
    const pourcentage = resultat ? Math.round((resultat.score / resultat.total) * 100) : 0;
    const valide = seuil === undefined || pourcentage >= seuil;
    return (
      <section aria-live="polite" className="not-prose my-8 flex flex-col items-center gap-4 rounded-3xl border border-ligne bg-white px-8 py-10 text-center">
        {envoi && <span className="text-muet">Enregistrement de ton score…</span>}
        {erreur && <span className="font-semibold text-rouge-texte">{erreur}</span>}
        {resultat && (
          <>
            <span className="text-sm font-semibold text-muet">Quiz terminé</span>
            <b className="font-display text-[64px] leading-none font-extrabold tabular-nums">
              {resultat.score} / {resultat.total}
            </b>
            <p className="max-w-[46ch] text-[17px] text-encre-2">
              {seuil !== undefined
                ? valide
                  ? `Module validé : tu as ${pourcentage} %, il fallait ${seuil} %.`
                  : `Tu as ${pourcentage} %, il faut ${seuil} % pour valider le module. Relis les leçons sur lesquelles tu as hésité et retente.`
                : resultat.score === resultat.total
                  ? "Parfait, tu maîtrises cette leçon."
                  : "Relis les étapes sur lesquelles tu as hésité, puis retente le quiz si tu veux."}
            </p>
          </>
        )}
        <div className="flex flex-wrap justify-center gap-2.5">
          <button type="button" className="btn" onClick={recommencer} disabled={envoi}>
            Recommencer
          </button>
          {resultat && valide && apresValidation}
        </div>
      </section>
    );
  }

  return (
    <section aria-label={titre} className="not-prose my-8 flex flex-col gap-5 rounded-3xl border border-ligne bg-white p-6 md:p-8">
      <div className="flex gap-2" aria-hidden="true">
        {quiz.questions.map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < index ? "bg-encre-2" : i === index ? "bg-orange" : "bg-ligne-2"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-muet">
          Question {index + 1} sur {total}
        </span>
        <span className="rounded-full bg-orange-pale px-2.5 py-1 text-[12.5px] font-semibold text-orange-texte">{etiquettes[q.type]}</span>
      </div>
      <h3 className="font-display text-2xl leading-tight font-bold">{q.enonce}</h3>
      {q.code && (
        <pre className="overflow-x-auto rounded-[14px] bg-encre px-[18px] py-4 font-mono text-sm leading-[1.7] text-[#f1e4d3]">{q.code}</pre>
      )}
      <div className="flex flex-col gap-2.5">
        {q.choix.map((texte, i) => {
          const choisi = choix === i;
          const juste = verifie && i === q.bonne;
          const faux = verifie && choisi && i !== q.bonne;
          return (
            <button
              key={i}
              type="button"
              disabled={verifie}
              aria-pressed={choisi}
              onClick={() => setChoix(i)}
              className={`flex min-h-14 w-full cursor-pointer items-center gap-3.5 rounded-[14px] border-[1.5px] px-4 py-3 text-left text-base transition-colors disabled:cursor-default ${
                juste
                  ? "border-vert bg-vert-pale"
                  : faux
                    ? "border-rouge bg-rouge-pale"
                    : choisi
                      ? "border-orange bg-[#fff1e2]"
                      : "border-ligne-2 bg-white hover:border-[#e8b48a]"
              }`}
            >
              <span
                className={`grid size-[30px] shrink-0 place-items-center rounded-[9px] font-mono text-[13px] font-semibold ${
                  juste ? "bg-vert text-white" : faux ? "bg-rouge text-white" : choisi ? "bg-orange text-white" : "bg-neutre text-encre-2"
                }`}
              >
                {lettres[i]}
              </span>
              <span>{texte}</span>
            </button>
          );
        })}
      </div>
      {verifie && (
        <div
          aria-live="polite"
          className={`rounded-[14px] px-[18px] py-4 text-[15.5px] leading-relaxed ${
            choix === q.bonne ? "bg-vert-pale text-vert-texte" : "bg-rouge-pale text-rouge-texte"
          }`}
        >
          <b>{choix === q.bonne ? "Bien vu." : "Pas tout à fait."}</b> {q.explication}
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2.5">
        {verifie ? (
          <button type="button" className="btn btn-pri min-h-[50px] px-6" onClick={suivante}>
            {index === total - 1 ? "Voir mon score" : "Question suivante"}
          </button>
        ) : (
          <button type="button" className="btn btn-pri min-h-[50px] px-6" onClick={() => setVerifie(true)} disabled={choix === null}>
            Valider ma réponse
          </button>
        )}
      </div>
    </section>
  );
}

/** Le quiz de la leçon en cours, placé dans le MDX avec <Quiz />. */
export function QuizLecon() {
  const lecon = useLecon();
  if (!lecon?.quiz) return null;
  return <QuizInteractif quiz={lecon.quiz} meilleurScore={lecon.meilleurScore} apercu={lecon.apercu} />;
}
