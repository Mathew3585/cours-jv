const JOUR_MS = 24 * 60 * 60 * 1000;

/** « 7 nov. » */
export function dateCourte(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso));
}

/** « vendredi 7 nov. » */
export function dateAvecJour(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso));
}

/** Nombre de jours entiers entre aujourd'hui et la date (négatif si dépassée). */
export function joursRestants(iso: string, maintenant = new Date()) {
  const cible = Date.parse(iso);
  const aujourdhui = Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  return Math.round((cible - aujourdhui) / JOUR_MS);
}

export function libelleJoursRestants(n: number) {
  if (n < 0) return "dépassée";
  if (n === 0) return "aujourd'hui";
  if (n === 1) return "demain";
  return `dans ${n} jours`;
}

/** « il y a 2 h », « hier », « il y a 6 jours » */
export function ilYa(iso: string, maintenant = new Date()) {
  const minutes = Math.round((maintenant.getTime() - Date.parse(iso)) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours === 1) return "hier";
  if (jours < 30) return `il y a ${jours} jours`;
  return `le ${dateCourte(iso)}`;
}
