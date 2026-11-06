"use client";

import { useState } from "react";

export function BoutonCopier({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 1800);
    } catch {
      // Presse-papiers refusé par le navigateur : l'élève peut toujours sélectionner le code.
    }
  }

  return (
    <button
      type="button"
      onClick={copier}
      className="min-h-8 cursor-pointer rounded-lg px-2.5 font-sans text-[12.5px] font-semibold text-[#d9c3a5] transition-colors hover:bg-white/10 hover:text-white"
    >
      <span aria-live="polite">{copie ? "Copié" : "Copier"}</span>
    </button>
  );
}
