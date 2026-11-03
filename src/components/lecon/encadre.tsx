const styles = {
  retenir: { titre: "À retenir", classes: "bg-orange-pale", couleur: "#8a3a06", icone: <path d="M5 12l5 5 9-10" /> },
  piege: {
    titre: "Piège classique",
    classes: "bg-[#fbebc8]",
    couleur: "#7a4f00",
    icone: (
      <>
        <path d="M12 3l9 16H3z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  "plus-loin": {
    titre: "Pour aller plus loin",
    classes: "bg-creme-2 border border-ligne",
    couleur: "#5e4b39",
    icone: (
      <>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </>
    ),
  },
  info: {
    titre: "Bon à savoir",
    classes: "bg-[#eef3f8]",
    couleur: "#2c4a66",
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
  },
} as const;

export function Encadre({ type = "info", titre, children }: { type?: keyof typeof styles; titre?: string; children: React.ReactNode }) {
  const s = styles[type] ?? styles.info;
  return (
    <aside className={`encadre my-6 flex gap-3.5 rounded-2xl px-[18px] py-4 text-[15.5px] leading-relaxed ${s.classes}`}>
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.couleur} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
        {s.icone}
      </svg>
      <div className="min-w-0">
        <b style={{ color: s.couleur }}>{titre ?? s.titre}</b>
        <div className="encadre-contenu">{children}</div>
      </div>
    </aside>
  );
}
