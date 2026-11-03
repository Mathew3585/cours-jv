import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { envoyerMessageClasse, supprimerClasse } from "@/actions/prof";
import { BoutonConfirmer, FormulaireMessage } from "@/components/prof/formulaires";
import { TableauEleves, type LigneEleve } from "@/components/prof/tableau-eleves";
import { trouverProjet } from "@/contenu";
import { dateCourte, ilYa, joursRestants, libelleJoursRestants } from "@/lib/dates";
import { suiviClasse } from "@/lib/donnees-prof";
import { derniereActivite, leconActuelle, moyenneQuiz, progressionModule, progressionProjet, statutEleve } from "@/lib/progression";

export const metadata: Metadata = { title: "Suivi de la classe" };

export default async function ClassePage({ params }: PageProps<"/prof/classes/[id]">) {
  const { id } = await params;
  const suivi = await suiviClasse(id);
  if (!suivi) notFound();
  const { classe, ouverts, deadlines, eleves } = suivi;
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const ouvert = ouverts[0];
  const projet = ouvert ? trouverProjet(ouvert.projet_slug) : undefined;
  const seuil = ouvert?.seuil_validation ?? 70;

  const lignes: LigneEleve[] = eleves.map(({ profil, d }) => {
    const actuelle = leconActuelle(d);
    const moyenne = moyenneQuiz(d);
    const activite = derniereActivite(d);
    return {
      id: profil.id,
      nom: `${profil.prenom} ${profil.nom}`,
      lecon: actuelle ? (actuelle.commencee ? actuelle.lecon.titre : `à commencer : ${actuelle.lecon.titre}`) : "tout est fait",
      progression: projet ? progressionProjet(d, projet, seuil) : 0,
      moyenne: moyenne === null ? "–" : moyenne.toFixed(1).replace(".", ","),
      activite: activite ? ilYa(activite) : "jamais",
      statut: statutEleve(d, aujourdhui),
    };
  });

  const moyenneClasse = lignes.length ? Math.round(lignes.reduce((n, l) => n + l.progression, 0) / lignes.length) : 0;
  const moyennesQuiz = eleves.map((e) => moyenneQuiz(e.d)).filter((x): x is number => x !== null);
  const moyenneQuizClasse = moyennesQuiz.length ? (moyennesQuiz.reduce((a, b) => a + b, 0) / moyennesQuiz.length).toFixed(1).replace(".", ",") : "–";
  const enRetard = lignes.filter((l) => l.statut === "retard").length;

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex gap-2 text-sm text-muet">
        <Link href="/prof/classes" className="hover:text-encre">
          Classes
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-encre">{classe.nom}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muet">
            {classe.niveau} · {classe.annee}
          </span>
          <h1 className="font-display text-[40px] font-extrabold tracking-tight">
            {classe.nom}
            {projet && ` · ${projet.titre}`}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href={`/prof/projets?classe=${classe.id}${projet ? `&projet=${projet.slug}` : ""}`} className="btn">
            {projet ? "Modifier les deadlines" : "Ouvrir un projet"}
          </Link>
          <Link href="/prof/comptes" className="btn">
            Ajouter des élèves
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        {[
          [String(eleves.length), "élèves"],
          [`${moyenneClasse} %`, "progression moyenne"],
          [moyenneQuizClasse, "moyenne des quiz /20"],
          [String(enRetard), "en retard sur une deadline"],
        ].map(([valeur, label], i) => (
          <div key={label} className="carte flex flex-col px-5 py-4">
            <b className={`font-display text-[32px] tabular-nums ${i === 3 && enRetard > 0 ? "text-rouge-texte" : ""}`}>{valeur}</b>
            <span className="text-sm text-muet">{label}</span>
          </div>
        ))}
      </div>

      {projet && (
        <section className="carte flex flex-col gap-3.5 px-[22px] py-5">
          <h2 className="font-display text-lg font-bold">Deadlines de la classe</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
            {projet.modules.map((mod, i) => {
              const date = deadlines.find((dl) => dl.module_slug === mod.slug && dl.projet_slug === projet.slug)?.date;
              const valides = eleves.filter((e) => progressionModule(e.d, projet, mod, seuil) >= 100).length;
              const proche = date && date >= aujourdhui && joursRestants(date) <= 7;
              return (
                <div key={mod.slug} className={`flex flex-col gap-1 rounded-[14px] border px-3.5 py-3 ${proche ? "border-orange bg-creme-2" : "border-ligne"}`}>
                  <b className="text-[15px]">
                    {i + 1}. {mod.titre}
                  </b>
                  <span className="text-sm text-encre-2">{date ? `${dateCourte(date)} · ${libelleJoursRestants(joursRestants(date))}` : "pas de deadline"}</span>
                  <span className="text-[13px] text-muet">
                    {valides} élève{valides > 1 ? "s l'ont" : " l'a"} validé
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <TableauEleves lignes={lignes} />

      {eleves.length > 0 && (
        <section className="carte flex flex-col gap-3 p-6">
          <h2 className="font-display text-lg font-bold">Message à toute la classe</h2>
          <p className="-mt-1 text-sm text-muet">
            Les {eleves.length} élèves de {classe.nom} le reçoivent en bandeau, tout de suite s&apos;ils sont connectés. Pour écrire à un seul élève, ouvre sa fiche.
          </p>
          <FormulaireMessage action={envoyerMessageClasse.bind(null, classe.id)} id="message-classe" placeholder="Un message pour toute la classe…" libelle="Envoyer à la classe" />
        </section>
      )}

      <div className="flex justify-end">
        <BoutonConfirmer
          action={supprimerClasse.bind(null, classe.id)}
          libelle="Supprimer la classe"
          confirmation="Les élèves restent, mais sans classe. Les projets ouverts et deadlines de la classe sont supprimés."
        />
      </div>
    </>
  );
}
