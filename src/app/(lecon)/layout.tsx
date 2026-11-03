import { MessagesEleve } from "@/components/messages-eleve";
import { utilisateurCourant } from "@/lib/session";

// Les leçons et quiz finaux s'affichent sans le menu, mais l'élève y reçoit quand même les messages du prof.
export default async function LeconLayout({ children }: { children: React.ReactNode }) {
  const u = await utilisateurCourant();
  return (
    <>
      {u && <MessagesEleve u={u} />}
      {children}
    </>
  );
}
