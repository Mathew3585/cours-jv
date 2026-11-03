"use client";

import { useActionState } from "react";
import { enregistrerReponseLibre, type EtatEnvoi } from "@/actions/eleve";
import { useLecon } from "./contexte";

/** Question à réponse libre, placée dans le MDX avec <QuestionLibre id="…" />. Le prof la corrige depuis son espace. */
export function QuestionLibre({ id }: { id: string }) {
  const lecon = useLecon();
  const question = lecon?.questionsLibres[id];
  const action = enregistrerReponseLibre.bind(null, id);
  const [etat, envoyer, enCours] = useActionState<EtatEnvoi, FormData>(action, {});

  if (!question) return null;
  const reponse = question.reponse;
  const champ = `reponse-${id.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <section className="not-prose my-8 flex flex-col gap-4 rounded-[20px] border border-ligne bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-orange-pale px-2.5 py-1 text-[12.5px] font-semibold text-orange-texte">Question libre · corrigée par ton prof</span>
        {reponse?.corrigee && lecon.notesVisibles && reponse.note !== null && (
          <span className="rounded-full bg-vert-pale px-3 py-1 text-[13px] font-semibold text-vert-texte">{reponse.note} / 5</span>
        )}
      </div>
      <label htmlFor={champ} className="font-display text-xl leading-snug font-bold">
        {question.enonce}
      </label>

      {lecon.apercu ? (
        <p className="rounded-[14px] border border-dashed border-ligne-3 px-4 py-3.5 text-[15px] text-muet">
          Aperçu prof : les élèves écrivent leur réponse ici, puis tu la corriges depuis « À corriger ».
        </p>
      ) : reponse?.corrigee ? (
        <>
          <p className="rounded-[14px] border border-ligne bg-creme px-[18px] py-4 text-base leading-relaxed">{reponse.texte}</p>
          {lecon.notesVisibles && reponse.commentaire && (
            <p className="rounded-[14px] bg-creme-2 px-4 py-3.5 text-[15px] leading-normal">
              <b>Ton prof :</b> {reponse.commentaire}
            </p>
          )}
        </>
      ) : (
        <form action={envoyer} className="flex flex-col gap-3">
          <textarea
            id={champ}
            name="reponse"
            rows={4}
            defaultValue={reponse?.texte ?? ""}
            placeholder="Réponds avec tes mots, en une ou plusieurs phrases."
            className="resize-y rounded-xl border border-ligne-3 bg-creme px-3.5 py-3 text-base leading-relaxed"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span aria-live="polite" className={`text-sm ${etat.erreur ? "font-semibold text-rouge-texte" : "text-muet"}`}>
              {etat.erreur ?? (etat.ok ? "Réponse envoyée. Tu peux la modifier tant que ton prof ne l'a pas corrigée." : reponse ? "Réponse envoyée, en attente de correction." : "")}
            </span>
            <button type="submit" className="btn btn-pri" disabled={enCours}>
              {enCours ? "Envoi…" : reponse ? "Modifier ma réponse" : "Envoyer ma réponse"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
