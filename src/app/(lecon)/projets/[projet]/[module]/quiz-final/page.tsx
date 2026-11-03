import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EnteteLecon } from "@/components/lecon/entete";
import { QuizInteractif } from "@/components/lecon/quiz";
import { idLecon, trouverModule } from "@/contenu";
import { accesProjet } from "@/lib/acces";
import { moduleVerrouille, statutLecon } from "@/lib/progression";

export const metadata: Metadata = { title: "Quiz final" };

export default async function QuizFinalPage({ params }: PageProps<"/projets/[projet]/[module]/quiz-final">) {
  const { projet: p, module: m } = await params;
  const trouve = trouverModule(p, m);
  if (!trouve || trouve.module.quizFinal.questions.length === 0) notFound();
  const { projet, module: mod } = trouve;
  const acces = await accesProjet(p);
  const indexModule = projet.modules.indexOf(mod);
  if (!acces.prof && moduleVerrouille(acces.donnees, projet, indexModule, acces.regles)) redirect(`/projets/${p}/${m}`);

  const d = acces.donnees;
  const suivant = projet.modules[indexModule + 1];
  const base = `/projets/${p}/${m}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <EnteteLecon
        retour={{ href: base, label: `Module ${indexModule + 1} · ${mod.titre}` }}
        total={mod.lecons.length}
        actuelle={-1}
        statuts={mod.lecons.map((x) => (d ? statutLecon(d, idLecon(p, m, x.slug)) : "a-faire"))}
      />
      <main className="flex flex-1 justify-center px-5 py-12">
        <div className="flex w-full max-w-[760px] flex-col gap-4">
          <span className="text-sm text-muet">
            {projet.titre} / {mod.titre}
          </span>
          <h1 className="font-display text-[40px] leading-tight font-extrabold tracking-tight">Quiz final du module</h1>
          <p className="text-[17px] leading-relaxed text-encre-2">
            {mod.quizFinal.questions.length} questions sur tout le module. Il faut {acces.regles.seuil_validation} % de bonnes réponses pour valider
            le module. Tu peux le refaire autant de fois que tu veux : ton prof voit ta meilleure note.
          </p>
          <QuizInteractif
            quiz={mod.quizFinal}
            titre="Prêt pour le quiz final ?"
            seuil={acces.regles.seuil_validation}
            meilleurScore={d?.meilleursScores.get(mod.quizFinal.id)}
            apercu={acces.prof}
            apresValidation={
              suivant && suivant.lecons.length > 0 ? (
                <Link href={`/projets/${p}/${suivant.slug}`} className="btn btn-pri">
                  Module suivant : {suivant.titre}
                </Link>
              ) : (
                <Link href={base} className="btn btn-pri">
                  Retour au module
                </Link>
              )
            }
          />
        </div>
      </main>
    </div>
  );
}
