import type { Metadata } from "next";
import Link from "next/link";
import { BarreProgression } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { trouverLecon, trouverProjet, trouverQuiz } from "@/contenu";
import { dateCourte, ilYa } from "@/lib/dates";
import { activiteRecente, reponsesACorriger, suiviClasse, toutesLesClasses } from "@/lib/donnees-prof";
import { progressionProjet, statutEleve } from "@/lib/progression";
import { exigerProf } from "@/lib/session";

export const metadata: Metadata = { title: "Espace prof" };

export default async function AccueilProf() {
  const u = await exigerProf();
  const [classes, aCorriger, activite] = await Promise.all([toutesLesClasses(), reponsesACorriger(), activiteRecente()]);
  const suivis = await Promise.all(classes.map((c) => suiviClasse(c.classe.id)));
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const cartes = classes.map((c, i) => {
    const s = suivis[i];
    const eleves = s?.eleves ?? [];
    const enRetard = eleves.filter((e) => statutEleve(e.d, aujourdhui) === "retard").length;
    const projet = c.projets[0] ? trouverProjet(c.projets[0].projet_slug) : undefined;
    const moyenne =
      projet && eleves.length > 0
        ? Math.round(eleves.reduce((n, e) => n + progressionProjet(e.d, projet, c.projets[0].seuil_validation), 0) / eleves.length)
        : null;
    const prochaineDeadline = (s?.deadlines ?? []).map((d) => d.date).filter((d) => d >= aujourdhui).sort()[0];
    return { ...c, projet, moyenne, enRetard, prochaineDeadline };
  });
  const totalRetard = cartes.reduce((n, c) => n + c.enRetard, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Bonjour {u.profil.prenom}</h1>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/prof/comptes" className="btn">
            Créer des comptes
          </Link>
          <Link href="/prof/projets" className="btn btn-pri">
            Ouvrir un projet
          </Link>
        </div>
      </div>

      {classes.length === 0 ? (
        <section className="carte flex flex-col items-start gap-3 p-8">
          <b className="font-display text-2xl">Pour commencer</b>
          <ol className="list-decimal space-y-1.5 pl-5 text-[16px] text-encre-2">
            <li>Crée tes classes (JV1, JV2, JV3) dans « Classes et suivi ».</li>
            <li>Crée les comptes des élèves, un par un ou en collant une liste.</li>
            <li>Ouvre un projet pour une classe et fixe les deadlines de chaque module.</li>
          </ol>
          <Link href="/prof/classes" className="btn btn-pri mt-2">
            Créer une classe
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {cartes.map((c) => (
            <Link
              key={c.classe.id}
              href={`/prof/classes/${c.classe.id}`}
              className={`carte flex flex-col gap-3 p-[22px] transition-colors hover:border-[#e8b48a] ${c.enRetard > 0 ? "border-[#e8b48a]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <b className="font-display text-[28px]">{c.classe.nom}</b>
                <span className="text-sm text-muet">
                  {c.nbEleves} élève{c.nbEleves > 1 ? "s" : ""} · {c.classe.annee}
                </span>
              </div>
              <span className="text-[15px]">{c.projet ? c.projet.titre : "Aucun projet ouvert"}</span>
              {c.moyenne !== null && <BarreProgression valeur={c.moyenne} />}
              <div className="flex flex-wrap gap-2">
                {c.moyenne !== null && <Pastille ton="neutre">{c.moyenne} % en moyenne</Pastille>}
                {c.enRetard > 0 ? <Pastille ton="rouge">{c.enRetard} en retard</Pastille> : c.nbEleves > 0 && <Pastille ton="vert">personne en retard</Pastille>}
                {c.prochaineDeadline && <Pastille ton="ambre">deadline {dateCourte(c.prochaineDeadline)}</Pastille>}
              </div>
            </Link>
          ))}
        </section>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <section className="carte flex flex-[1_1_360px] flex-col gap-3 p-6">
          <h2 className="mb-1 font-display text-xl font-bold">À faire</h2>
          <Link
            href="/prof/corrections"
            className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl bg-creme-2 px-4 hover:bg-sable"
          >
            <span>
              <b>
                {aCorriger.length} réponse{aCorriger.length > 1 ? "s" : ""} libre{aCorriger.length > 1 ? "s" : ""}
              </b>{" "}
              à corriger
            </span>
            <span className="font-semibold text-orange-fonce">Corriger</span>
          </Link>
          <Link href="/prof/classes" className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-ligne px-4 hover:bg-creme-2">
            <span>
              <b>
                {totalRetard} élève{totalRetard > 1 ? "s" : ""}
              </b>{" "}
              en retard sur une deadline
            </span>
            <span className="font-semibold text-orange-fonce">Voir</span>
          </Link>
        </section>

        <section className="carte flex flex-[1_1_360px] flex-col gap-3.5 p-6">
          <h2 className="font-display text-xl font-bold">Activité récente</h2>
          {activite.length === 0 && <p className="text-[15px] text-muet">Aucune activité pour l&apos;instant.</p>}
          <div className="flex flex-col gap-3 text-[14.5px]">
            {activite.map((a, i) => {
              let quoi = "";
              if (a.type === "quiz") {
                const q = trouverQuiz(a.id);
                quoi = `a eu ${a.score} au quiz ${q?.lecon ? q.lecon.titre : `final · ${q?.module.titre ?? ""}`}`;
              } else {
                const [p, m, l] = a.id.split("/");
                quoi = `a fini la leçon ${trouverLecon(p, m, l)?.lecon.titre ?? ""}`;
              }
              return (
                <div key={i} className="flex justify-between gap-3">
                  <span>
                    <Link href={`/prof/eleves/${a.eleveId}`} className="font-bold hover:underline">
                      {a.qui}
                    </Link>{" "}
                    {quoi}
                  </span>
                  <span className="whitespace-nowrap text-muet">{ilYa(a.quand)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
