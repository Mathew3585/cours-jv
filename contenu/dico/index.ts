import type { EntreeDico } from "@/contenu/types";
import { termes as base } from "./base";
import { termes as pawnController } from "./pawn-controller";
import { termes as gameMode } from "./game-mode";
import { termes as compteurTours } from "./compteur-tours";
import { termes as widgetsHud } from "./widgets-hud";
import { termes as objetsBonus } from "./objets-bonus";
import { termes as objetsAttaque } from "./objets-attaque";
import { termes as controllerCommandes } from "./controller-commandes";

// Si deux fichiers définissent le même id, le premier gagne.
const tous = [...base, ...pawnController, ...gameMode, ...compteurTours, ...widgetsHud, ...objetsBonus, ...objetsAttaque, ...controllerCommandes];
const vus = new Set<string>();

export const dico: EntreeDico[] = tous
  .filter((t) => (vus.has(t.id) ? false : (vus.add(t.id), true)))
  .sort((a, b) => a.mot.localeCompare(b.mot, "fr", { sensitivity: "base" }));
