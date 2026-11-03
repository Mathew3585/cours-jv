import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireCorrection } from "@/components/prof/formulaires";
import { trouverQuestionLibre } from "@/contenu";
import { ilYa } from "@/lib/dates";
import { reponsesACorriger } from "@/lib/donnees-prof";

export const metadata: Metadata = { title: "À corriger" };

export default async function CorrectionsPage() {
  const liste = await reponsesACorriger();

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">À corriger</h1>
        <span className="text-[15px] text-muet">
          {liste.length > 0
            ? `${liste.length} réponse${liste.length > 1 ? "s" : ""} libre${liste.length > 1 ? "s" : ""}, de la plus ancienne à la plus récente.`
            : "Rien à corriger pour l'instant."}
        </span>
      </div>

      {liste.map(({ reponse, profil, classe }) => {
        const q = trouverQuestionLibre(reponse.question_id);
        return (
          <article key={reponse.id} className="carte flex flex-col gap-4 p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muet">
              <span>
                {q ? `${q.projet.titre} · ${q.module.titre} · ${q.lecon.titre}` : reponse.question_id}
                {classe && ` · ${classe.nom}`}
              </span>
              <span>
                {profil ? (
                  <Link href={`/prof/eleves/${profil.id}`} className="font-semibold text-orange-fonce hover:underline">
                    {profil.prenom} {profil.nom}
                  </Link>
                ) : (
                  "Élève supprimé"
                )}{" "}
                · {ilYa(reponse.maj_le)}
              </span>
            </div>
            <h2 className="font-display text-[22px] leading-snug font-bold">{q?.question.enonce ?? "Question retirée du cours"}</h2>
            {q && (
              <div className="flex flex-col gap-1 rounded-[14px] bg-creme-2 px-4 py-3.5">
                <b className="text-[13px] tracking-wider text-orange-texte uppercase">Éléments attendus</b>
                <span className="text-[15px] leading-normal">{q.question.attendus}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <b className="text-[13px] tracking-wider text-muet uppercase">Réponse de l&apos;élève</b>
              <p className="rounded-[14px] border border-ligne bg-creme px-[18px] py-4 text-[17px] leading-relaxed whitespace-pre-line">{reponse.reponse}</p>
            </div>
            <FormulaireCorrection reponseId={reponse.id} />
          </article>
        );
      })}
    </>
  );
}
