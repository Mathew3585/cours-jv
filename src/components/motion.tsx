"use client";

import { MotionConfig, motion } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fait apparaître un bloc en glissant légèrement vers le haut. */
export function Apparition({
  children,
  delai = 0,
  className,
}: {
  children: React.ReactNode;
  delai?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delai, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Barre de progression qui se remplit à l'affichage. */
export function BarreProgression({
  valeur,
  className = "h-2",
  fond = "bg-piste",
}: {
  valeur: number;
  className?: string;
  fond?: string;
}) {
  return (
    <div
      className={`${className} ${fond} overflow-hidden rounded-full`}
      role="progressbar"
      aria-valuenow={valeur}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full origin-left rounded-full bg-orange"
        style={{ width: `${valeur}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  );
}
