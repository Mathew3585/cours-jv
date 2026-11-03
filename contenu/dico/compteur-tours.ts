import type { EntreeDico } from "@/contenu/types";

// Mots ajoutés par le module « Compteur de tours ».
// Déjà définis ailleurs et utilisés ici : vecteur, produit-scalaire, sign, cast, nullptr, super (pawn-controller),
// delegate, reference-const, fonction-const (game-mode).
export const termes: EntreeDico[] = [
  {
    id: "checkpoint",
    mot: "Checkpoint",
    categorie: "Concept",
    definition:
      "Point de passage obligatoire sur un circuit. On les numérote dans l'ordre du tour : la ligne d'arrivée ne valide le tour que si le kart les a tous traversés. Ils empêchent de tricher avec des raccourcis ou des allers-retours sur la ligne.",
    simple: "Une porte qu'il faut franchir pour que le tour compte.",
  },
  {
    id: "forward-vector",
    mot: "Forward vector",
    categorie: "Fonction Unreal",
    definition:
      "Direction vers laquelle pointe l'avant d'un acteur ou d'un composant, c'est-à-dire son axe X (la flèche rouge du gizmo dans l'éditeur). GetActorForwardVector et GetForwardVector la renvoient avec une longueur de 1.",
    simple: "La direction « devant moi » d'un objet.",
    code: "const FVector Avant = GetActorForwardVector();",
  },
  {
    id: "overlap",
    mot: "Overlap",
    categorie: "Système Unreal",
    definition:
      "Chevauchement entre deux objets qui ne se bloquent pas : ils se traversent, mais Unreal peut le signaler. L'event OnComponentBeginOverlap se déclenche au moment où un objet entre dans un composant ; il faut que les deux aient l'option Generate Overlap Events.",
    simple: "« Quelque chose vient d'entrer dans ma zone », sans choc.",
    code: "Box->OnComponentBeginOverlap.AddDynamic(this, &ALapZone::HandleBeginOverlap);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/collision-in-unreal-engine---overview",
  },
  {
    id: "profil-collision",
    mot: "Profil de collision",
    categorie: "Système Unreal",
    definition:
      "Préréglage qui dit comment un composant réagit à chaque type d'objet : il le bloque, le signale (overlap) ou l'ignore. « Trigger » ne bloque rien et signale les entrées ; « Pawn » est celui des personnages et véhicules ; « BlockAll » bloque tout.",
    simple: "La règle « je bloque, je signale ou j'ignore » d'un composant.",
    code: 'Box->SetCollisionProfileName(TEXT("Trigger"));',
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/collision-in-unreal-engine---overview",
  },
  {
    id: "uboxcomponent",
    mot: "UBoxComponent",
    categorie: "Classe Unreal",
    definition:
      "Composant de collision en forme de boîte. On règle sa taille avec Box Extent, qui donne la demi-taille sur chaque axe. Il sert souvent de zone de détection (trigger).",
    simple: "Une boîte qui détecte ce qui la touche ou entre dedans.",
    code: "Box->SetBoxExtent(FVector(50.f, 500.f, 200.f));",
  },
  {
    id: "uarrowcomponent",
    mot: "UArrowComponent",
    categorie: "Classe Unreal",
    definition:
      "Composant qui dessine une flèche pointant vers son axe X. Il ne fait rien en jeu : il sert à montrer une direction dans l'éditeur, et on peut lire cette direction dans le code.",
    simple: "Une flèche de repère, utile pour indiquer un sens.",
    code: "Arrow->SetArrowColor(FLinearColor::Green);",
  },
  {
    id: "adddynamic",
    mot: "AddDynamic",
    categorie: "Macro Unreal",
    definition:
      "Macro qui abonne une fonction à un délégué (delegate) dynamique. On lui donne l'objet (souvent this) et l'adresse de la fonction. Cette fonction doit être marquée UFUNCTION(), sinon Unreal ne peut pas la retrouver et l'abonnement ne marche pas.",
    simple: "« Quand cet événement arrive, appelle cette fonction-là. »",
    code: "Box->OnComponentBeginOverlap.AddDynamic(this, &ALapZone::HandleBeginOverlap);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/dynamic-delegates-in-unreal-engine",
  },
];
