import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoursRestants } from "@/components/jours-restants";
import { Apparition, BarreProgression } from "@/components/motion";
import { idLecon, trouverModule } from "@/contenu";
import { accesProjet } from "@/lib/acces";
import { dateAvecJour } from "@/lib/dates";
import { cleDeadline, moduleVerrouille, progressionModule, quizValide, statutLecon, type StatutLecon } from "@/lib/progression";

export async function generateMetadata({ params }: PageProps<"/projets/[projet]/[module]">): Promise<Metadata> {
  const { projet, module } = await params;
  return { title: trouverModule(projet, module)?.module.titre };
}

const couleursTranches = ["#8C7158", "#C47A2C", "#BF500C", "#8A3A06", "#6B4E35", "#A85F1E", "#4A3A2C", "#9C6B3C", "#5E4836", "#D07A2E"];

function IconeStatut({ statut }: { statut: StatutLecon }) {
  if (statut === "fait") {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-vert">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
    );
  }
  if (statut === "en-cours") {
    return (
      <span className="grid size-7 place-items-center rounded-full border-[3px] border-orange">
        <span className="size-2.5 rounded-full bg-orange" />
      </span>
    );
  }
  return <span className="size-7 rounded-full border-2 border-[#d9c3a5]" />;
}

export default async function ModulePage({ params }: PageProps<"/projets/[projet]/[module]">) {
  const { projet: p, module: m } = await params;
  const trouve = trouverModule(p, m);
  if (!trouve) notFound();
  const { projet, module: mod } = trouve;
  const acces = await accesProjet(p);
  const d = acces.donnees;
  const seuil = acces.regles.seuil_validation;
  const index = projet.modules.indexOf(mod);
  const verrou = d ? moduleVerrouille(d, projet, index, acces.regles) : false;

  const base = `/projets/${p}/${m}`;
  const statut = (slug: string): StatutLecon => (d ? statutLecon(d, idLecon(p, m, slug)) : "a-faire");
  const aReprendre = mod.lecons.find((l) => statut(l.slug) === "en-cours") ?? mod.lecons.find((l) => statut(l.slug) === "a-faire");
  const pct = d ? progressionModule(d, projet, mod, seuil) : 0;
  const deadline = d?.deadlines.get(cleDeadline(p, m));
  const scoreFinal = d?.meilleursScores.get(mod.quizFinal.id);
  const finalValide = d ? quizValide(d, mod.quizFinal.id, seuil) : false;
  const precedent = projet.modules[index - 1];

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-sm text-muet">
        <Link href="/projets" className="hover:text-encre">
          Mes projets
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/projets/${p}`} className="hover:text-encre">
          {projet.titre}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-encre">
          {index + 1}. {mod.titre}
        </span>
      </nav>

      <Apparition className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-[1_1_460px] flex-col gap-2.5">
          <span className="text-sm font-semibold text-muet">
            Module {index + 1} sur {projet.modules.length}
          </span>
          <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight md:text-[46px]">{mod.titre}</h1>
          {mod.intro && <p className="max-w-[62ch] text-[17px] leading-relaxed text-encre-2">{mod.intro}</p>}
        </div>
        {!verrou && aReprendre && (
          <Link href={`${base}/${aReprendre.slug}`} className="btn btn-pri min-h-[50px] px-6">
            {statut(aReprendre.slug) === "en-cours" ? "Continuer" : "Commencer"} : {aReprendre.titre}
          </Link>
        )}
      </Apparition>

      {verrou && (
        <p className="carte p-6 text-[17px] text-encre-2">
          Ce module s&apos;ouvrira quand tu auras validé le module précédent
          {precedent && (
            <>
              {" "}
              (
              <Link href={`/projets/${p}/${precedent.slug}`} className="font-semibold text-orange-fonce underline">
                {precedent.titre}
              </Link>
              )
            </>
          )}
          .
        </p>
      )}

      {mod.carte && mod.carte.tranches.length > 0 && (
        <Apparition delai={0.05}>
          <section className="carte flex flex-col gap-3.5 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Carte de {mod.carte.fichier}</h2>
              <span className="font-mono text-sm text-muet">{mod.carte.lignes} lignes</span>
            </div>
            <div className="flex h-11 gap-[3px] overflow-hidden rounded-xl">
              {mod.carte.tranches.map((t, i) => {
                const numeroLecon = mod.lecons.findIndex((l) => l.slug === t.lecon);
                const numero = numeroLecon >= 0 ? `${index + 1}.${numeroLecon + 1}` : "";
                const style = { flex: t.fin - t.debut + 1, background: couleursTranches[i % couleursTranches.length] };
                const titre = `${t.label} · lignes ${t.debut} à ${t.fin}`;
                const classes = "grid min-w-0 place-items-center overflow-hidden text-[12.5px] font-semibold text-white";
                return numeroLecon >= 0 && !verrou ? (
                  <Link key={i} href={`${base}/${t.lecon}`} className={`${classes} hover:brightness-110`} style={style} title={titre} aria-label={titre}>
                    <span className="truncate px-1">{numero}</span>
                  </Link>
                ) : (
                  <span key={i} className={classes} style={style} title={titre}>
                    <span className="truncate px-1">{numero}</span>
                  </span>
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-xs text-muet" aria-hidden="true">
              <span>ligne 1</span>
              <span>ligne {mod.carte.lignes}</span>
            </div>
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-1.5 text-[13px] text-encre-2">
              {mod.carte.tranches.map((t, i) => {
                const numeroLecon = mod.lecons.findIndex((l) => l.slug === t.lecon);
                return (
                  <li key={i} className="flex min-w-0 items-center gap-2">
                    <i className="inline-block size-2.5 shrink-0 rounded-[3px]" style={{ background: couleursTranches[i % couleursTranches.length] }} />
                    <span className="truncate" title={t.label}>
                      {numeroLecon >= 0 && <b className="mr-1 tabular-nums">{index + 1}.{numeroLecon + 1}</b>}
                      {t.label}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muet">
                      {t.debut}-{t.fin}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </Apparition>
      )}

      <Apparition delai={0.1} className="flex flex-col gap-5">
        {d && (
          <section className="carte flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
            <div className="flex min-w-[220px] flex-1 flex-col gap-2">
              <span className="text-sm text-encre-2">{pct >= 100 ? "Module validé, bravo." : `Tu as fait ${pct} % du module.`}</span>
              <BarreProgression valeur={pct} className="h-2" />
            </div>
            {deadline && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[13px] font-semibold tracking-wider text-muet uppercase">Deadline</span>
                <b className="font-display text-xl first-letter:uppercase">{dateAvecJour(deadline)}</b>
                {pct < 100 && <JoursRestants iso={deadline} />}
              </div>
            )}
          </section>
        )}
        <section className="carte flex min-w-0 flex-col gap-0.5 p-3.5">
          <h2 className="mx-4 mt-2 mb-2.5 font-display text-xl font-bold">Leçons</h2>
          {mod.lecons.map((lecon, i) => {
            const s = statut(lecon.slug);
            const score = lecon.quiz && d?.meilleursScores.get(lecon.quiz.id);
            const ligne = (
              <>
                <IconeStatut statut={s} />
                <span className="flex flex-col">
                  <b className="text-base">
                    {index + 1}.{i + 1} {lecon.titre}
                  </b>
                  <span className="text-[13px] text-muet">{lecon.resume}</span>
                </span>
                <span
                  className={`text-right text-[13px] whitespace-nowrap ${
                    s === "fait" ? "font-semibold text-vert-texte" : s === "en-cours" ? "font-semibold text-orange-texte" : "text-muet"
                  }`}
                >
                  {score ? `quiz ${score.score}/${score.total}` : s === "en-cours" ? "en cours" : `${lecon.dureeMin} min`}
                </span>
              </>
            );
            const classes = `grid min-h-14 grid-cols-[32px_1fr_auto] items-center gap-3.5 rounded-2xl px-4 py-2.5 ${s === "en-cours" ? "bg-creme-2" : ""}`;
            return verrou ? (
              <div key={lecon.slug} className={`${classes} opacity-60`}>
                {ligne}
              </div>
            ) : (
              <Link key={lecon.slug} href={`${base}/${lecon.slug}`} className={`${classes} transition-colors hover:bg-creme-2`}>
                {ligne}
              </Link>
            );
          })}
          {mod.quizFinal.questions.length > 0 && (
            <Link
              href={verrou ? base : `${base}/quiz-final`}
              aria-disabled={verrou}
              className="mt-1.5 grid min-h-14 grid-cols-[32px_1fr_auto] items-center gap-3.5 rounded-b-2xl border-t border-dashed border-ligne-2 px-4 py-2.5 hover:bg-creme-2"
            >
              <span className={`grid size-7 place-items-center rounded-lg font-bold ${finalValide ? "bg-vert text-white" : "bg-orange-pale text-orange-texte"}`}>
                ?
              </span>
              <span className="flex flex-col">
                <b className="text-base">Quiz final du module</b>
                <span className="text-[13px] text-muet">
                  {mod.quizFinal.questions.length} questions · {seuil} % pour valider le module
                </span>
              </span>
              <span className={`text-[13px] ${finalValide ? "font-semibold text-vert-texte" : "text-muet"}`}>
                {scoreFinal ? `${scoreFinal.score}/${scoreFinal.total}` : "à faire"}
              </span>
            </Link>
          )}
        </section>

      </Apparition>
    </>
  );
}
