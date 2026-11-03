import "server-only";
import { cache } from "react";
import { assemblerDonnees, type DonneesEleve } from "@/lib/progression";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Classe, ClasseProjet, Deadline, Profil, ReponseLibre } from "@/lib/supabase/types";

export type EleveSuivi = { profil: Profil; d: DonneesEleve };

export const toutesLesClasses = cache(async () => {
  const supabase = await supabaseServeur();
  const [{ data: classes }, { data: eleves }, { data: ouverts }] = await Promise.all([
    supabase.from("classes").select("*").order("niveau", { ascending: false }).order("nom"),
    supabase.from("profiles").select("id, classe_id").eq("role", "eleve"),
    supabase.from("classe_projets").select("*"),
  ]);
  return (classes ?? []).map((c) => ({
    classe: c,
    nbEleves: (eleves ?? []).filter((e) => e.classe_id === c.id).length,
    projets: (ouverts ?? []).filter((o) => o.classe_id === c.id),
  }));
});

/** Charge en une fois la progression de plusieurs élèves. */
async function suivreEleves(profils: Profil[], ouvertsParClasse: Map<string, ClasseProjet[]>, deadlinesParClasse: Map<string, Deadline[]>) {
  if (profils.length === 0) return [];
  const supabase = await supabaseServeur();
  const ids = profils.map((p) => p.id);
  const [prog, tent, rep] = await Promise.all([
    supabase.from("progression_lecons").select("*").in("eleve_id", ids),
    supabase.from("tentatives_quiz").select("*").in("eleve_id", ids).order("created_at", { ascending: false }),
    supabase.from("reponses_libres").select("*").in("eleve_id", ids),
  ]);
  return profils.map(
    (profil): EleveSuivi => ({
      profil,
      d: assemblerDonnees({
        ouverts: profil.classe_id ? (ouvertsParClasse.get(profil.classe_id) ?? []) : [],
        deadlines: profil.classe_id ? (deadlinesParClasse.get(profil.classe_id) ?? []) : [],
        progression: (prog.data ?? []).filter((x) => x.eleve_id === profil.id),
        tentatives: (tent.data ?? []).filter((x) => x.eleve_id === profil.id),
        reponses: (rep.data ?? []).filter((x) => x.eleve_id === profil.id),
      }),
    }),
  );
}

export const suiviClasse = cache(async (classeId: string) => {
  const supabase = await supabaseServeur();
  const [{ data: classe }, { data: profils }, { data: ouverts }, { data: deadlines }] = await Promise.all([
    supabase.from("classes").select("*").eq("id", classeId).maybeSingle(),
    supabase.from("profiles").select("*").eq("classe_id", classeId).eq("role", "eleve").order("nom").order("prenom"),
    supabase.from("classe_projets").select("*").eq("classe_id", classeId),
    supabase.from("deadlines").select("*").eq("classe_id", classeId),
  ]);
  if (!classe) return null;
  const eleves = await suivreEleves(profils ?? [], new Map([[classeId, ouverts ?? []]]), new Map([[classeId, deadlines ?? []]]));
  return { classe, ouverts: ouverts ?? [], deadlines: deadlines ?? [], eleves };
});

export const suiviEleve = cache(async (eleveId: string) => {
  const supabase = await supabaseServeur();
  const { data: profil } = await supabase.from("profiles").select("*").eq("id", eleveId).eq("role", "eleve").maybeSingle();
  if (!profil) return null;
  let classe: Classe | null = null;
  let ouverts: ClasseProjet[] = [];
  let deadlines: Deadline[] = [];
  if (profil.classe_id) {
    const [c, o, dl] = await Promise.all([
      supabase.from("classes").select("*").eq("id", profil.classe_id).maybeSingle(),
      supabase.from("classe_projets").select("*").eq("classe_id", profil.classe_id),
      supabase.from("deadlines").select("*").eq("classe_id", profil.classe_id),
    ]);
    classe = c.data;
    ouverts = o.data ?? [];
    deadlines = dl.data ?? [];
  }
  const [suivi] = await suivreEleves([profil], new Map([[profil.classe_id ?? "", ouverts]]), new Map([[profil.classe_id ?? "", deadlines]]));
  return { ...suivi, classe };
});

export const reponsesACorriger = cache(async () => {
  const supabase = await supabaseServeur();
  const [{ data: reponses }, { data: profils }, { data: classes }] = await Promise.all([
    supabase.from("reponses_libres").select("*").is("corrige_le", null).order("maj_le", { ascending: true }),
    supabase.from("profiles").select("*").eq("role", "eleve"),
    supabase.from("classes").select("*"),
  ]);
  const parId = new Map((profils ?? []).map((p) => [p.id, p]));
  const classeParId = new Map((classes ?? []).map((c) => [c.id, c]));
  return (reponses ?? []).map((r: ReponseLibre) => {
    const profil = parId.get(r.eleve_id);
    return { reponse: r, profil, classe: profil?.classe_id ? classeParId.get(profil.classe_id) : undefined };
  });
});

export const tousLesEleves = cache(async () => {
  const supabase = await supabaseServeur();
  const { data } = await supabase.from("profiles").select("*").eq("role", "eleve").order("nom").order("prenom");
  return data ?? [];
});

/** Activité récente de tous les élèves, pour l'accueil prof. */
export const activiteRecente = cache(async () => {
  const supabase = await supabaseServeur();
  const [{ data: tent }, { data: prog }, { data: profils }] = await Promise.all([
    supabase.from("tentatives_quiz").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("progression_lecons").select("*").eq("termine", true).order("maj_le", { ascending: false }).limit(8),
    supabase.from("profiles").select("id, prenom, nom"),
  ]);
  const nom = new Map((profils ?? []).map((p) => [p.id, `${p.prenom} ${p.nom[0] ?? ""}.`]));
  return [
    ...(tent ?? []).map((t) => ({ quand: t.created_at, qui: nom.get(t.eleve_id) ?? "Un élève", eleveId: t.eleve_id, type: "quiz" as const, id: t.quiz_id, score: `${t.score}/${t.total}` })),
    ...(prog ?? []).map((p) => ({ quand: p.maj_le, qui: nom.get(p.eleve_id) ?? "Un élève", eleveId: p.eleve_id, type: "lecon" as const, id: p.lecon_id, score: "" })),
  ]
    .sort((a, b) => b.quand.localeCompare(a.quand))
    .slice(0, 8);
});
