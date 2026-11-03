import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { envoyerMessage } from "@/actions/prof";
import { BarreProgression } from "@/components/motion";
import { FormulaireCorrection, FormulaireMessage, FormulaireNotePrivee } from "@/components/prof/formulaires";
import { ModaleEleve } from "@/components/prof/modale-eleve";
import { Pastille } from "@/components/ui";
import { idLecon, trouverQuestionLibre, trouverQuiz } from "@/contenu";
import { dateCourte, ilYa } from "@/lib/dates";
import { suiviEleve, toutesLesClasses } from "@/lib/donnees-prof";
import { cleDeadline, derniereActivite, moyenneQuiz, progressionModule, progressionProjet, statutEleve, statutLecon } from "@/lib/progression";
import { supabaseServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = { title: "Fiche élève" };

const libellesStatut = {
  retard: { texte: "en retard", ton: "rouge" },
  heure: { texte: "à l'heure", ton: "vert" },
  avance: { texte: "en avance", ton: "orange" },
  "pas-commence": { texte: "pas commencé", ton: "neutre" },
} as const;

export default async function FicheElevePage({ params }: PageProps<"/prof/eleves/[id]">) {
  const { id } = await params;
  const supabase = await supabaseServeur();
  const [suivi, classes, { data: messages }] = await Promise.all([
    suiviEleve(id),
    toutesLesClasses(),
    supabase.from("messages").select("*").eq("eleve_id", id).order("created_at", { ascending: false }).limit(5),
  ]);
  if (!suivi) notFound();
  const { profil, d, classe } = suivi;
  const statut = libellesStatut[statutEleve(d)];
  const activite = derniereActivite(d);
  const moyenne = moyenneQuiz(d);
  const reponses = [...d.reponses.values()].sort((a, b) => b.maj_le.localeCompare(a.maj_le));
  const aujourdhui = new Date().toISOString().slice(0, 10);

  // Chiffres clés, sur le premier projet ouvert pour sa classe
  const premier = d.projetsOuverts[0];
  const pctProjet = premier ? progressionProjet(d, premier.projet, premier.regles.seuil_validation) : null;
  const toutesLecons = d.projetsOuverts.flatMap(({ projet }) => projet.modules.flatMap((m) => m.lecons.map((l) => idLecon(projet.slug, m.slug, l.slug))));
  const faites = toutesLecons.filter((l) => d.progression.get(l)?.termine).length;

  const chiffres = [
    { valeur: pctProjet === null ? "–" : `${pctProjet} %`, label: premier ? `du projet ${premier.projet.titre}` : "aucun projet ouvert" },
    { valeur: `${faites} / ${toutesLecons.length}`, label: "leçons terminées" },
    { valeur: moyenne === null ? "–" : `${moyenne.toFixed(1).replace(".", ",")}`, label: "moyenne des quiz sur 20" },
    { valeur: activite ? ilYa(activite) : "jamais", label: "dernière activité" },
  ];

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
        <div className="flex min-w-0 items-center gap-[18px]">
          <span className="grid size-[68px] shrink-0 place-items-center rounded-full bg-sable font-display text-[24px] font-extrabold text-orange-texte">
            {`${profil.prenom[0] ?? ""}${profil.nom[0] ?? ""}`.toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="font-display text-[34px] leading-tight font-extrabold">
              {profil.prenom} {profil.nom}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-encre-2">
              <Pastille ton={statut.ton}>{statut.texte}</Pastille>
              <span>{classe ? classe.nom : "sans classe"}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate font-mono text-[13px]">{profil.identifiant}</span>
            </div>
          </div>
        </div>
        <ModaleEleve
          variante="bouton"
          eleve={{ id: profil.id, prenom: profil.prenom, nom: profil.nom, email: profil.identifiant, classeId: profil.classe_id }}
          classes={classes.map((c) => c.classe)}
        />
      </section>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {chiffres.map((c) => (
          <div key={c.label} className="carte flex flex-col gap-0.5 px-5 py-4">
            <b className="font-display text-[26px] leading-tight tabular-nums">{c.valeur}</b>
            <span className="text-[13.5px] text-muet">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {d.projetsOuverts.length === 0 && <p className="carte p-6 text-encre-2">Aucun projet ouvert pour sa classe.</p>}
          {d.projetsOuverts.map(({ projet, regles }) => (
            <section key={projet.slug} className="carte flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-bold">Progression · {projet.titre}</h2>
                <span className="text-sm text-muet">{progressionProjet(d, projet, regles.seuil_validation)} % du projet</span>
              </div>
              <div className="flex flex-col gap-3">
                {projet.modules
                  .filter((m) => m.lecons.length > 0)
                  .map((mod) => {
                    const pct = progressionModule(d, projet, mod, regles.seuil_validation);
                    const date = d.deadlines.get(cleDeadline(projet.slug, mod.slug));
                    const nbFaites = mod.lecons.filter((l) => statutLecon(d, idLecon(projet.slug, mod.slug, l.slug)) === "fait").length;
                    const finale = d.meilleursScores.get(mod.quizFinal.id);
                    const enRetard = Boolean(date && date < aujourdhui && pct < 100);
                    return (
                      <div key={mod.slug} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-4 text-[15px]">
                        <span className="truncate font-semibold">{mod.titre}</span>
                        <BarreProgression valeur={pct} className="h-[7px]" />
                        <span className={`text-right text-[13px] whitespace-nowrap tabular-nums ${enRetard ? "font-semibold text-rouge-texte" : "text-muet"}`}>
                          {nbFaites}/{mod.lecons.length} leçons
                          {finale ? ` · final ${finale.score}/${finale.total}` : ""}
                          {date ? ` · ${dateCourte(date)}` : ""}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}

          <section className="carte flex flex-col gap-2 p-6">
            <h2 className="font-display text-xl font-bold">Quiz</h2>
            {d.meilleursScores.size === 0 ? (
              <p className="text-[15px] text-muet">Aucun quiz pour l&apos;instant.</p>
            ) : (
              <div className="flex flex-col text-[15px]">
                {[...d.meilleursScores.entries()].map(([quizId, s]) => {
                  const q = trouverQuiz(quizId);
                  return (
                    <div key={quizId} className="flex justify-between gap-3 border-b border-[#f6ede1] py-2.5 last:border-0">
                      <span className="min-w-0 truncate">{q ? (q.lecon ? q.lecon.titre : `Quiz final · ${q.module.titre}`) : quizId}</span>
                      <span className="whitespace-nowrap tabular-nums">
                        <b>
                          {s.score} / {s.total}
                        </b>{" "}
                        <span className="text-muet">
                          · {s.tentatives} essai{s.tentatives > 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="carte flex flex-col gap-3 p-[22px]">
            <h2 className="font-display text-lg font-bold">Envoyer un message</h2>
            <p className="-mt-1 text-[13.5px] text-muet">Il s&apos;affiche en bandeau en haut de son écran, tout de suite s&apos;il est connecté.</p>
            <FormulaireMessage action={envoyerMessage.bind(null, profil.id)} id="message-eleve" placeholder={`Un mot pour ${profil.prenom}…`} />
            {(messages ?? []).length > 0 && (
              <ul className="mt-1 flex flex-col gap-2 border-t border-ligne pt-3">
                {(messages ?? []).map((m) => (
                  <li key={m.id} className="flex flex-col gap-0.5 text-sm">
                    <span className="break-words text-encre">{m.texte}</span>
                    <span className="text-xs text-muet">
                      {ilYa(m.created_at)} · {m.lu_le ? <span className="font-semibold text-vert-texte">lu</span> : "pas encore lu"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="carte flex flex-col gap-3 p-[22px]">
            <h2 className="font-display text-lg font-bold">Note privée</h2>
            <FormulaireNotePrivee eleveId={profil.id} note={profil.note_prof} />
          </section>
        </aside>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="titre-section">Réponses libres</h2>
        {reponses.length === 0 ? (
          <p className="carte p-6 text-[15px] text-muet">Aucune réponse libre pour l&apos;instant.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {reponses.map((r) => {
              const q = trouverQuestionLibre(r.question_id);
              return (
                <article key={r.id} className="carte flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <b className="min-w-0 flex-1">{q?.question.enonce ?? r.question_id}</b>
                    {r.corrige_le ? <Pastille ton="vert">{r.note} / 5</Pastille> : <Pastille ton="ambre">à corriger</Pastille>}
                  </div>
                  <p className="text-[15px] leading-relaxed text-encre-2">« {r.reponse} »</p>
                  {q && (
                    <p className="rounded-xl bg-creme-2 px-3.5 py-2.5 text-sm">
                      <b>Attendu :</b> {q.question.attendus}
                    </p>
                  )}
                  <FormulaireCorrection reponseId={r.id} noteInitiale={r.note} commentaireInitial={r.commentaire} />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
