import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JoursRestants } from "@/components/jours-restants";
import { Apparition, BarreProgression } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { idLecon, trouverQuiz } from "@/contenu";
import { dateCourte } from "@/lib/dates";
import { cleDeadline, donneesEleve, leconAReprendre, progressionModule, progressionProjet, statutLecon } from "@/lib/progression";
import { utilisateurCourant } from "@/lib/session";

export const metadata: Metadata = { title: "Mon parcours" };

export default async function ParcoursPage() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  if (u.profil.role === "prof") redirect("/prof");
  const d = await donneesEleve(u);
  const reprise = leconAReprendre(d);

  // Prochaine échéance : le premier module pas terminé qui a une deadline à venir.
  let prochaine: { projetSlug: string; titreModule: string; slugModule: string; date: string; restantes: number } | undefined;
  for (const { projet, regles } of d.projetsOuverts) {
    for (const mod of projet.modules) {
      const date = d.deadlines.get(cleDeadline(projet.slug, mod.slug));
      if (!date || progressionModule(d, projet, mod, regles.seuil_validation) >= 100) continue;
      if (!prochaine || date < prochaine.date) {
        const restantes = mod.lecons.filter((l) => statutLecon(d, idLecon(projet.slug, mod.slug, l.slug)) !== "fait").length;
        prochaine = { projetSlug: projet.slug, titreModule: mod.titre, slugModule: mod.slug, date, restantes };
      }
    }
  }

  const derniersQuiz = d.tentatives.slice(0, 4).map((t) => {
    const q = trouverQuiz(t.quiz_id);
    const titre = q ? (q.lecon ? q.lecon.titre : `Quiz final · ${q.module.titre}`) : t.quiz_id;
    return { ...t, titre };
  });

  return (
    <>
      <Apparition className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">
          Salut {u.profil.prenom}, {reprise?.commencee ? "on reprend ?" : "prêt à commencer ?"}
        </h1>
      </Apparition>

      {d.projetsOuverts.length === 0 && (
        <div className="carte flex flex-col gap-2 p-8">
          <b className="font-display text-2xl">Aucun projet ouvert pour l&apos;instant</b>
          <p className="max-w-[60ch] text-[17px] text-encre-2">
            {u.classe
              ? "Ton prof n'a pas encore ouvert de projet pour ta classe. Reviens un peu plus tard."
              : "Ton compte n'est rattaché à aucune classe. Demande à ton prof de t'ajouter à la tienne."}
          </p>
        </div>
      )}

      {reprise && (
        <Apparition delai={0.05}>
          <section className="flex flex-wrap items-center justify-between gap-6 rounded-[22px] bg-encre p-8 text-creme">
            <div className="flex flex-[1_1_420px] flex-col gap-2.5">
              <span className="text-sm text-[#d9c6b0]">
                {reprise.projet.titre} · Module {reprise.projet.modules.indexOf(reprise.module) + 1} · {reprise.module.titre}
              </span>
              <h2 className="font-display text-[28px] font-bold">{reprise.lecon.titre}</h2>
              <span className="text-[15px] text-[#d9c6b0]">
                {reprise.commencee ? "Tu as commencé cette leçon, reprends-la où tu en étais." : `Prochaine leçon · ${reprise.lecon.dureeMin} min`}
              </span>
            </div>
            <Link
              href={`/projets/${reprise.projet.slug}/${reprise.module.slug}/${reprise.lecon.slug}`}
              className="btn btn-pri min-h-[52px] px-[26px] text-base"
            >
              {reprise.commencee ? "Reprendre la leçon" : "Commencer"}
            </Link>
          </section>
        </Apparition>
      )}

      {d.projetsOuverts.length > 0 && (
        <Apparition delai={0.1} className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
          {d.projetsOuverts.map(({ projet, regles }) => (
            <section key={projet.slug} className="carte flex flex-col gap-[18px] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="titre-section">{projet.titre}</h2>
                <span className="text-sm text-muet">{progressionProjet(d, projet, regles.seuil_validation)} % du projet</span>
              </div>
              <div className="flex flex-col gap-3.5">
                {projet.modules.map((mod, i) => {
                  const pct = progressionModule(d, projet, mod, regles.seuil_validation);
                  const date = d.deadlines.get(cleDeadline(projet.slug, mod.slug));
                  const enCours = pct > 0 && pct < 100;
                  return (
                    <div key={mod.slug} className="grid grid-cols-[32px_1fr_auto] items-center gap-3">
                      <span
                        className={`grid size-8 place-items-center rounded-[9px] font-bold ${
                          pct >= 100 ? "bg-vert text-white" : enCours ? "bg-orange text-white" : "bg-neutre text-muet"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold">{mod.titre}</span>
                        <BarreProgression valeur={pct} className="h-1.5" />
                      </div>
                      {date ? (
                        <Pastille ton={pct >= 100 ? "vert" : enCours ? "ambre" : "neutre"}>{pct >= 100 ? "validé" : dateCourte(date)}</Pastille>
                      ) : (
                        <span className="text-[13px] text-muet">{pct >= 100 ? "validé" : `${pct} %`}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link href={`/projets/${projet.slug}`} className="btn self-start">
                Voir le projet
              </Link>
            </section>
          ))}

          <section className="carte flex flex-col gap-4 p-6">
            <h2 className="titre-section">À venir</h2>
            {prochaine ? (
              <Link
                href={`/projets/${prochaine.projetSlug}/${prochaine.slugModule}`}
                className="flex flex-col gap-2 rounded-2xl bg-creme-2 px-4 py-3.5 hover:bg-sable"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-[15px]">{prochaine.titreModule}</b>
                  <JoursRestants iso={prochaine.date} />
                </span>
                <span className="text-[13px] text-muet">
                  Deadline le {dateCourte(prochaine.date)} ·{" "}
                  {prochaine.restantes > 0 ? `${prochaine.restantes} leçon${prochaine.restantes > 1 ? "s" : ""} à finir` : "il reste le quiz final"}
                </span>
              </Link>
            ) : (
              <p className="text-[15px] text-muet">Pas de deadline en vue. Avance à ton rythme.</p>
            )}

            <h3 className="mt-2 text-sm font-semibold tracking-wider text-muet uppercase">Derniers quiz</h3>
            {derniersQuiz.length > 0 ? (
              <div className="flex flex-col gap-2.5 text-[15px]">
                {derniersQuiz.map((t) => (
                  <div key={t.id} className="flex justify-between gap-3 border-b border-dashed border-ligne-2 pb-2.5 last:border-0">
                    <span>{t.titre}</span>
                    <b className="tabular-nums">
                      {t.score} / {t.total}
                    </b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-muet">Tu n&apos;as pas encore fait de quiz.</p>
            )}
          </section>
        </Apparition>
      )}
    </>
  );
}
