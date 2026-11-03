"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

// Remplaçants des contrôles natifs du navigateur, aux couleurs du site.
// Chacun garde un vrai <input> (caché si besoin) pour que les formulaires fonctionnent comme avant.

const cadre =
  "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-ligne-3 bg-creme px-3 text-left text-[15px] text-encre transition-colors hover:border-[#d9c3a5] focus-visible:border-orange";

function Chevron({ ouvert }: { ouvert: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto shrink-0 text-muet transition-transform ${ouvert ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Ferme un menu quand on clique ailleurs ou qu'on appuie sur Échap. */
function useFermetureExterieure(ouvert: boolean, fermer: () => void) {
  const racine = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) fermer();
    };
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
    };
    document.addEventListener("pointerdown", dehors);
    document.addEventListener("keydown", echap);
    return () => {
      document.removeEventListener("pointerdown", dehors);
      document.removeEventListener("keydown", echap);
    };
  }, [ouvert, fermer]);
  return racine;
}

// ---------- Liste déroulante ----------

export type Option = { value: string; label: string };

export function ListeDeroulante({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  className = "",
}: {
  id: string;
  name?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  /** Texte lu par les lecteurs d'écran si aucun <label> ne pointe vers `id` */
  label?: string;
  className?: string;
}) {
  const [interne, setInterne] = useState(defaultValue ?? options[0]?.value ?? "");
  const actuelle = value ?? interne;
  const [ouvert, setOuvert] = useState(false);
  const [survol, setSurvol] = useState(0);
  const idListe = useId();
  const racine = useFermetureExterieure(ouvert, () => setOuvert(false));
  const liste = useRef<HTMLUListElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  const choisie = options.find((o) => o.value === actuelle) ?? options[0];

  function choisir(v: string) {
    if (value === undefined) setInterne(v);
    onChange?.(v);
    setOuvert(false);
    bouton.current?.focus();
  }

  function ouvrir() {
    setSurvol(Math.max(0, options.findIndex((o) => o.value === actuelle)));
    setOuvert(true);
  }

  useEffect(() => {
    if (!ouvert) return;
    liste.current?.querySelector<HTMLElement>(`[data-index="${survol}"]`)?.scrollIntoView({ block: "nearest" });
  }, [ouvert, survol]);

  function clavier(e: React.KeyboardEvent) {
    if (!ouvert && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      ouvrir();
      return;
    }
    if (!ouvert) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSurvol((s) => Math.min(options.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSurvol((s) => Math.max(0, s - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSurvol(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSurvol(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[survol]) choisir(options[survol].value);
    } else if (e.key === "Tab") setOuvert(false);
    else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setSurvol(i);
    }
  }

  return (
    <div ref={racine} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={actuelle} />}
      <button
        ref={bouton}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={idListe}
        aria-label={label}
        aria-activedescendant={ouvert ? `${idListe}-${survol}` : undefined}
        onClick={() => (ouvert ? setOuvert(false) : ouvrir())}
        onKeyDown={clavier}
        className={cadre}
      >
        <span className="min-w-0 truncate">{choisie?.label}</span>
        <Chevron ouvert={ouvert} />
      </button>
      {ouvert && (
        <ul
          ref={liste}
          id={idListe}
          role="listbox"
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 max-h-72 min-w-full overflow-y-auto rounded-xl border border-ligne bg-white p-1.5 shadow-[0_16px_36px_-14px_rgba(42,30,20,0.35)]"
        >
          {options.map((o, i) => {
            const selectionnee = o.value === actuelle;
            return (
              <li
                key={o.value}
                id={`${idListe}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selectionnee}
                onPointerEnter={() => setSurvol(i)}
                onClick={() => choisir(o.value)}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[14.5px] ${
                  i === survol ? "bg-creme-2" : ""
                } ${selectionnee ? "font-semibold text-orange-texte" : "text-encre"}`}
              >
                <span className="min-w-0 flex-1">{o.label}</span>
                {selectionnee && (
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------- Sélecteur de date ----------

const moisFr = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const joursFr = ["lu", "ma", "me", "je", "ve", "sa", "di"];

const iso = (a: number, m: number, j: number) => `${a}-${String(m + 1).padStart(2, "0")}-${String(j).padStart(2, "0")}`;

function lireIso(v: string) {
  const [a, m, j] = v.split("-").map(Number);
  return a && m && j ? { a, m: m - 1, j } : null;
}

export function SelecteurDate({ id, name, defaultValue = "", placeholder = "Choisir une date" }: { id: string; name: string; defaultValue?: string; placeholder?: string }) {
  const [valeur, setValeur] = useState(defaultValue);
  const [ouvert, setOuvert] = useState(false);
  const aujourdhui = useMemo(() => {
    const d = new Date();
    return { a: d.getFullYear(), m: d.getMonth(), j: d.getDate() };
  }, []);
  const [vue, setVue] = useState(() => {
    const d = lireIso(defaultValue) ?? aujourdhui;
    return { a: d.a, m: d.m };
  });
  const racine = useFermetureExterieure(ouvert, () => setOuvert(false));
  const choisie = lireIso(valeur);

  const libelle = choisie
    ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(choisie.a, choisie.m, choisie.j))
    : placeholder;

  // Cases du mois, en commençant un lundi
  const premier = (new Date(vue.a, vue.m, 1).getDay() + 6) % 7;
  const nbJours = new Date(vue.a, vue.m + 1, 0).getDate();
  const cases: (number | null)[] = [...Array(premier).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];

  const changerMois = (delta: number) =>
    setVue((v) => {
      const m = v.m + delta;
      return { a: v.a + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });

  return (
    <div ref={racine} className="relative">
      <input type="hidden" name={name} value={valeur} />
      <button id={id} type="button" aria-haspopup="dialog" aria-expanded={ouvert} onClick={() => setOuvert((o) => !o)} className={cadre}>
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-orange-fonce">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className={`min-w-0 truncate ${choisie ? "" : "text-muet"}`}>{libelle}</span>
        <Chevron ouvert={ouvert} />
      </button>
      {ouvert && (
        <div
          role="dialog"
          aria-label="Choisir une date"
          className="absolute top-[calc(100%+6px)] right-0 z-50 w-[300px] rounded-2xl border border-ligne bg-white p-3.5 shadow-[0_16px_36px_-14px_rgba(42,30,20,0.35)]"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <button type="button" onClick={() => changerMois(-1)} className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-creme-2" aria-label="Mois précédent">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <b className="font-display text-[15px] capitalize">
              {moisFr[vue.m]} {vue.a}
            </b>
            <button type="button" onClick={() => changerMois(1)} className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-creme-2" aria-label="Mois suivant">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {joursFr.map((j) => (
              <span key={j} className="py-1 text-[11.5px] font-semibold text-muet uppercase">
                {j}
              </span>
            ))}
            {cases.map((j, i) => {
              if (j === null) return <span key={`v${i}`} />;
              const estChoisi = choisie && choisie.a === vue.a && choisie.m === vue.m && choisie.j === j;
              const estAujourdhui = aujourdhui.a === vue.a && aujourdhui.m === vue.m && aujourdhui.j === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => {
                    setValeur(iso(vue.a, vue.m, j));
                    setOuvert(false);
                  }}
                  aria-pressed={Boolean(estChoisi)}
                  aria-label={`${j} ${moisFr[vue.m]} ${vue.a}`}
                  className={`grid h-9 cursor-pointer place-items-center rounded-lg text-sm tabular-nums ${
                    estChoisi ? "bg-orange-fonce font-bold text-white" : estAujourdhui ? "font-bold text-orange-texte ring-1 ring-orange ring-inset hover:bg-creme-2" : "hover:bg-creme-2"
                  }`}
                >
                  {j}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex justify-between border-t border-ligne pt-2.5">
            <button
              type="button"
              onClick={() => {
                setValeur(iso(aujourdhui.a, aujourdhui.m, aujourdhui.j));
                setVue({ a: aujourdhui.a, m: aujourdhui.m });
                setOuvert(false);
              }}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-semibold text-orange-fonce hover:bg-creme-2"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => {
                setValeur("");
                setOuvert(false);
              }}
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muet hover:bg-creme-2"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Interrupteur (remplace la case à cocher) ----------

export function Interrupteur({ id, name, defaultChecked, children }: { id: string; name: string; defaultChecked?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-start gap-3 text-[15px] leading-snug">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ligne-2 transition-colors peer-checked:bg-orange-fonce peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange after:absolute after:top-[3px] after:left-[3px] after:size-[18px] after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
      <span>{children}</span>
    </label>
  );
}

// ---------- Nombre avec boutons − / + ----------

export function ChampNombre({ id, name, min, max, pas = 1, defaultValue, suffixe }: { id: string; name: string; min: number; max: number; pas?: number; defaultValue: number; suffixe?: string }) {
  const [valeur, setValeur] = useState(defaultValue);
  const borne = (v: number) => Math.min(max, Math.max(min, v));
  const bouton = "grid size-9 cursor-pointer place-items-center rounded-lg text-lg font-bold text-encre-2 hover:bg-sable disabled:cursor-default disabled:opacity-40";
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-ligne-3 bg-creme p-1">
      <button type="button" className={bouton} onClick={() => setValeur((v) => borne(v - pas))} disabled={valeur <= min} aria-label="Diminuer">
        −
      </button>
      <input
        id={id}
        name={name}
        inputMode="numeric"
        value={valeur}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
          setValeur(Number.isFinite(n) ? borne(n) : min);
        }}
        className="w-11 bg-transparent text-center text-[15px] font-semibold tabular-nums outline-none"
      />
      {suffixe && <span className="-ml-1.5 pr-1 text-sm text-muet">{suffixe}</span>}
      <button type="button" className={bouton} onClick={() => setValeur((v) => borne(v + pas))} disabled={valeur >= max} aria-label="Augmenter">
        +
      </button>
    </span>
  );
}

// ---------- Zone de fichier ----------

export function ZoneFichier({ id, accept, onFichier, consigne }: { id: string; accept?: string; onFichier: (f: File) => void; consigne: string }) {
  const [nom, setNom] = useState<string | null>(null);
  const [survol, setSurvol] = useState(false);
  const recevoir = (f?: File) => {
    if (!f) return;
    setNom(f.name);
    onFichier(f);
  };
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setSurvol(true);
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSurvol(false);
        recevoir(e.dataTransfer.files[0]);
      }}
      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-4 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-orange ${
        survol ? "border-orange bg-creme-2" : "border-ligne-3 bg-creme-3 hover:border-[#d9c3a5]"
      }`}
    >
      <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => recevoir(e.target.files?.[0])} />
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bf500c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </svg>
      <span className="text-[15px] font-semibold text-encre">{nom ?? "Déposer un fichier ou cliquer pour choisir"}</span>
      <span className="text-[13px] font-normal text-muet">{consigne}</span>
    </label>
  );
}
