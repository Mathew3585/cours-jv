"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  changerClasse,
  corrigerReponse,
  creerClasse,
  creerCompte,
  enregistrerNotePrivee,
  enregistrerProjetClasse,
  importerComptes,
  reinitialiserMotDePasse,
  type CompteCree,
  type EtatAction,
  type EtatCreation,
} from "@/actions/prof";
import { ChampNombre, Interrupteur, ListeDeroulante, SelecteurDate, ZoneFichier } from "@/components/champs";
import type { Classe } from "@/lib/supabase/types";

const champ = "min-h-11 rounded-xl border border-ligne-3 bg-creme px-3 text-[15px] font-normal text-encre";
const etiquette = "flex flex-col gap-1.5 text-[13px] font-semibold text-encre-2";

function Message({ etat }: { etat: EtatAction }) {
  if (!etat.erreur && !etat.ok) return null;
  return (
    <p aria-live="polite" className={`text-sm font-semibold ${etat.erreur ? "text-rouge-texte" : "text-vert-texte"}`}>
      {etat.erreur ?? etat.ok}
    </p>
  );
}

function anneeScolaire() {
  const d = new Date();
  const debut = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return `${debut}-${debut + 1}`;
}

export function FormulaireClasse() {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(creerClasse, {});
  return (
    <form action={envoyer} className="carte flex flex-col gap-3.5 p-6">
      <h2 className="font-display text-xl font-bold">Nouvelle classe</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        <label htmlFor="classe-niveau" className={etiquette}>
          Niveau
          <ListeDeroulante id="classe-niveau" name="niveau" defaultValue="JV3" options={["JV1", "JV2", "JV3"].map((n) => ({ value: n, label: n }))} />
        </label>
        <label htmlFor="classe-nom" className={etiquette}>
          Nom affiché
          <input id="classe-nom" name="nom" placeholder="ex. JV3 groupe A" className={champ} />
        </label>
        <label htmlFor="classe-annee" className={etiquette}>
          Année
          <input id="classe-annee" name="annee" defaultValue={anneeScolaire()} className={champ} />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Message etat={etat} />
        <button type="submit" className="btn btn-pri ml-auto" disabled={enCours}>
          Créer la classe
        </button>
      </div>
    </form>
  );
}

