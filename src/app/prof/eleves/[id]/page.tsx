import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerEleve } from "@/actions/prof";
import { BarreProgression } from "@/components/motion";
import { BoutonConfirmer, BoutonReinitialiser, FormulaireChangerClasse, FormulaireCorrection, FormulaireNotePrivee } from "@/components/prof/formulaires";
import { Pastille } from "@/components/ui";
import { idLecon, trouverQuestionLibre, trouverQuiz } from "@/contenu";
import { dateCourte, ilYa } from "@/lib/dates";
import { suiviEleve, toutesLesClasses } from "@/lib/donnees-prof";
import { cleDeadline, derniereActivite, moyenneQuiz, progressionModule, progressionProjet, statutEleve, statutLecon } from "@/lib/progression";

export const metadata: Metadata = { title: "Fiche élève" };

const libellesStatut = {
  retard: { texte: "en retard", ton: "rouge" },
  heure: { texte: "à l'heure", ton: "vert" },
  avance: { texte: "en avance", ton: "orange" },
  "pas-commence": { texte: "pas commencé", ton: "neutre" },
} as const;

export default async function FicheElevePage({ params }: PageProps<"/prof/eleves/[id]">) {
  const { id } = await params;
  const [suivi, classes] = await Promise.all([suiviEleve(id), toutesLesClasses()]);
  if (!suivi) notFound();
  const { profil, d, classe } = suivi;
  const statut = libellesStatut[statutEleve(d)];
  const activite = derniereActivite(d);
  const moyenne = moyenneQuiz(d);
  const reponses = [...d.reponses.values()].sort((a, b) => b.maj_le.localeCompare(a.maj_le));

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex gap-2 text-sm text-muet">
        {classe ? (
          <Link href={`/prof/classes/${classe.id}`} className="hover:text-encre">
            {classe.nom}
          </Link>
        ) : (
          <Link href="/prof/comptes" className="hover:text-encre">
            Comptes élèves
          </Link>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-encre">
          {profil.prenom} {profil.nom}
        </span>
      </nav>

      <section className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-[18px]">
          <span className="grid size-[72px] place-items-center rounded-full bg-sable font-display text-[26px] font-extrabold text-orange-texte">
            {`${profil.prenom[0] ?? ""}${profil.nom[0] ?? ""}`.toUpperCase()}
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-4xl font-extrabold">
              {profil.prenom} {profil.nom}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-encre-2">
              <Pastille ton={statut.ton}>{statut.texte}</Pastille>
              <span>{classe ? classe.nom : "sans classe"}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[13px]">{profil.identifiant}</span>
              <span aria-hidden="true">·</span>
              <span>{activite ? `actif ${ilYa(activite)}` : "jamais connecté au cours"}</span>
              {moyenne !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>quiz {moyenne.toFixed(1).replace(".", ",")} / 20</span>
                </>
              )}
            </div>
          </div>
        </div>
        <BoutonReinitialiser eleveId={profil.id} nom={`${profil.prenom} ${profil.nom}`} />
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-5">
          {d.projetsOuverts.length === 0 && <p className="carte p-6 text-encre-2">Aucun projet ouvert pour sa classe.</p>}
          {d.projetsOuverts.map(({ projet, regles }) => (
            <section key={projet.slug} className="carte flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{projet.titre}</h2>
                <span className="text-sm text-muet">{progressionProjet(d, projet, regles.seuil_validation)} % du projet</span>
              </div>
              {projet.modules
                .filter((m) => m.lecons.length > 0)
                .map((mod) => {
                  const pct = progressionModule(d, projet, mod, regles.seuil_validation);
                  const date = d.deadlines.get(cleDeadline(projet.slug, mod.slug));
                  const faites = mod.lecons.filter((l) => statutLecon(d, idLecon(projet.slug, mod.slug, l.slug)) === "fait").length;
                  const finale = d.meilleursScores.get(mod.quizFinal.id);
                  return (
                    <div key={mod.slug} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 text-[15px]">
                      <b>{mod.titre}</b>
                      <BarreProgression valeur={pct} className="h-[7px]" />
                      <span className={`text-right text-[13px] ${date && date < new Date().toISOString().slice(0, 10) && pct < 100 ? "font-semibold text-rouge-texte" : "text-muet"}`}>
                        {faites}/{mod.lecons.length} leçons
                        {finale ? ` · final ${finale.score}/${finale.total}` : ""}
                        {date ? ` · ${dateCourte(date)}` : ""}
                      </span>
                    </div>
                  );
                })}
            </section>
          ))}

          <section className="carte flex flex-col gap-3 p-6">
            <h2 className="font-display text-xl font-bold">Quiz</h2>
            {d.meilleursScores.size === 0 && <p className="text-[15px] text-muet">Aucun quiz pour l&apos;instant.</p>}
            <div className="flex flex-col text-[15px]">
              {[...d.meilleursScores.entries()].map(([quizId, s]) => {
                const q = trouverQuiz(quizId);
                return (
                  <div key={quizId} className="flex justify-between gap-3 border-b border-[#f6ede1] py-2.5 last:border-0">
                    <span>{q ? (q.lecon ? q.lecon.titre : `Quiz final · ${q.module.titre}`) : quizId}</span>
                    <span className="whitespace-nowrap tabular-nums">
                      <b>
                        {s.score} / {s.total}
                      </b>{" "}
                      <span className="text-muet">
                        · {s.tentatives} tentative{s.tentatives > 1 ? "s" : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="titre-section">Réponses libres</h2>
            {reponses.length === 0 && <p className="text-[15px] text-muet">Aucune réponse libre.</p>}
            {reponses.map((r) => {
              const q = trouverQuestionLibre(r.question_id);
              return (
                <article key={r.id} className="carte flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b>{q?.question.enonce ?? r.question_id}</b>
                    {r.corrige_le ? <Pastille ton="vert">{r.note} / 5</Pastille> : <Pastille ton="ambre">à corriger</Pastille>}
                  </div>
                  <p className="text-[15px] leading-relaxed text-encre-2">« {r.reponse} »</p>
                  {q && <p className="rounded-xl bg-creme-2 px-3.5 py-2.5 text-sm"><b>Attendu :</b> {q.question.attendus}</p>}
                  <FormulaireCorrection reponseId={r.id} noteInitiale={r.note} commentaireInitial={r.commentaire} />
                </article>
              );
            })}
          </section>
        </div>

        <aside className="flex flex-[1_1_300px] flex-col gap-5">
          <div className="carte flex flex-col gap-3 p-[22px]">
            <h2 className="font-display text-lg font-bold">Note privée</h2>
            <FormulaireNotePrivee eleveId={profil.id} note={profil.note_prof} />
          </div>
          <div className="carte flex flex-col gap-3 p-[22px]">
            <h2 className="font-display text-lg font-bold">Compte</h2>
            <FormulaireChangerClasse eleveId={profil.id} classes={classes.map((c) => c.classe)} actuelle={profil.classe_id} />
            <BoutonConfirmer
              action={supprimerEleve.bind(null, profil.id)}
              libelle="Supprimer ce compte"
              confirmation="Le compte, la progression et les notes de l'élève seront effacés définitivement."
            />
          </div>
        </aside>
      </div>
    </>
  );
}
