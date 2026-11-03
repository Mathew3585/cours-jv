import { BandeauMessages } from "@/components/bandeau-messages";
import type { Utilisateur } from "@/lib/session";
import { supabaseServeur } from "@/lib/supabase/serveur";

/** Charge les messages non lus d'un élève et monte le bandeau temps réel (rien pour le prof). */
export async function MessagesEleve({ u }: { u: Utilisateur }) {
  if (u.profil.role !== "eleve") return null;
  const supabase = await supabaseServeur();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("eleve_id", u.id)
    .is("lu_le", null)
    .order("created_at", { ascending: true })
    .limit(10);
  return <BandeauMessages eleveId={u.id} nonLus={data ?? []} />;
}
