"use client";

import { useActionState } from "react";
import { connexion, type EtatConnexion } from "@/actions/auth";

export function FormulaireConnexion() {
  const [etat, envoyer, enCours] = useActionState<EtatConnexion, FormData>(connexion, {});

  return (
    <form action={envoyer} className="flex w-full max-w-[400px] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[32px] font-bold">Connexion</h2>
        <p className="text-[15px] text-muet">Utilise l&apos;identifiant que ton prof t&apos;a donné.</p>
      </div>
      <label htmlFor="identifiant" className="flex flex-col gap-1.5 text-sm font-semibold">
        Identifiant
        <input
          id="identifiant"
          name="identifiant"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="prenom.nom"
          defaultValue={etat.identifiant}
          required
          className="min-h-12 rounded-xl border border-ligne-3 bg-white px-3.5 text-base font-normal"
        />
      </label>
      <label htmlFor="mot-de-passe" className="flex flex-col gap-1.5 text-sm font-semibold">
        Mot de passe
        <input
          id="mot-de-passe"
          name="mot-de-passe"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-xl border border-ligne-3 bg-white px-3.5 text-base font-normal"
        />
      </label>
      {etat.erreur && (
        <p role="alert" className="rounded-xl bg-rouge-pale px-4 py-3 text-sm font-semibold text-rouge-texte">
          {etat.erreur}
        </p>
      )}
      <button type="submit" className="btn btn-pri min-h-[50px] text-base" disabled={enCours}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
      <p className="rounded-2xl border border-ligne bg-white px-4 py-3.5 text-sm leading-normal text-encre-2">
        Pas de compte ou mot de passe oublié ? Ton prof crée les comptes et peut réinitialiser ton mot de passe.
      </p>
    </form>
  );
}
