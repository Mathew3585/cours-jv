import { redirect } from "next/navigation";
import { MenuEleve } from "@/components/menu-eleve";
import { MessagesEleve } from "@/components/messages-eleve";
import { utilisateurCourant } from "@/lib/session";

export default async function EleveLayout({ children }: { children: React.ReactNode }) {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  const { prenom, nom, role } = u.profil;
  const prof = role === "prof";

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <MessagesEleve u={u} />
      <MenuEleve
        nom={`${prenom} ${nom}`}
        initiales={`${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase()}
        sousTitre={prof ? "Prof · aperçu élève" : u.classe ? `${u.classe.nom} · ${u.classe.annee}` : "Pas encore de classe"}
        prof={prof}
      />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-12 md:py-10">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-7">{children}</div>
      </main>
    </div>
  );
}
