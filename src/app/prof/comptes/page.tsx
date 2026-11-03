import type { Metadata } from "next";
import Link from "next/link";
import { BoutonReinitialiser, FormulaireCompte, FormulaireImport } from "@/components/prof/formulaires";
import { Pastille } from "@/components/ui";
import { tousLesEleves, toutesLesClasses } from "@/lib/donnees-prof";

export const metadata: Metadata = { title: "Comptes élèves" };

export default async function ComptesPage() {
  const [classes, eleves] = await Promise.all([toutesLesClasses(), tousLesEleves()]);
  const listeClasses = classes.map((c) => c.classe);
  const nomClasse = new Map(listeClasses.map((c) => [c.id, c.nom]));

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Comptes élèves</h1>
        <span className="text-[15px] text-muet">
          Les élèves ne peuvent pas s&apos;inscrire seuls. Tu crées leurs comptes ici et tu leur donnes leurs identifiants.
        </span>
      </div>

      {listeClasses.length === 0 ? (
        <p className="carte p-6 text-[17px] text-encre-2">
          Crée d&apos;abord une classe dans{" "}
          <Link href="/prof/classes" className="font-semibold text-orange-fonce underline">
            Classes et suivi
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <FormulaireCompte classes={listeClasses} />
          <FormulaireImport classes={listeClasses} />
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="titre-section">Tous les comptes ({eleves.length})</h2>
        <div className="carte overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[15px]">
            <thead>
              <tr className="bg-creme-3 text-left text-[12.5px] tracking-wider text-muet uppercase">
                {["Élève", "Identifiant", "Classe", "Mot de passe"].map((h) => (
                  <th key={h} className="border-b border-ligne px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eleves.map((e) => (
                <tr key={e.id} className="border-b border-[#f6ede1] last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/prof/eleves/${e.id}`} className="font-semibold hover:underline">
                      {e.prenom} {e.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13.5px]">{e.identifiant}</td>
                  <td className="px-4 py-3">{e.classe_id ? nomClasse.get(e.classe_id) : <Pastille>sans classe</Pastille>}</td>
                  <td className="px-4 py-3">
                    <BoutonReinitialiser eleveId={e.id} nom={`${e.prenom} ${e.nom}`} />
                  </td>
                </tr>
              ))}
              {eleves.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muet">
                    Aucun compte élève pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
