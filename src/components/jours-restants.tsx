"use client";

import { useSyncExternalStore } from "react";
import { Pastille } from "@/components/ui";
import { joursRestants, libelleJoursRestants } from "@/lib/dates";

const sAbonner = () => () => {};

/** « dans 5 jours », calculé dans le navigateur pour rester juste sans reconstruire la page. */
export function JoursRestants({ iso }: { iso: string }) {
  const jours = useSyncExternalStore(
    sAbonner,
    () => joursRestants(iso),
    () => null,
  );

  if (jours === null) return <Pastille ton="neutre">&nbsp;</Pastille>;
  return <Pastille ton={jours < 0 ? "rouge" : jours <= 7 ? "ambre" : "neutre"}>{libelleJoursRestants(jours)}</Pastille>;
}
