import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Apparition, BarreProgression } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { idLecon, nombreDeQuiz, trouverProjet } from "@/contenu";
import { accesProjet } from "@/lib/acces";
import { dateCourte } from "@/lib/dates";
import { cleDeadline, moduleVerrouille, progressionModule, progressionProjet, statutLecon } from "@/lib/progression";

export async function generateMetadata({ params }: PageProps<"/projets/[projet]">): Promise<Metadata> {
  const { projet } = await params;
  return { title: trouverProjet(projet)?.titre };
}

export default async function ProjetPage({ params }: PageProps<"/projets/[projet]">) {
  const { projet: slug } = await params;
  const projet = trouverProjet(slug);
  if (!projet) notFound();
  const acces = await accesProjet(slug);
  const d = acces.donnees;
  const seuil = acces.regles.seuil_validation;

  const nbLecons = projet.modules.reduce((n, m) => n + m.lecons.length, 0);
  const pctProjet = d ? progressionProjet(d, projet, seuil) : null;

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-sm text-muet">
        <Link href="/projets" className="hover:text-encre">
          Mes projets
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-encre">{projet.titre}</span>
      </nav>

      <Apparition className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex flex-[1_1_460px] flex-col gap-3">
          <span className="self-start">
            <Pastille ton="orange">
              {projet.niveau} · {projet.techno}
            </Pastille>
          </span>
          <h1 className="font-display text-[48px] leading-none font-extrabold tracking-tight md:text-[56px]">{projet.titre}</h1>
          <p className="max-w-[60ch] text-[17px] leading-relaxed text-encre-2">{projet.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            ...(pctProjet !== null ? [[`${pctProjet} %`, "terminé"]] : []),
            [String(nbLecons), "leçons"],
            [String(nombreDeQuiz(projet)), "quiz"],
          ].map(([valeur, label]) => (
            <div key={label} className="flex min-w-[110px] flex-col rounded-2xl border border-ligne bg-white px-[18px] py-3.5">
              <b className="font-display text-[28px] tabular-nums">{valeur}</b>
              <span className="text-[13px] text-muet">{label}</span>
            </div>
          ))}
        </div>
      </Apparition>

      <Apparition delai={0.05} className="flex flex-col gap-3">
        <h2 className="titre-section mb-1">Les modules</h2>
        {projet.modules.map((mod, i) => {
          const pct = d ? progressionModule(d, projet, mod, seuil) : 0;
          const verrou = d ? moduleVerrouille(d, projet, i, acces.regles) : false;
          const date = d?.deadlines.get(cleDeadline(projet.slug, mod.slug));
          const faites = d ? mod.lecons.filter((l) => statutLecon(d, idLecon(projet.slug, mod.slug, l.slug)) === "fait").length : 0;
          const actif = pct > 0 && pct < 100;
          const vide = mod.lecons.length === 0;

          const contenu = (
            <>
              <span
                className={`grid size-14 place-items-center rounded-2xl font-display text-2xl font-extrabold ${
                  pct >= 100 ? "bg-vert text-white" : actif ? "bg-orange text-white" : "bg-neutre text-muet"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-2">
                <span className="flex flex-wrap items-center gap-2.5">
                  <b className="text-[19px]">{mod.titre}</b>
                  {actif && <Pastille ton="orange">en cours</Pastille>}
                  {pct >= 100 && <Pastille ton="vert">validé</Pastille>}
                  {verrou && <Pastille>verrouillé</Pastille>}
                </span>
                <span className="text-sm text-muet">
                  {mod.resume}
                  {!vide && ` · ${mod.lecons.length} leçons`}
                </span>
                {d && !vide && <BarreProgression valeur={pct} className="h-1.5 max-w-[420px]" />}
              </span>
              <span className="flex flex-col items-end gap-1">
                {date && <Pastille ton={actif ? "ambre" : "neutre"}>{`deadline ${dateCourte(date)}`}</Pastille>}
                <span className="text-[13px] text-muet">{vide ? "bientôt" : d ? `${faites} / ${mod.lecons.length} leçons` : ""}</span>
              </span>
            </>
          );
          const classes = `grid grid-cols-[56px_1fr_auto] items-center gap-[18px] rounded-[18px] border bg-white px-[22px] py-5 ${
            actif ? "border-[#e8b48a] shadow-[0_10px_30px_-18px_rgba(191,80,12,0.45)]" : "border-ligne"
          }`;
          return vide ? (
            <div key={mod.slug} className={`${classes} opacity-70`}>
              {contenu}
            </div>
          ) : (
            <Link key={mod.slug} href={`/projets/${projet.slug}/${mod.slug}`} className={`${classes} transition-colors hover:border-[#e8b48a]`}>
              {contenu}
            </Link>
          );
        })}
      </Apparition>

      <Apparition delai={0.1}>
        <section className="carte flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="titre-section">Les fichiers du projet</h2>
            <span className="text-sm text-muet">Chaque fichier est expliqué dans le module indiqué</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[12.5px] tracking-wider text-muet uppercase">
                  {["Fichier", "Rôle", "Module"].map((h) => (
                    <th key={h} className="border-b border-ligne px-3 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projet.fichiers.map((f) => {
                  const mod = projet.modules.find((m) => m.slug === f.module);
                  return (
                    <tr key={f.nom} className="border-b border-[#f6ede1] last:border-0">
                      <td className="px-3 py-3 font-mono text-[13px]">{f.nom}</td>
                      <td className="px-3 py-3">{f.role}</td>
                      <td className="px-3 py-3">{mod ? `${projet.modules.indexOf(mod) + 1}. ${mod.titre}` : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </Apparition>
    </>
  );
}
