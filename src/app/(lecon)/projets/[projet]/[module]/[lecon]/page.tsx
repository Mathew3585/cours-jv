import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { terminerLecon } from "@/actions/eleve";
import { FournisseurLecon, type ValeurLecon } from "@/components/lecon/contexte";
import { Lecteur } from "@/components/lecon/lecteur";
import { idLecon, trouverLecon } from "@/contenu";
import { accesProjet } from "@/lib/acces";
import { lireCode } from "@/lib/code";
import { construireEtapes } from "@/lib/etapes-lecon";
import { moduleVerrouille, statutLecon } from "@/lib/progression";
import { supabaseServeur } from "@/lib/supabase/serveur";

export async function generateMetadata({ params }: PageProps<"/projets/[projet]/[module]/[lecon]">): Promise<Metadata> {
  const { projet, module, lecon } = await params;
  return { title: trouverLecon(projet, module, lecon)?.lecon.titre };
}

export default async function LeconPage({ params }: PageProps<"/projets/[projet]/[module]/[lecon]">) {
  const { projet: p, module: m, lecon: l } = await params;
  const trouve = trouverLecon(p, m, l);
  if (!trouve) notFound();
  const { projet, module: mod, lecon, index, suivante } = trouve;
  const acces = await accesProjet(p);
  const leconId = idLecon(p, m, l);
  const indexModule = projet.modules.indexOf(mod);
  const d = acces.donnees;

  if (!acces.prof) {
    if (moduleVerrouille(acces.donnees, projet, indexModule, acces.regles)) redirect(`/projets/${p}/${m}`);
    // Marque la leçon comme commencée (ou remonte sa date pour « Reprendre »).
    const supabase = await supabaseServeur();
    const existante = acces.donnees.progression.get(leconId);
    if (!existante) await supabase.from("progression_lecons").insert({ eleve_id: acces.u.id, lecon_id: leconId });
    else if (!existante.termine)
      await supabase.from("progression_lecons").update({ maj_le: new Date().toISOString() }).eq("eleve_id", acces.u.id).eq("lecon_id", leconId);
  }

  const valeur: ValeurLecon = {
    leconId,
    quiz: lecon.quiz,
    meilleurScore: lecon.quiz && d ? d.meilleursScores.get(lecon.quiz.id) : undefined,
    questionsLibres: Object.fromEntries(
      (lecon.questionsLibres ?? []).map((q) => {
        const r = d?.reponses.get(q.id);
        return [
          q.id,
          {
            enonce: q.enonce,
            reponse: r ? { texte: r.reponse, note: r.note, commentaire: r.commentaire, corrigee: Boolean(r.corrige_le) } : undefined,
          },
        ];
      }),
    ),
    notesVisibles: acces.regles.notes_visibles,
    apercu: acces.prof,
  };

  const { default: Contenu } = await lecon.charger();
  const { etapes, fichiers } = construireEtapes(Contenu, {
    quiz: Boolean(lecon.quiz?.questions.length),
    questions: (lecon.questionsLibres ?? []).map((q) => q.id),
  });
  const codes = Object.fromEntries(await Promise.all(fichiers.map(async (f) => [f, await lireCode(p, f)] as const)));

  const base = `/projets/${p}/${m}`;
  const aUnQuizFinal = mod.quizFinal.questions.length > 0;
  const destination = suivante ? `${base}/${suivante.slug}` : aUnQuizFinal ? `${base}/quiz-final` : base;
  const libelleSuite = suivante ? `Leçon suivante : ${suivante.titre}` : aUnQuizFinal ? "Passer au quiz final du module" : "Retour au module";
  const dejaTerminee = d ? statutLecon(d, leconId) === "fait" : false;
  const progression = d?.progression.get(leconId);
  const etapeInitiale = progression && !progression.termine ? progression.etape : 0;

  const fin = (
    <>
      <span className="text-[13px] font-semibold tracking-wider text-muet uppercase">Fin de la leçon</span>
      <h2 className="font-display text-[32px] leading-tight font-extrabold">{dejaTerminee ? "Leçon déjà terminée" : "Bien joué, tu as tout parcouru."}</h2>
      <p className="text-[17px] leading-relaxed text-encre-2">
        Tu as vu les {etapes.filter((e) => e.type === "code").length} étapes de code de « {lecon.titre} ».
        {lecon.quiz && " Si tu as sauté le quiz, tu peux revenir en arrière avec « Précédent »."}
      </p>
      {acces.prof ? (
        <Link href={destination} className="btn btn-pri min-h-[52px] self-start px-6 text-base">
          {libelleSuite}
        </Link>
      ) : (
        <form action={terminerLecon.bind(null, leconId, destination)}>
          <button type="submit" className="btn btn-pri min-h-[52px] px-6 text-base">
            {dejaTerminee ? libelleSuite : `J'ai compris · ${libelleSuite.charAt(0).toLowerCase()}${libelleSuite.slice(1)}`}
          </button>
        </form>
      )}
      <Link href={base} className="text-sm font-semibold text-orange-fonce underline">
        Revenir à la liste des leçons du module
      </Link>
    </>
  );

  return (
    <FournisseurLecon valeur={valeur}>
      <Lecteur
        titre={`${indexModule + 1}.${index + 1} ${lecon.titre}`}
        retour={{ href: base, label: mod.titre }}
        ecrans={etapes}
        fichiers={codes}
        etapeInitiale={etapeInitiale}
        fin={fin}
      />
    </FournisseurLecon>
  );
}
