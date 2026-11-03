"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { modifierEleve, supprimerEleve, type EtatAction } from "@/actions/prof";
import { ListeDeroulante } from "@/components/champs";
import { BoutonConfirmer } from "@/components/prof/formulaires";
import type { Classe } from "@/lib/supabase/types";

type Eleve = { id: string; prenom: string; nom: string; email: string; classeId: string | null };

const champ = "min-h-11 w-full rounded-xl border border-ligne-3 bg-creme px-3 text-[15px] font-normal text-encre";
const etiquette = "flex flex-col gap-1.5 text-[13px] font-semibold text-encre-2";
// Évite que les gestionnaires de mots de passe du navigateur s'invitent dans ce formulaire
const sansGestionnaire = { "data-bwignore": "true", "data-1p-ignore": "true", "data-lpignore": "true" } as const;

function Crayon({ taille = 18 }: { taille?: number }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

/** Bouton (icône crayon ou bouton « Modifier ») qui ouvre une fenêtre pour modifier le compte d'un élève. */
export function ModaleEleve({ eleve, classes, variante = "icone" }: { eleve: Eleve; classes: Classe[]; variante?: "icone" | "bouton" }) {
  const [ouverte, setOuverte] = useState(false);
  const nom = `${eleve.prenom} ${eleve.nom}`.trim();

  return (
    <>
      {variante === "icone" ? (
        <button
          type="button"
          onClick={() => setOuverte(true)}
          aria-label={`Modifier ${nom}`}
          title="Modifier l'élève"
          className="grid size-10 cursor-pointer place-items-center rounded-xl text-muet transition-colors hover:bg-creme-2 hover:text-orange-fonce"
        >
          <Crayon />
        </button>
      ) : (
        <button type="button" onClick={() => setOuverte(true)} className="btn">
          <Crayon taille={16} />
          Modifier
        </button>
      )}
      {ouverte && <Fenetre eleve={eleve} classes={classes} fermer={() => setOuverte(false)} />}
    </>
  );
}

function Fenetre({ eleve, classes, fermer }: { eleve: Eleve; classes: Classe[]; fermer: () => void }) {
  const idTitre = useId();
  const premierChamp = useRef<HTMLInputElement>(null);
  const [voirMdp, setVoirMdp] = useState(false);
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(async (precedent, formData) => {
    const r = await modifierEleve(eleve.id, precedent, formData);
    if (r.ok) setTimeout(fermer, 700);
    return r;
  }, {});

  useEffect(() => {
    premierChamp.current?.focus();
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
    };
    document.addEventListener("keydown", echap);
    const ancien = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", echap);
      document.body.style.overflow = ancien;
    };
  }, [fermer]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-encre/40 p-4 backdrop-blur-[2px]" onPointerDown={(e) => e.target === e.currentTarget && fermer()}>
      <div role="dialog" aria-modal="true" aria-labelledby={idTitre} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-y-auto rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(42,30,20,0.5)]">
        <div className="flex items-center justify-between gap-3 border-b border-ligne px-6 py-4">
          <h2 id={idTitre} className="font-display text-xl font-bold">
            Modifier l&apos;élève
          </h2>
          <button type="button" onClick={fermer} aria-label="Fermer" className="grid size-9 cursor-pointer place-items-center rounded-lg text-muet hover:bg-creme-2 hover:text-encre">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form action={envoyer} autoComplete="off" className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="me-prenom" className={etiquette}>
              Prénom
              <input ref={premierChamp} id="me-prenom" name="prenom" defaultValue={eleve.prenom} required className={champ} {...sansGestionnaire} />
            </label>
            <label htmlFor="me-nom" className={etiquette}>
              Nom
              <input id="me-nom" name="nom" defaultValue={eleve.nom} className={champ} {...sansGestionnaire} />
            </label>
          </div>
          <label htmlFor="me-email" className={etiquette}>
            Adresse e-mail
            <input id="me-email" name="email" type="email" defaultValue={eleve.email} required className={champ} {...sansGestionnaire} />
          </label>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="me-mdp" className="text-[13px] font-semibold text-encre-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="me-mdp"
                name="mot-de-passe"
                type={voirMdp ? "text" : "password"}
                minLength={6}
                autoComplete="new-password"
                placeholder="Laisser vide pour ne pas le changer"
                className={`${champ} pr-12`}
                {...sansGestionnaire}
              />
              <button
                type="button"
                onClick={() => setVoirMdp((v) => !v)}
                aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={voirMdp}
                className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muet hover:bg-creme-2 hover:text-encre"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                  {voirMdp && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
            <span className="text-xs text-muet">6 caractères minimum. Donne-le ensuite à l&apos;élève.</span>
          </div>
          <label htmlFor="me-classe" className={etiquette}>
            Classe
            <ListeDeroulante
              id="me-classe"
              name="classe"
              defaultValue={eleve.classeId ?? ""}
              options={[{ value: "", label: "Aucune classe" }, ...classes.map((c) => ({ value: c.id, label: `${c.nom} · ${c.annee}` }))]}
            />
          </label>

          {(etat.erreur || etat.ok) && (
            <p aria-live="polite" className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${etat.erreur ? "bg-rouge-pale text-rouge-texte" : "bg-vert-pale text-vert-texte"}`}>
              {etat.erreur ?? etat.ok}
            </p>
          )}
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={fermer} className="btn">
              Annuler
            </button>
            <button type="submit" className="btn btn-pri" disabled={enCours}>
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ligne bg-creme-3 px-6 py-4">
          <span className="text-[13px] text-muet">Supprimer efface aussi sa progression et ses notes.</span>
          <BoutonConfirmer action={supprimerEleve.bind(null, eleve.id)} libelle="Supprimer le compte" confirmation="Définitivement ?" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
