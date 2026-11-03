import type { Projet } from "@/contenu/types";
import { pawnController } from "./modules/pawn-controller/module";
import { gameMode } from "./modules/game-mode/module";
import { compteurTours } from "./modules/compteur-tours/module";
import { widgetsHud } from "./modules/widgets-hud/module";
import { objetsBonus } from "./modules/objets-bonus/module";
import { objetsAttaque } from "./modules/objets-attaque/module";

export const marioKart: Projet = {
  slug: "mario-kart",
  titre: "Mario Kart",
  niveau: "JV3",
  techno: "Unreal Engine 5 · C++",
  description:
    "On construit un jeu de karting de A à Z : un kart pilotable fait maison, les règles de la course, le comptage des tours, l'interface et les objets bonus. Chaque module explique une partie du vrai code du projet.",
  modules: [pawnController, gameMode, compteurTours, widgetsHud, objetsBonus, objetsAttaque],
  fichiers: [
    { nom: "KartPawn.h", role: "Déclare le kart : composants, réglages, état", module: "pawn-controller" },
    { nom: "KartPawn.cpp", role: "Conduite, gravité, drift, boost, caméra", module: "pawn-controller" },
    { nom: "KartPlayerController.cpp", role: "Crée et affiche les widgets du joueur", module: "widgets-hud" },
    { nom: "KartGameMode.cpp", role: "Compte à rebours, départ, fin de course", module: "game-mode" },
    { nom: "LapZone.cpp", role: "Ligne d'arrivée et checkpoints", module: "compteur-tours" },
    { nom: "KartCountdownWidget.cpp", role: "Affiche 3, 2, 1, GO", module: "widgets-hud" },
    { nom: "KartRaceHudWidget.cpp", role: "Affiche le tour et le temps", module: "widgets-hud" },
    { nom: "RotatingObject.cpp", role: "Fait tourner et flotter un objet (parent de la boîte à bonus)", module: "objets-bonus" },
    { nom: "KartItemData.cpp", role: "Le Data Asset parent de tous les objets bonus", module: "objets-bonus" },
    { nom: "KartItemPoolData.cpp", role: "Table de tirage pondéré des objets", module: "objets-bonus" },
    { nom: "KartItemComponent.cpp", role: "La poche du kart : objet en main, roulette, utilisation", module: "objets-bonus" },
    { nom: "KartItemBox.cpp", role: "Boîte à bonus posée sur la piste", module: "objets-bonus" },
    { nom: "KartItemHazard.cpp", role: "Piège : fait partir le kart en tête-à-queue", module: "objets-attaque" },
    { nom: "KartItemProjectile.cpp", role: "Projectile qui rebondit sur les murs", module: "objets-attaque" },
    { nom: "KartItemWidget.cpp", role: "Case d'objet du HUD et roulette", module: "objets-attaque" },
  ],
};
