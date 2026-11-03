"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { marquerMessageLu } from "@/actions/eleve";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import type { Message } from "@/lib/supabase/types";

const heure = (iso: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/**
 * Messages du prof, affichés en bandeau en haut de l'écran.
 * Les messages non lus sont chargés par le serveur ; les nouveaux arrivent en temps réel.
 */
export function BandeauMessages({ eleveId, nonLus }: { eleveId: string; nonLus: Message[] }) {
  const [messages, setMessages] = useState(nonLus);

  useEffect(() => {
    const supabase = supabaseNavigateur();
    const canal = supabase
      .channel(`messages:${eleveId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `eleve_id=eq.${eleveId}` }, (evenement) => {
        const nouveau = evenement.new as Message;
        setMessages((liste) => (liste.some((m) => m.id === nouveau.id) ? liste : [...liste, nouveau]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [eleveId]);

  function fermer(id: number) {
    setMessages((liste) => liste.filter((m) => m.id !== id));
    marquerMessageLu(id).catch(() => {});
  }

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2.5 px-3">
      <AnimatePresence initial={false}>
        {messages.slice(-3).map((m) => (
          <motion.div
            key={m.id}
            role="status"
            layout
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="pointer-events-auto flex w-full max-w-[560px] items-start gap-3.5 rounded-2xl bg-encre px-4 py-3.5 text-creme shadow-[0_18px_40px_-14px_rgba(42,30,20,0.55)]"
          >
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-orange-fonce">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
              </svg>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[12.5px] font-semibold text-[#f6b27e]">
                Message de ton prof · {heure(m.created_at)}
              </span>
              <p className="text-[15.5px] leading-snug break-words whitespace-pre-line">{m.texte}</p>
            </div>
            <button
              type="button"
              onClick={() => fermer(m.id)}
              className="shrink-0 cursor-pointer rounded-lg bg-brun px-3 py-1.5 text-sm font-semibold text-creme hover:bg-[#4a3a2c]"
            >
              OK
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
