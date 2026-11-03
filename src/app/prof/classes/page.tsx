import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireClasse } from "@/components/prof/formulaires";
import { Pastille } from "@/components/ui";
import { trouverProjet } from "@/contenu";
import { toutesLesClasses } from "@/lib/donnees-prof";

export const metadata: Metadata = { title: "Classes" };

export default async function ClassesPage() {
  const classes = await toutesLesClasses();
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Classes et suivi</h1>
        <span className="text-[15px] text-muet">Choisis une classe pour voir où en est chaque élève.</span>
      </div>

      {classes.length > 0 && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {classes.map(({ classe, nbEleves, projets }) => (
            <Link key={classe.id} href={`/prof/classes/${classe.id}`} className="carte flex flex-col gap-2.5 p-[22px] transition-colors hover:border-[#e8b48a]">
              <div className="flex items-center justify-between gap-2">
                <b className="font-display text-[26px]">{classe.nom}</b>
                <Pastille ton="orange">{classe.niveau}</Pastille>
              </div>
              <span className="text-sm text-muet">
                {classe.annee} · {nbEleves} élève{nbEleves > 1 ? "s" : ""}
              </span>
              <span className="text-[15px]">
                {projets.length > 0 ? projets.map((p) => trouverProjet(p.projet_slug)?.titre ?? p.projet_slug).join(", ") : "Aucun projet ouvert"}
              </span>
            </Link>
          ))}
        </section>
      )}

      <FormulaireClasse />
    </>
  );
}
