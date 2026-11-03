"use client";

import Link from "next/link";
import { useState } from "react";

export type LigneEleve = {
  id: string;
  nom: string;
  lecon: string;
  progression: number;
  moyenne: string;
  activite: string;
  statut: "retard" | "heure" | "avance" | "pas-commence";
};

const statuts = {
  retard: { label: "en retard", classes: "bg-rouge-pale text-rouge-texte" },
  heure: { label: "à l'heure", classes: "bg-vert-pale text-vert-texte" },
  avance: { label: "en avance", classes: "bg-orange-pale text-orange-texte" },
  "pas-commence": { label: "pas commencé", classes: "bg-neutre text-encre-2" },
};

export function TableauEleves({ lignes }: { lignes: LigneEleve[] }) {
  const [filtre, setFiltre] = useState<"tous" | LigneEleve["statut"]>("tous");
  const filtres: { id: typeof filtre; label: string }[] = [
    { id: "tous", label: `Tous (${lignes.length})` },
    { id: "retard", label: `En retard (${lignes.filter((l) => l.statut === "retard").length})` },
    { id: "heure", label: "À l'heure" },
    { id: "avance", label: "En avance" },
  ];
  const visibles = lignes.filter((l) => filtre === "tous" || l.statut === filtre);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="titre-section">Élèves</h2>
        <div className="flex flex-wrap gap-1 rounded-xl border border-ligne bg-white p-1" role="group" aria-label="Filtrer les élèves">
          {filtres.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtre === f.id}
              onClick={() => setFiltre(f.id)}
              className={`min-h-10 cursor-pointer rounded-[10px] px-3.5 text-sm font-semibold ${filtre === f.id ? "bg-encre text-creme" : "text-encre-2 hover:bg-creme-2"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="carte overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[15px]">
          <thead>
            <tr className="bg-creme-3 text-left text-[12.5px] tracking-wider text-muet uppercase">
              {["Élève", "Leçon en cours", "Progression", "Quiz /20", "Dernière activité", "Statut"].map((h) => (
                <th key={h} className="border-b border-ligne px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id} className="border-b border-[#f6ede1] last:border-0 hover:bg-creme-3">
                <td className="px-4 py-3">
                  <Link href={`/prof/eleves/${l.id}`} className="font-semibold hover:underline">
                    {l.nom}
                  </Link>
                </td>
                <td className="px-4 py-3">{l.lecon}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2.5">
                    <span className="inline-block h-[7px] w-[120px] overflow-hidden rounded-full bg-piste">
                      <span className="block h-full rounded-full bg-orange" style={{ width: `${l.progression}%` }} />
                    </span>
                    <span className="tabular-nums">{l.progression} %</span>
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{l.moyenne}</td>
                <td className="px-4 py-3 text-encre-2">{l.activite}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${statuts[l.statut].classes}`}>{statuts[l.statut].label}</span>
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muet">
                  {lignes.length === 0 ? "Aucun élève dans cette classe. Ajoute-les depuis « Comptes élèves »." : "Aucun élève dans cette catégorie."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
