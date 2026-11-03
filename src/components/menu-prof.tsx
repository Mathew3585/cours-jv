"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/actions/auth";
import { Avatar, Logo } from "@/components/ui";

export function MenuProf({ nom, initiales, aCorriger }: { nom: string; initiales: string; aCorriger: number }) {
  const chemin = usePathname();
  const liens = [
    { href: "/prof", label: "Accueil", exact: true },
    { href: "/prof/classes", label: "Classes et suivi" },
    { href: "/prof/comptes", label: "Comptes élèves" },
    { href: "/prof/projets", label: "Projets et deadlines" },
    { href: "/prof/corrections", label: "À corriger", badge: aCorriger },
  ];

  return (
    <nav
      aria-label="Navigation prof"
      className="flex flex-col gap-1 bg-encre px-4 py-6 text-creme md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0"
    >
      <Link href="/prof" className="px-2 pb-1.5">
        <Logo />
      </Link>
      <span className="mx-2 mb-5 self-start rounded-full bg-brun px-2.5 py-0.5 text-xs font-semibold text-[#f6b27e]">Espace prof</span>
      {liens.map((lien) => {
        const actif = lien.exact ? chemin === lien.href : chemin === lien.href || chemin.startsWith(lien.href + "/");
        return (
          <Link
            key={lien.href}
            href={lien.href}
            aria-current={actif ? "page" : undefined}
            className={`flex min-h-11 items-center justify-between gap-2.5 rounded-[10px] px-3 text-[15px] ${
              actif ? "bg-orange-fonce font-semibold text-white" : "text-[#d9c6b0] hover:bg-brun hover:text-creme"
            }`}
          >
            {lien.label}
            {lien.badge ? (
              <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${actif ? "bg-white text-orange-fonce" : "bg-orange text-white"}`}>
                {lien.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
      <Link href="/projets" className="mt-3 flex min-h-11 items-center rounded-[10px] px-3 text-[15px] text-[#d9c6b0] hover:bg-brun hover:text-creme">
        Voir les cours comme un élève
      </Link>
      <div className="mt-auto flex items-center gap-2.5 border-t border-brun px-2 pt-4">
        <Avatar initiales={initiales} className="bg-orange-fonce text-white" />
        <span className="flex flex-col text-sm">
          <b>{nom}</b>
          <span className="text-[#c2ac93]">Professeur</span>
        </span>
      </div>
      <form action={deconnexion}>
        <button type="submit" className="flex min-h-11 w-full cursor-pointer items-center rounded-[10px] px-3 text-sm text-[#d9c6b0] hover:bg-brun">
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
