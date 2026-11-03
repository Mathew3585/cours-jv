import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { trouverQuestionLibre, trouverQuiz } from "@/contenu";
import { dateCourte } from "@/lib/dates";
import { donneesEleve } from "@/lib/progression";
import { utilisateurCourant } from "@/lib/session";

export const metadata: Metadata = { title: "Mes quiz et notes" };

export default async function NotesPage() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  if (u.profil.role === "prof") redirect("/prof");
  const d = await donneesEleve(u);

  const notesVisibles = new Map(d.projetsOuverts.map((x) => [x.projet.slug, x.regles.notes_visibles]));
  const quiz = [...d.meilleursScores.entries()]
    .map(([id, s]) => ({ id, ...s, info: trouverQuiz(id) }))
    .filter((q) => q.info)
    .sort((a, b) => b.derniere.localeCompare(a.derniere));
  const moyenne = quiz.length > 0 ? (quiz.reduce((n, q) => n + q.score / q.total, 0) / quiz.length) * 20 : null;
  const reponses = [...d.reponses.values()]
    .map((r) => ({ r, info: trouverQuestionLibre(r.question_id) }))
    .filter((x) => x.info)
    .sort((a, b) => b.r.maj_le.localeCompare(a.r.maj_le));

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Mes quiz et notes</h1>
        <span className="text-[15px] text-muet">Ta progression à toi. Personne d&apos;autre que ton prof ne la voit.</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {[
          [moyenne === null ? "–" : moyenne.toFixed(1).replace(".", ","), "moyenne de tes meilleures notes, sur 20"],
          [String(quiz.length), "quiz faits"],
          [String(reponses.filter((x) => x.r.corrige_le).length), "réponses libres corrigées"],
        ].map(([valeur, label]) => (
          <div key={label} className="carte flex flex-col gap-0.5 px-5 py-[18px]">
            <b className="font-display text-[34px] tabular-nums">{valeur}</b>
            <span className="text-sm text-muet">{label}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="titre-section">Quiz</h2>
        {quiz.length === 0 ? (
          <p className="text-[15px] text-muet">Tu n&apos;as pas encore fait de quiz. Il y en a un à la fin de chaque leçon.</p>
        ) : (
          <div className="carte overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-creme-3 text-left text-[12.5px] tracking-wider text-muet uppercase">
                  {["Quiz", "Projet", "Meilleure note", "Tentatives", "Dernière fois"].map((h) => (
                    <th key={h} className="border-b border-ligne px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quiz.map((q) => {
                  const { info } = q;
                  const lien = info!.lecon
                    ? `/projets/${info!.projet.slug}/${info!.module.slug}/${info!.lecon.slug}`
                    : `/projets/${info!.projet.slug}/${info!.module.slug}/quiz-final`;
                  return (
                    <tr key={q.id} className="border-b border-[#f6ede1] last:border-0">
                      <td className="px-4 py-3">
                        <Link href={lien} className="text-orange-fonce underline">
                          {info!.lecon ? info!.lecon.titre : `Quiz final · ${info!.module.titre}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{info!.projet.titre}</td>
                      <td className="px-4 py-3 font-bold tabular-nums">
                        {q.score} / {q.total}
                      </td>
                      <td className="px-4 py-3">{q.tentatives}</td>
                      <td className="px-4 py-3">{dateCourte(q.derniere)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="titre-section">Réponses libres</h2>
        {reponses.length === 0 && <p className="text-[15px] text-muet">Tu n&apos;as pas encore répondu à une question libre.</p>}
        {reponses.map(({ r, info }) => {
          const visible = notesVisibles.get(info!.projet.slug) ?? true;
          return (
            <article key={r.id} className="carte flex flex-col gap-3 p-[22px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <b className="text-base">
                  {info!.lecon.titre} · {info!.question.enonce}
                </b>
                {r.corrige_le && visible && r.note !== null ? (
                  <span className="rounded-full bg-vert-pale px-3 py-1 text-[13px] font-semibold text-vert-texte">{r.note} / 5</span>
                ) : (
                  <span className="rounded-full bg-neutre px-3 py-1 text-[13px] font-semibold text-encre-2">
                    {r.corrige_le ? "corrigée" : "en attente de correction"}
                  </span>
                )}
              </div>
              <p className="text-[15px] leading-relaxed text-encre-2">« {r.reponse} »</p>
              {r.corrige_le && visible && r.commentaire && (
                <p className="rounded-[14px] bg-creme-2 px-4 py-3.5 text-[14.5px] leading-normal">
                  <b>Ton prof :</b> {r.commentaire}
                </p>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
