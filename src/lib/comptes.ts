import "server-only";
import { randomInt } from "node:crypto";

const mots = [
  "volant", "turbo", "drift", "piste", "virage", "kart", "pneu", "moteur", "boost", "podium",
  "chrono", "tour", "nitro", "casque", "circuit", "sprint", "bolide", "rampe", "saut", "depart",
  "pixel", "manette", "niveau", "sprite", "shader", "camera", "ressort", "vecteur", "boucle", "octet",
];

/** Mot de passe facile à dicter en classe, ex. « virage-nitro-47 ». */
export function motDePasseProvisoire() {
  const a = mots[randomInt(mots.length)];
  let b = mots[randomInt(mots.length)];
  while (b === a) b = mots[randomInt(mots.length)];
  return `${a}-${b}-${randomInt(10, 100)}`;
}

function nettoyer(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** « Inès », « Moreau » → « ines.moreau » */
export function identifiantDepuisNom(prenom: string, nom: string) {
  return `${nettoyer(prenom)}.${nettoyer(nom)}`;
}

/** Ajoute 2, 3… si l'identifiant est déjà pris. */
export function identifiantLibre(base: string, pris: Set<string>) {
  if (!pris.has(base)) return base;
  let i = 2;
  while (pris.has(`${base}${i}`)) i++;
  return `${base}${i}`;
}
