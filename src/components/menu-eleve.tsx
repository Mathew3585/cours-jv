"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { deconnexion } from "@/actions/auth";
import { Avatar, Logo } from "@/components/ui";

const liens = [
  { href: "/parcours", label: "Mon parcours" },
  { href: "/projets", label: "Mes projets" },
  { href: "/exercices", label: "Exercices" },
  { href: "/dico", label: "Le dico" },
  { href: "/notes", label: "Mes quiz et notes" },
];

export function MenuEleve({ nom, initiales, sousTitre, prof }: { nom: string; initiales: string; sousTitre: string; prof: boolean }) {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Navigation élève"
      className="flex flex-col gap-1 border-b border-ligne bg-creme-2 px-4 py-6 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0"
    >
      <Link href={prof ? "/prof" : "/parcours"} className="px-2 pb-6">
        <Logo />
      </Link>
      {prof && (
        <Link href="/prof" className="mb-3 flex min-h-11 items-center rounded-[10px] bg-encre px-3 text-[15px] font-semibold text-creme hover:bg-brun">
          Retour à l&apos;espace prof
        </Link>
      )}
      {liens
        .filter((l) => !prof || ["/projets", "/exercices", "/dico"].includes(l.href))
        .map((lien) => {
          const actif = chemin === lien.href || chemin.startsWith(lien.href + "/");
          return (
            <Link
              key={lien.href}
              href={lien.href}
              aria-current={actif ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-[10px] px-3 text-[15px] transition-colors ${
                actif ? "bg-orange-pale font-semibold text-orange-texte" : "text-encre-2 hover:bg-sable hover:text-encre"
              }`}
            >
              {lien.label}
            </Link>
          );
        })}
      <div className="mt-auto flex items-center gap-2.5 border-t border-ligne px-2 pt-4">
        <Avatar initiales={initiales} />
        <span className="flex flex-col text-sm">
          <b>{nom}</b>
          <span className="text-muet">{sousTitre}</span>
        </span>
      </div>
      <form action={deconnexion}>
        <button type="submit" className="flex min-h-11 w-full cursor-pointer items-center rounded-[10px] px-3 text-sm text-encre-2 hover:bg-sable">
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
