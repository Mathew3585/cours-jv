import Link from "next/link";
import type { StatutLecon } from "@/lib/progression";

export function EnteteLecon({
  retour,
  total,
  actuelle,
  statuts,
}: {
  retour: { href: string; label: string };
  total: number;
  /** Index de la leçon affichée, ou -1 pour le quiz final */
  actuelle: number;
  statuts: StatutLecon[];
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-ligne bg-creme-2/95 px-5 py-3 backdrop-blur md:px-8">
      <Link href={retour.href} className="btn bg-transparent">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        {retour.label}
      </Link>
      <div className="flex items-center gap-1.5" aria-label={actuelle >= 0 ? `Leçon ${actuelle + 1} sur ${total}` : "Quiz final"}>
        {statuts.map((s, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full md:w-8 ${i === actuelle ? "bg-orange" : s === "fait" ? "bg-vert" : "bg-ligne-2"}`}
          />
        ))}
        <span className="ml-2 text-sm text-muet">{actuelle >= 0 ? `Leçon ${actuelle + 1} / ${total}` : "Quiz final"}</span>
      </div>
      <Link href="/parcours" className="btn bg-transparent">
        Mon parcours
      </Link>
    </header>
  );
}
