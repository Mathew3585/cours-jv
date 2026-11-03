import "server-only";

/** Vérification simple d'une adresse e-mail (le serveur d'e-mails fait le reste). */
export function estEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function majuscule(mot: string) {
  return mot
    .split("-")
    .map((m) => (m ? m[0].toLocaleUpperCase("fr") + m.slice(1).toLocaleLowerCase("fr") : m))
    .join("-");
}

/**
 * Devine le prénom et le nom à partir de l'adresse :
 * « ines.moreau@ecole.fr » → Ines Moreau, « jean-paul_durand2@… » → Jean-Paul Durand.
 * Le prof peut corriger ensuite dans la fiche élève.
 */
export function nomDepuisEmail(email: string) {
  const local = email.split("@")[0].replace(/\d+/g, " ");
  const morceaux = local.split(/[._\s]+/).filter(Boolean);
  if (morceaux.length === 0) return { prenom: "Élève", nom: "" };
  if (morceaux.length === 1) return { prenom: majuscule(morceaux[0]), nom: "" };
  return { prenom: majuscule(morceaux[0]), nom: morceaux.slice(1).map(majuscule).join(" ") };
}
