import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Apparition } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { difficultes, exercicesDuNiveau, idExercice, niveaux } from "@/contenu";
import type { Difficulte, Niveau } from "@/contenu/types";
import { bilanExercices, descriptionsDifficulte, duree, estNiveau, exercicesFaits, libellesGenre } from "@/lib/exercices";
import { utilisateurCourant } from "@/lib/session";

export const metadata: Metadata = { title: "Exercices" };

function Coche() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-vert-texte">
      <span className="grid size-5 place-items-center rounded-full bg-vert">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
      Réussi
    </span>
  );
}

export default async function ExercicesPage({ searchParams }: PageProps<"/exercices">) {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  const prof = u.profil.role === "prof";
  const { niveau: n, difficulte: diff } = await searchParams;

  // L'élève voit les exercices de son niveau ; le prof choisit le niveau à regarder.
  const nc = u.classe?.niveau;
  const niveauClasse = estNiveau(nc) ? nc : undefined;
  const niveau: Niveau | undefined = prof ? (estNiveau(n) ? n : "JV3") : niveauClasse;
  const filtre = difficultes.find((d) => d.id === diff)?.id as Difficulte | undefined;
  const faits = prof ? new Map<string, string>() : await exercicesFaits(u.id);

  const entete = (
    <Apparition className="flex flex-col gap-1.5">
      <h1 className="font-display text-[40px] font-extrabold tracking-tight">Exercices</h1>
      <span className="max-w-[64ch] text-[15px] text-muet">
        {prof
          ? "Les exercices bonus, tels que les élèves les voient. Ils ne sont pas obligatoires et ne comptent pas dans la progression des projets."
          : "Des exercices en plus pour t'entraîner, du plus facile au plus costaud. Ils ne sont pas obligatoires et ne comptent pas dans tes projets : fais-les à ton rythme."}
      </span>
    </Apparition>
  );

  if (!niveau) {
    return (
      <>
        {entete}
        <p className="carte p-8 text-[17px] text-encre-2">Tu n&apos;as pas encore de classe : ton prof doit t&apos;en attribuer une pour voir les exercices.</p>
      </>
    );
  }

  const liste = exercicesDuNiveau(niveau);
  const bilan = bilanExercices(niveau, faits);
  const techno = niveaux.find((x) => x.niveau === niveau)?.techno;
  const lien = (d?: Difficulte) => {
    const params = new URLSearchParams();
    if (prof) params.set("niveau", niveau);
    if (d) params.set("difficulte", d);
    const q = params.toString();
    return q ? `/exercices?${q}` : "/exercices";
  };
  const groupes = difficultes.filter((d) => !filtre || d.id === filtre);

  return (
    <>
      {entete}

      {prof && (
        <nav aria-label="Niveau" className="flex flex-wrap gap-2">
          {niveaux.map((x) => {
            const actif = x.niveau === niveau;
            return (
              <Link
                key={x.niveau}
                href={`/exercices?niveau=${x.niveau}`}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-11 flex-col justify-center rounded-xl border px-4 py-1.5 text-left transition-colors ${
                  actif ? "border-orange-fonce bg-orange-pale text-orange-texte" : "border-ligne-2 bg-white text-encre-2 hover:border-[#d9c3a5]"
                }`}
              >
                <b className="text-[15px]">{x.niveau}</b>
                <span className="text-[12.5px]">
                  {x.techno} · {exercicesDuNiveau(x.niveau).length} exos
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {liste.length === 0 ? (
        <p className="carte p-8 text-[17px] text-encre-2">
          Pas encore d&apos;exercices pour les {niveau} ({techno}). Ils arrivent bientôt.
        </p>
      ) : (
        <>
          <Apparition delai={0.04}>
            <nav aria-label="Difficulté" className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(5,minmax(0,1fr))]">
              <Link
                href={lien()}
                aria-current={!filtre ? "page" : undefined}
                className={`flex min-h-[64px] flex-col justify-center rounded-2xl border px-4 py-2 transition-colors ${
                  !filtre ? "border-encre bg-encre text-creme" : "border-ligne bg-white hover:border-[#d9c3a5]"
                }`}
              >
                <b className="text-[15px]">Tous</b>
                <span className={`text-[13px] tabular-nums ${!filtre ? "text-[#d9c3a5]" : "text-muet"}`}>
                  {prof ? `${liste.length} exercices` : `${bilan.reduce((s, b) => s + b.faits, 0)} / ${liste.length} réussis`}
                </span>
              </Link>
              {bilan.map((b) => {
                const actif = filtre === b.id;
                return (
                  <Link
                    key={b.id}
                    href={lien(b.id)}
                    aria-current={actif ? "page" : undefined}
                    className={`flex min-h-[64px] flex-col justify-center gap-1 rounded-2xl border px-4 py-2 transition-colors ${
                      actif ? "border-orange-fonce bg-orange-pale" : "border-ligne bg-white hover:border-[#d9c3a5]"
                    }`}
                  >
                    <span className="self-start">
                      <Pastille ton={b.ton}>{b.label}</Pastille>
                    </span>
                    <span className="text-[13px] text-muet tabular-nums">{prof ? `${b.total} exercices` : `${b.faits} / ${b.total} réussis`}</span>
                  </Link>
                );
              })}
            </nav>
          </Apparition>

          {groupes.map((d, i) => {
            const ceux = liste.filter((e) => e.difficulte === d.id);
            if (ceux.length === 0) return null;
            return (
              <Apparition key={d.id} delai={0.06 + i * 0.03} className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="titre-section">{d.label}</h2>
                  <span className="text-[14.5px] text-muet">{descriptionsDifficulte[d.id]}</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {ceux.map((e) => {
                    const id = idExercice(e);
                    const fait = faits.has(id);
                    return (
                      <Link
                        key={id}
                        href={`/exercices/${id}`}
                        className={`carte flex flex-col gap-2.5 p-5 transition-colors hover:border-[#e8b48a] ${fait ? "bg-[#fbfdf9]" : ""}`}
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <Pastille ton={d.ton}>{d.label}</Pastille>
                          <Pastille ton={e.genre === "bug" ? "rouge" : "neutre"}>{libellesGenre[e.genre]}</Pastille>
                        </span>
                        <b className="font-display text-[21px] leading-tight">{e.titre}</b>
                        <span className="text-[15px] leading-snug text-encre-2">{e.resume}</span>
                        <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1.5 text-[13px] text-muet">
                          <span>
                            {e.theme} · environ {duree(e.dureeMin)}
                          </span>
                          {fait && <Coche />}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </Apparition>
            );
          })}
        </>
      )}
    </>
  );
}
