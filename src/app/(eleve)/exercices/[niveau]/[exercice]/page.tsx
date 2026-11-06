import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { marquerExercice } from "@/actions/eleve";
import { composantsExercice } from "@/components/exercice/composants";
import { Apparition } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { difficultes, exercicesDuNiveau, idExercice, niveaux, trouverExercice } from "@/contenu";
import { dateAvecJour } from "@/lib/dates";
import { duree, exercicesFaits, libellesGenre } from "@/lib/exercices";
import { utilisateurCourant } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/exercices/[niveau]/[exercice]">): Promise<Metadata> {
  const { niveau, exercice } = await params;
  return { title: trouverExercice(`${niveau}/${exercice}`)?.titre ?? "Exercice" };
}

export default async function ExercicePage({ params }: PageProps<"/exercices/[niveau]/[exercice]">) {
  const { niveau: n, exercice: slug } = await params;
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  const prof = u.profil.role === "prof";

  const exercice = trouverExercice(`${n}/${slug}`);
  // Un élève ne voit que les exercices de son niveau.
  if (!exercice || (!prof && exercice.niveau !== u.classe?.niveau)) notFound();

  const id = idExercice(exercice);
  const faits = prof ? new Map<string, string>() : await exercicesFaits(u.id);
  const faitLe = faits.get(id);
  const d = difficultes.find((x) => x.id === exercice.difficulte)!;
  const techno = niveaux.find((x) => x.niveau === exercice.niveau)?.techno;

  // Suivant : le prochain pas encore réussi, sinon simplement le suivant dans la liste.
  const liste = exercicesDuNiveau(exercice.niveau);
  const index = liste.indexOf(exercice);
  const apres = [...liste.slice(index + 1), ...liste.slice(0, index)];
  const suivant = apres.find((e) => !faits.has(idExercice(e))) ?? liste[index + 1];

  const retour = prof ? `/exercices?niveau=${exercice.niveau}` : "/exercices";
  const { default: Contenu } = await exercice.charger();

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-sm text-muet">
        <Link href={retour} className="hover:text-encre">
          Exercices
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`${retour}${prof ? "&" : "?"}difficulte=${d.id}`} className="hover:text-encre">
          {d.label}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-encre">{exercice.titre}</span>
      </nav>

      <Apparition className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center gap-2">
          <Pastille ton={d.ton}>{d.label}</Pastille>
          <Pastille ton={exercice.genre === "bug" ? "rouge" : "neutre"}>{libellesGenre[exercice.genre]}</Pastille>
          <span className="text-sm text-muet">
            {exercice.niveau} · {techno} · {exercice.theme} · environ {duree(exercice.dureeMin)}
          </span>
        </span>
        <h1 className="font-display text-[38px] leading-[1.08] font-extrabold tracking-tight md:text-[44px]">{exercice.titre}</h1>
        <p className="max-w-[62ch] text-[18px] leading-relaxed text-encre-2">{exercice.resume}</p>
        {exercice.notions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="mr-1 text-muet">Notions :</span>
            {exercice.notions.map((notion) => (
              <span key={notion} className="rounded-lg border border-ligne bg-white px-2 py-0.5 font-mono text-[13px] text-encre-2">
                {notion}
              </span>
            ))}
          </div>
        )}
        {faitLe && (
          <p className="self-start rounded-xl bg-vert-pale px-3.5 py-2 text-sm font-semibold text-vert-texte">Tu as réussi cet exercice le {dateAvecJour(faitLe.slice(0, 10))}.</p>
        )}
      </Apparition>

      <article className="prose-lecon prose-exercice">
        <Contenu components={composantsExercice} />
      </article>

      <section className="carte flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <b className="font-display text-[22px]">{faitLe ? "Exercice réussi" : "Tu as fini ?"}</b>
          <span className="text-[15px] text-encre-2">
            {prof
              ? "En aperçu prof, rien n'est enregistré."
              : faitLe
                ? "Il est compté dans tes exercices réussis. Tu peux le refaire autant que tu veux."
                : "Quand tout marche en jeu, coche-le : ton prof verra que tu l'as fait."}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!prof && (
            <form action={marquerExercice.bind(null, id, !faitLe)}>
              <button type="submit" className={`btn min-h-[50px] px-5 ${faitLe ? "" : "btn-pri"}`}>
                {faitLe ? "Marquer comme pas encore réussi" : "J'ai réussi cet exercice"}
              </button>
            </form>
          )}
          {suivant && suivant !== exercice && (
            <Link href={`/exercices/${idExercice(suivant)}`} className="btn min-h-[50px] px-5">
              Exercice suivant : {suivant.titre}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
