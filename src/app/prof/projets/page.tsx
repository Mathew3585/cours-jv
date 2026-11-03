import type { Metadata } from "next";
import Link from "next/link";
import { fermerProjetClasse } from "@/actions/prof";
import { BoutonConfirmer, FormulaireProjetClasse } from "@/components/prof/formulaires";
import { Pastille } from "@/components/ui";
import { nombreDeQuiz, projets, trouverProjet } from "@/contenu";
import { toutesLesClasses } from "@/lib/donnees-prof";
import { supabaseServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = { title: "Projets et deadlines" };

export default async function ProjetsProfPage({ searchParams }: PageProps<"/prof/projets">) {
  const sp = await searchParams;
  const projet = trouverProjet(typeof sp.projet === "string" ? sp.projet : "") ?? projets[0];
  const classes = await toutesLesClasses();
  const classeChoisie = classes.find((c) => c.classe.id === sp.classe) ?? classes.find((c) => c.classe.niveau === projet?.niveau) ?? classes[0];

  const supabase = await supabaseServeur();
  const { data: deadlines } = classeChoisie
    ? await supabase.from("deadlines").select("*").eq("classe_id", classeChoisie.classe.id).eq("projet_slug", projet.slug)
    : { data: [] };
  const regles = classeChoisie?.projets.find((p) => p.projet_slug === projet.slug);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Projets et deadlines</h1>
        <span className="max-w-[70ch] text-[15px] text-muet">
          Les cours viennent du dossier contenu/ du site, écrits avec Claude. Ici, tu choisis quelle classe y a accès, à partir de quand, et les deadlines
          de chaque module.
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <section aria-label="Bibliothèque de projets" className="flex flex-[1_1_280px] flex-col gap-2.5">
          {projets.map((p) => {
            const ouvertPour = classes.filter((c) => c.projets.some((x) => x.projet_slug === p.slug)).map((c) => c.classe.nom);
            const actif = p.slug === projet.slug;
            return (
              <Link
                key={p.slug}
                href={`/prof/projets?projet=${p.slug}${classeChoisie ? `&classe=${classeChoisie.classe.id}` : ""}`}
                aria-current={actif ? "page" : undefined}
                className={`flex flex-col gap-1.5 rounded-2xl border bg-white px-[18px] py-4 ${actif ? "border-[1.5px] border-orange bg-creme-2" : "border-ligne hover:border-[#e8b48a]"}`}
              >
                <span className="flex items-center justify-between gap-2.5">
                  <b className="text-[17px]">{p.titre}</b>
                  <Pastille ton={ouvertPour.length ? "vert" : "neutre"}>{ouvertPour.length ? `ouvert · ${ouvertPour.join(", ")}` : "fermé"}</Pastille>
                </span>
                <span className="text-[13.5px] text-muet">
                  {p.niveau} · {p.modules.length} modules · {p.modules.reduce((n, m) => n + m.lecons.length, 0)} leçons · {nombreDeQuiz(p)} quiz
                </span>
              </Link>
            );
          })}
        </section>

        <section className="carte flex min-w-0 flex-[999_1_520px] flex-col gap-5 p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[26px] font-bold">{projet.titre}</h2>
            <Link href={`/projets/${projet.slug}`} className="btn">
              Voir comme un élève
            </Link>
          </div>

          {classes.length === 0 ? (
            <p className="text-encre-2">
              Crée d&apos;abord une classe dans{" "}
              <Link href="/prof/classes" className="font-semibold text-orange-fonce underline">
                Classes et suivi
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Classe">
                {classes.map((c) => {
                  const actif = c.classe.id === classeChoisie?.classe.id;
                  const ouvert = c.projets.some((x) => x.projet_slug === projet.slug);
                  return (
                    <Link
                      key={c.classe.id}
                      href={`/prof/projets?projet=${projet.slug}&classe=${c.classe.id}`}
                      aria-current={actif ? "page" : undefined}
                      className={`btn min-h-10 ${actif ? "border-encre bg-encre text-creme hover:border-encre hover:text-creme" : ""}`}
                    >
                      {c.classe.nom}
                      {ouvert && <span className={`size-2 rounded-full ${actif ? "bg-[#b7d88b]" : "bg-vert"}`} aria-label="projet ouvert" />}
                    </Link>
                  );
                })}
              </div>

              {classeChoisie && (
                <>
                  <p className="text-[15px] text-encre-2">
                    {regles
                      ? `Ouvert pour ${classeChoisie.classe.nom} : les ${classeChoisie.nbEleves} élèves voient ce projet.`
                      : `Pas encore ouvert pour ${classeChoisie.classe.nom}. Règle les deadlines puis ouvre-le.`}
                  </p>
                  <FormulaireProjetClasse
                    key={`${projet.slug}-${classeChoisie.classe.id}`}
                    projetSlug={projet.slug}
                    classeId={classeChoisie.classe.id}
                    ouvert={Boolean(regles)}
                    modules={projet.modules.map((m) => ({
                      slug: m.slug,
                      titre: m.titre,
                      date: deadlines?.find((dl) => dl.module_slug === m.slug)?.date ?? "",
                    }))}
                    regles={{
                      ouvert_le: regles?.ouvert_le ?? new Date().toISOString().slice(0, 10),
                      deblocage_progressif: regles?.deblocage_progressif ?? false,
                      seuil_validation: regles?.seuil_validation ?? 70,
                      notes_visibles: regles?.notes_visibles ?? true,
                    }}
                  />
                  {regles && (
                    <div className="flex justify-end">
                      <BoutonConfirmer
                        action={fermerProjetClasse.bind(null, projet.slug, classeChoisie.classe.id)}
                        libelle="Fermer le projet pour cette classe"
                        confirmation="Les élèves ne verront plus le projet. Leur progression est gardée si tu le rouvres."
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
