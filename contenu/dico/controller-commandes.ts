import type { EntreeDico } from "@/contenu/types";

// Termes ajoutés par le module « Le controller prend les commandes » (projet Mario Kart).
export const termes: EntreeDico[] = [
  {
    id: "separation-commandes",
    mot: "Séparer décision et exécution",
    categorie: "Concept",
    definition:
      "Organisation où l'objet qui agit (le kart) expose des commandes simples (accélérer, tourner, sauter), et où un autre objet (un controller) décide quand les appeler. Le même kart peut alors être piloté par un joueur, une IA ou un replay, et ses règles s'appliquent à tous de la même façon.",
    simple: "Le kart obéit, le pilote décide : on peut changer de pilote sans changer de kart.",
    code: "Kart->SetThrottleInput(1.f); // joueur ou IA, même appel",
  },
  {
    id: "getpawn",
    mot: "GetPawn",
    categorie: "Fonction Unreal",
    definition:
      "Fonction d'un Controller qui renvoie le Pawn qu'il possède, ou nullptr s'il n'en possède pas. La version GetPawn<AMaClasse>() fait aussi le Cast : elle renvoie nullptr si le pawn n'est pas de cette classe.",
    simple: "« Quel pawn est-ce que je pilote ? »",
    code: "AKartPawn* Kart = GetPawn<AKartPawn>();",
  },
];
