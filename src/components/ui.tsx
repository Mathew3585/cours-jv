export function Logo({ taille = "md" }: { taille?: "md" | "lg" }) {
  const carre = taille === "lg" ? "size-[34px] rounded-[10px]" : "size-[30px] rounded-[9px]";
  const losange = taille === "lg" ? "size-3 border-[3px]" : "size-2.5 border-[2.5px]";
  return (
    <span className={`flex items-center gap-2.5 font-display font-extrabold ${taille === "lg" ? "text-[22px]" : "text-xl"}`}>
      <span className={`${carre} grid place-items-center bg-orange`}>
        <span className={`${losange} rotate-45 rounded-[2px] border-white`} />
      </span>
      Atelier JV
    </span>
  );
}

const tonsPastille = {
  orange: "bg-orange-pale text-orange-texte",
  ambre: "bg-ambre-pale text-ambre-texte",
  vert: "bg-vert-pale text-vert-texte",
  rouge: "bg-rouge-pale text-rouge-texte",
  neutre: "bg-neutre text-muet",
} as const;

export function Pastille({ ton = "neutre", children }: { ton?: keyof typeof tonsPastille; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${tonsPastille[ton]}`}>
      {children}
    </span>
  );
}

export function Avatar({ initiales, className = "bg-encre text-creme" }: { initiales: string; className?: string }) {
  return (
    <span className={`grid size-[38px] shrink-0 place-items-center rounded-full text-sm font-bold ${className}`}>{initiales}</span>
  );
}