function ComptesCrees({ etat }: { etat: EtatCreation }) {
  if (etat.erreur) return <p className="text-sm font-semibold text-rouge-texte">{etat.erreur}</p>;
  if (!etat.crees) return null;
  const copier = () => {
    const texte = etat.crees!.map((c) => `${c.prenom} ${c.nom}\t${c.identifiant}\t${c.motDePasse}`).join("\n");
    navigator.clipboard.writeText(texte).catch(() => {});
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-vert-pale p-4">
      <b className="text-vert-texte">
        {etat.crees.length} compte{etat.crees.length > 1 ? "s" : ""} créé{etat.crees.length > 1 ? "s" : ""}. Note les mots de passe maintenant : ils ne
        seront plus affichés.
      </b>
      {etat.crees.length > 0 && (
        <>
          <ul className="flex flex-col gap-1 font-mono text-[13.5px]">
            {etat.crees.map((c) => (
              <li key={c.identifiant}>
                {c.prenom} {c.nom} · <b>{c.identifiant}</b> · <b>{c.motDePasse}</b>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={copier}>
              Copier la liste
            </button>
            <button type="button" className="btn" onClick={() => imprimerFiches(etat.crees!)}>
              Imprimer les fiches
            </button>
          </div>
        </>
      )}
      {etat.echecs && etat.echecs.length > 0 && (
        <div className="text-sm text-rouge-texte">
          <b>Pas créés :</b>
          <ul className="list-disc pl-5">
            {etat.echecs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Ouvre une page imprimable avec une fiche découpable par élève. */
function imprimerFiches(comptes: CompteCree[]) {
  const fenetre = window.open("", "_blank");
  if (!fenetre) return;
  const echapper = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const fiches = comptes
    .map(
      (c) => `<div class="fiche"><b>${echapper(c.prenom)} ${echapper(c.nom)}</b><span>${echapper(c.classe)}</span>
<p>Site : ${echapper(location.origin)}</p><p>Identifiant : <code>${echapper(c.identifiant)}</code></p><p>Mot de passe : <code>${echapper(c.motDePasse)}</code></p></div>`,
    )
    .join("");
  fenetre.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fiches identifiants</title>
<style>body{font-family:system-ui,sans-serif;margin:24px}.grille{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fiche{border:1px dashed #999;border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:4px;break-inside:avoid}
.fiche b{font-size:18px}.fiche span{color:#666;font-size:13px}.fiche p{margin:4px 0}code{font-size:16px;font-weight:bold}</style>
</head><body><div class="grille">${fiches}</div><script>window.onload=()=>window.print()</script></body></html>`);
  fenetre.document.close();
}

function ChoixClasse({ classes, id, defaut }: { classes: Classe[]; id: string; defaut?: string }) {
  return (
    <label htmlFor={id} className={etiquette}>
      Classe
      <ListeDeroulante id={id} name="classe" defaultValue={defaut ?? classes[0]?.id} options={classes.map((c) => ({ value: c.id, label: `${c.nom} · ${c.annee}` }))} />
    </label>
  );
}

export function FormulaireCompte({ classes }: { classes: Classe[] }) {
  const [etat, envoyer, enCours] = useActionState<EtatCreation, FormData>(creerCompte, {});
  return (
    <form action={envoyer} className="carte flex flex-[1_1_360px] flex-col gap-3.5 p-6">
      <h2 className="font-display text-xl font-bold">Ajouter un élève</h2>
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="compte-prenom" className={etiquette}>
          Prénom
          <input id="compte-prenom" name="prenom" required className={champ} />
        </label>
        <label htmlFor="compte-nom" className={etiquette}>
          Nom
          <input id="compte-nom" name="nom" required className={champ} />
        </label>
      </div>
      <ChoixClasse classes={classes} id="compte-classe" />
      <p className="text-[13px] text-muet">L&apos;identifiant (prenom.nom) et un mot de passe provisoire sont créés automatiquement.</p>
      <button type="submit" className="btn btn-pri self-start" disabled={enCours || classes.length === 0}>
        {enCours ? "Création…" : "Créer le compte"}
      </button>
      <ComptesCrees etat={etat} />
    </form>
  );
}

export function FormulaireImport({ classes }: { classes: Classe[] }) {
  const [etat, envoyer, enCours] = useActionState<EtatCreation, FormData>(importerComptes, {});
  const [texte, setTexte] = useState("");

  async function lireFichier(f: File) {
    setTexte(await f.text());
  }

  const nbLignes = texte.split(/\r?\n/).filter((l) => /[;,\t]/.test(l)).length;

  return (
    <form action={envoyer} className="carte flex flex-[1_1_360px] flex-col gap-3.5 p-6">
      <h2 className="font-display text-xl font-bold">Importer une classe entière</h2>
      <ZoneFichier id="import-fichier" accept=".csv,.txt" onFichier={lireFichier} consigne="Fichier CSV (dans Excel : Enregistrer sous… CSV)" />
      <label htmlFor="import-liste" className={etiquette}>
        Ou colle la liste, une ligne par élève : prénom ; nom
        <textarea
          id="import-liste"
          name="liste"
          rows={6}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={"Inès ; Moreau\nHugo ; Lefèvre"}
          className="rounded-xl border border-ligne-3 bg-creme px-3 py-2 font-mono text-sm font-normal"
        />
      </label>
      <ChoixClasse classes={classes} id="import-classe" />
      <button type="submit" className="btn btn-pri self-start" disabled={enCours || nbLignes === 0 || classes.length === 0}>
        {enCours ? "Création…" : nbLignes > 0 ? `Créer ${nbLignes} compte${nbLignes > 1 ? "s" : ""}` : "Créer les comptes"}
      </button>
      <ComptesCrees etat={etat} />
    </form>
  );
}

export function BoutonReinitialiser({ eleveId, nom }: { eleveId: string; nom: string }) {
  const [resultat, setResultat] = useState<EtatAction>({});
  const [enCours, demarrer] = useTransition();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn min-h-9 text-sm"
        disabled={enCours}
        aria-label={`Nouveau mot de passe pour ${nom}`}
        onClick={() => demarrer(async () => setResultat(await reinitialiserMotDePasse(eleveId)))}
      >
        {enCours ? "…" : "Nouveau mot de passe"}
      </button>
      {resultat.ok && (
        <span className="font-mono text-sm">
          <b>{resultat.ok}</b>
        </span>
      )}
      {resultat.erreur && <span className="text-sm text-rouge-texte">{resultat.erreur}</span>}
    </span>
  );
}

export function FormulaireChangerClasse({ eleveId, classes, actuelle }: { eleveId: string; classes: Classe[]; actuelle: string | null }) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(changerClasse.bind(null, eleveId), {});
  return (
    <form action={envoyer} className="flex flex-wrap items-end gap-2.5">
      <label htmlFor="changer-classe" className={etiquette}>
        Classe
        <ListeDeroulante
          id="changer-classe"
          name="classe"
          defaultValue={actuelle ?? ""}
          className="min-w-[220px]"
          options={[{ value: "", label: "Aucune classe" }, ...classes.map((c) => ({ value: c.id, label: `${c.nom} · ${c.annee}` }))]}
        />
      </label>
      <button type="submit" className="btn" disabled={enCours}>
        Changer
      </button>
      <Message etat={etat} />
    </form>
  );
}

export function FormulaireNotePrivee({ eleveId, note }: { eleveId: string; note: string | null }) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(enregistrerNotePrivee.bind(null, eleveId), {});
  return (
    <form action={envoyer} className="flex flex-col gap-2.5">
      <label htmlFor="note-privee" className={etiquette}>
        Visible par toi seul
        <textarea id="note-privee" name="note" rows={4} defaultValue={note ?? ""} className="rounded-xl border border-ligne-3 bg-creme px-3 py-2 text-[15px] font-normal" />
      </label>
      <div className="flex items-center justify-between gap-3">
        <Message etat={etat} />
        <button type="submit" className="btn ml-auto" disabled={enCours}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

export function FormulaireCorrection({ reponseId, noteInitiale, commentaireInitial }: { reponseId: number; noteInitiale?: number | null; commentaireInitial?: string | null }) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(corrigerReponse.bind(null, reponseId), {});
  const [note, setNote] = useState<number | null>(noteInitiale ?? null);
  return (
    <form action={envoyer} className="flex flex-col gap-3.5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold tracking-wider text-muet uppercase">Note sur 5</legend>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`grid size-12 cursor-pointer place-items-center rounded-xl border-[1.5px] font-display text-[17px] font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-orange ${
                note === n ? "border-orange-fonce bg-orange-fonce text-white" : "border-ligne-2 bg-white"
              }`}
            >
              <input type="radio" name="note" value={n} checked={note === n} onChange={() => setNote(n)} className="sr-only" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`commentaire-${reponseId}`} className={etiquette}>
        Commentaire pour l&apos;élève
        <textarea
          id={`commentaire-${reponseId}`}
          name="commentaire"
          rows={3}
          defaultValue={commentaireInitial ?? ""}
          className="rounded-xl border border-ligne-3 bg-creme px-3 py-2 text-[15px] font-normal"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Message etat={etat} />
        <button type="submit" className="btn btn-pri ml-auto" disabled={enCours || note === null}>
          {enCours ? "Enregistrement…" : "Enregistrer la correction"}
        </button>
      </div>
    </form>
  );
}

export type ModuleDeadline = { slug: string; titre: string; date: string };

export function FormulaireProjetClasse({
  projetSlug,
  classeId,
  ouvert,
  modules,
  regles,
}: {
  projetSlug: string;
  classeId: string;
  ouvert: boolean;
  modules: ModuleDeadline[];
  regles: { ouvert_le: string; deblocage_progressif: boolean; seuil_validation: number; notes_visibles: boolean };
}) {
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(enregistrerProjetClasse.bind(null, projetSlug, classeId), {});
  return (
    <form action={envoyer} className="flex flex-col gap-5">
      <label htmlFor="pp-ouvert" className={`${etiquette} max-w-[240px]`}>
        Ouvert depuis le
        <SelecteurDate id="pp-ouvert" name="ouvert_le" defaultValue={regles.ouvert_le} />
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-semibold tracking-wider text-muet uppercase">Deadline par module</legend>
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2.5">
          {modules.map((m, i) => (
            <div key={m.slug} className="contents">
              <label htmlFor={`dl-${m.slug}`} className="font-semibold">
                {i + 1}. {m.titre}
              </label>
              <div className="w-[260px]">
                <SelecteurDate id={`dl-${m.slug}`} name={`deadline-${m.slug}`} defaultValue={m.date} placeholder="Pas de deadline" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muet">Laisse vide pour un module sans deadline.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-semibold tracking-wider text-muet uppercase">Règles</legend>
        <Interrupteur id="pp-deblocage" name="deblocage_progressif" defaultChecked={regles.deblocage_progressif}>
          Débloquer les modules un par un : le suivant s&apos;ouvre quand le précédent est validé
        </Interrupteur>
        <Interrupteur id="pp-notes" name="notes_visibles" defaultChecked={regles.notes_visibles}>
          Montrer aux élèves la note et le commentaire de leurs réponses libres dès qu&apos;elles sont corrigées
        </Interrupteur>
        <div className="flex flex-wrap items-center gap-2.5 text-[15px]">
          <label htmlFor="pp-seuil">Module validé à partir de</label>
          <ChampNombre id="pp-seuil" name="seuil" min={0} max={100} pas={5} defaultValue={regles.seuil_validation} suffixe="%" />
          <span>au quiz final</span>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ligne pt-4">
        <Message etat={etat} />
        <button type="submit" className="btn btn-pri ml-auto" disabled={enCours}>
          {enCours ? "Enregistrement…" : ouvert ? "Enregistrer" : "Ouvrir le projet à cette classe"}
        </button>
      </div>
    </form>
  );
}

/** Bouton d'action destructive avec une étape de confirmation dans la page. */
export function BoutonConfirmer({ action, libelle, confirmation }: { action: () => Promise<void>; libelle: string; confirmation: string }) {
  const [demande, setDemande] = useState(false);
  const [enCours, demarrer] = useTransition();
  if (!demande) {
    return (
      <button type="button" className="btn text-rouge-texte" onClick={() => setDemande(true)}>
        {libelle}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-rouge-pale px-3 py-2 text-sm">
      <span className="text-rouge-texte">{confirmation}</span>
      <button type="button" className="btn min-h-9 border-rouge bg-rouge text-white" disabled={enCours} onClick={() => demarrer(action)}>
        Confirmer
      </button>
      <button type="button" className="btn min-h-9" onClick={() => setDemande(false)}>
        Annuler
      </button>
    </span>
  );
}

const suggestionsMessage = ["Bien joué, continue comme ça !", "Pense à la deadline de vendredi.", "Viens me voir à la fin du cours.", "Regarde ma correction dans Mes quiz et notes."];

/** Envoie un message qui s'affiche en bandeau chez l'élève (ou chez toute la classe). */
export function FormulaireMessage({
  action,
  id,
  placeholder = "Écris ton message…",
  libelle = "Envoyer",
}: {
  action: (etat: EtatAction, formData: FormData) => Promise<EtatAction>;
  id: string;
  placeholder?: string;
  libelle?: string;
}) {
  const formulaire = useRef<HTMLFormElement>(null);
  const zone = useRef<HTMLTextAreaElement>(null);
  const [etat, envoyer, enCours] = useActionState<EtatAction, FormData>(async (precedent, formData) => {
    const resultat = await action(precedent, formData);
    if (resultat.ok) formulaire.current?.reset();
    return resultat;
  }, {});

  return (
    <form ref={formulaire} action={envoyer} className="flex flex-col gap-2.5">
      <label htmlFor={id} className="sr-only">
        Message
      </label>
      <textarea
        ref={zone}
        id={id}
        name="message"
        rows={3}
        maxLength={500}
        required
        placeholder={placeholder}
        className="resize-y rounded-xl border border-ligne-3 bg-creme px-3 py-2.5 text-[15px] font-normal"
      />
      <div className="flex flex-wrap gap-1.5">
        {suggestionsMessage.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (zone.current) {
                zone.current.value = s;
                zone.current.focus();
              }
            }}
            className="cursor-pointer rounded-full border border-ligne-2 bg-white px-2.5 py-1 text-[12.5px] text-encre-2 hover:border-[#e8b48a] hover:text-encre"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Message etat={etat} />
        <button type="submit" className="btn btn-pri ml-auto" disabled={enCours}>
          {enCours ? "Envoi…" : libelle}
        </button>
      </div>
    </form>
  );
}
