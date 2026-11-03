"use client";

import { useActionState, useState } from "react";
import { connexion, envoyerCode, verifierCode, type EtatCode, type EtatConnexion } from "@/actions/auth";

const champ = "min-h-12 rounded-xl border border-ligne-3 bg-white px-3.5 text-base font-normal";

function Erreur({ texte }: { texte?: string }) {
  if (!texte) return null;
  return (
    <p role="alert" className="rounded-xl bg-rouge-pale px-4 py-3 text-sm font-semibold text-rouge-texte">
      {texte}
    </p>
  );
}

function ConnexionProf({ retour }: { retour: () => void }) {
  const [etat, envoyer, enCours] = useActionState<EtatConnexion, FormData>(connexion, {});
  return (
    <form action={envoyer} className="flex w-full max-w-[400px] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[32px] font-bold">Connexion prof</h2>
        <p className="text-[15px] text-muet">Avec ton identifiant et ton mot de passe.</p>
      </div>
      <label htmlFor="identifiant" className="flex flex-col gap-1.5 text-sm font-semibold">
        Identifiant
        <input id="identifiant" name="identifiant" autoComplete="username" autoCapitalize="none" spellCheck={false} defaultValue={etat.identifiant} required className={champ} />
      </label>
      <label htmlFor="mot-de-passe" className="flex flex-col gap-1.5 text-sm font-semibold">
        Mot de passe
        <input id="mot-de-passe" name="mot-de-passe" type="password" autoComplete="current-password" required className={champ} />
      </label>
      <Erreur texte={etat.erreur} />
      <button type="submit" className="btn btn-pri min-h-[50px] text-base" disabled={enCours}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
      <button type="button" onClick={retour} className="cursor-pointer self-center text-sm font-semibold text-orange-fonce underline">
        Je suis élève
      </button>
    </form>
  );
}

export function FormulaireConnexion() {
  const [modeProf, setModeProf] = useState(false);
  const [etatEmail, envoyer, envoiEnCours] = useActionState<EtatCode, FormData>(envoyerCode, { etape: "email" });
  const [etatCode, verifier, verifEnCours] = useActionState<EtatCode, FormData>(verifierCode, { etape: "code" });
  const [changerAdresse, setChangerAdresse] = useState(false);

  if (modeProf) return <ConnexionProf retour={() => setModeProf(false)} />;

  const etape = etatEmail.etape === "code" && !changerAdresse ? "code" : "email";

  if (etape === "email") {
    return (
      <form action={envoyer} onSubmit={() => setChangerAdresse(false)} className="flex w-full max-w-[400px] flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[32px] font-bold">Connexion</h2>
          <p className="text-[15px] text-muet">Tape ton adresse e-mail : tu vas recevoir un code pour te connecter.</p>
        </div>
        <label htmlFor="email" className="flex flex-col gap-1.5 text-sm font-semibold">
          Adresse e-mail
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="prenom.nom@ecole.fr"
            defaultValue={etatEmail.email}
            required
            className={champ}
          />
        </label>
        <Erreur texte={etatEmail.erreur} />
        <button type="submit" className="btn btn-pri min-h-[50px] text-base" disabled={envoiEnCours}>
          {envoiEnCours ? "Envoi du code…" : "Recevoir mon code"}
        </button>
        <button type="button" onClick={() => setModeProf(true)} className="cursor-pointer self-center text-sm font-semibold text-orange-fonce underline">
          Je suis prof
        </button>
      </form>
    );
  }

  const email = etatEmail.email ?? "";
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-5">
      <form action={verifier} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[32px] font-bold">Ton code</h2>
          <p className="text-[15px] text-muet">
            {etatEmail.info ?? "Un code vient d'être envoyé."} Il est valable une heure.
          </p>
        </div>
        <input type="hidden" name="email" value={email} />
        <label htmlFor="code" className="flex flex-col gap-1.5 text-sm font-semibold">
          Code reçu par e-mail
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={12}
            placeholder="123456"
            required
            autoFocus
            className={`${champ} text-center font-mono text-2xl tracking-[0.4em]`}
          />
        </label>
        <Erreur texte={etatCode.erreur} />
        <button type="submit" className="btn btn-pri min-h-[50px] text-base" disabled={verifEnCours}>
          {verifEnCours ? "Vérification…" : "Me connecter"}
        </button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <form action={envoyer}>
          <input type="hidden" name="email" value={email} />
          <button type="submit" disabled={envoiEnCours} className="cursor-pointer font-semibold text-orange-fonce underline disabled:opacity-50">
            {envoiEnCours ? "Envoi…" : "Renvoyer le code"}
          </button>
        </form>
        <button type="button" onClick={() => setChangerAdresse(true)} className="cursor-pointer font-semibold text-encre-2 underline">
          Changer d&apos;adresse
        </button>
      </div>
    </div>
  );
}
