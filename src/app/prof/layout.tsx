import { MenuProf } from "@/components/menu-prof";
import { reponsesACorriger } from "@/lib/donnees-prof";
import { exigerProf } from "@/lib/session";

export default async function ProfLayout({ children }: { children: React.ReactNode }) {
  const u = await exigerProf();
  const aCorriger = await reponsesACorriger();
  const { prenom, nom } = u.profil;

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <MenuProf nom={`${prenom} ${nom}`} initiales={`${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase()} aCorriger={aCorriger.length} />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-12 md:py-10">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7">{children}</div>
      </main>
    </div>
  );
}
