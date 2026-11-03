import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Apparition, BarreProgression } from "@/components/motion";
import { Pastille } from "@/components/ui";
import { projets } from "@/contenu";
import { donneesEleve, progressionProjet } from "@/lib/progression";
import { utilisateurCourant } from "@/lib/session";

export const metadata: Metadata = { title: "Mes projets" };

export default async function ProjetsPage() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  const prof = u.profil.role === "prof";
  const d = prof ? null : await donneesEleve(u);
  const liste = d ? d.projetsOuverts : projets.map((projet) => ({ projet, regles: null }));

  return (
    <>
      <Apparition className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">{prof ? "Tous les projets" : "Mes projets"}</h1>
        <span className="text-[15px] text-muet">
          {prof ? "Aperçu de tous les cours disponibles, tels que les élèves les voient." : "Les projets que ton prof a ouverts pour ta classe."}
        </span>
      </Apparition>

      {liste.length === 0 && (
        <p className="carte p-8 text-[17px] text-encre-2">Aucun projet n&apos;est ouvert pour ta classe pour l&apos;instant.</p>
      )}

      <Apparition delai={0.05} className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {liste.map(({ projet, regles }) => {
          const pct = d && regles ? progressionProjet(d, projet, regles.seuil_validation) : null;
          return (
            <Link key={projet.slug} href={`/projets/${projet.slug}`} className="carte flex flex-col gap-3 p-6 transition-colors hover:border-[#e8b48a]">
              <span className="self-start">
                <Pastille ton={pct === 100 ? "vert" : "orange"}>
                  {projet.niveau} · {projet.techno}
                </Pastille>
              </span>
              <b className="font-display text-[28px]">{projet.titre}</b>
              <span className="text-[15px] text-encre-2">
                {projet.modules.length} modules · {projet.modules.reduce((n, m) => n + m.lecons.length, 0)} leçons
                {pct !== null && ` · ${pct} % terminé`}
              </span>
              {pct !== null && <BarreProgression valeur={pct} />}
            </Link>
          );
        })}
      </Apparition>
    </>
  );
}
