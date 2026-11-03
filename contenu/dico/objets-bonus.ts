import type { EntreeDico } from "@/contenu/types";

// Termes ajoutés par le module « Boîtes et objets bonus » (projet Mario Kart).
export const termes: EntreeDico[] = [
  {
    id: "data-asset",
    mot: "Data Asset",
    categorie: "Système Unreal",
    definition:
      "Asset du Content Browser qui ne contient que des données, sans logique de niveau. On crée une classe C++ qui hérite de UPrimaryDataAsset (ou UDataAsset), puis des assets de cette classe (clic droit > Miscellaneous > Data Asset). Un même asset est partagé par tout le jeu : il ne doit pas retenir d'état propre à un acteur.",
    simple: "Une fiche de réglages rangée dans un fichier, qu'on remplit dans l'éditeur.",
    code: "class UKartItemData : public UPrimaryDataAsset",
  },
  {
    id: "classe-abstraite",
    mot: "Classe abstraite (Abstract)",
    categorie: "Concept",
    definition:
      "Classe qui sert de modèle à ses enfants mais qu'on ne doit pas utiliser telle quelle. Dans Unreal, UCLASS(Abstract) empêche de la placer dans un niveau ou d'en créer un asset : seules ses classes enfants apparaissent dans les listes de l'éditeur.",
    simple: "Un parent qu'on n'utilise jamais seul, seulement à travers ses enfants.",
    code: "UCLASS(Abstract, BlueprintType)",
  },
  {
    id: "heritage",
    mot: "Héritage",
    categorie: "C++",
    definition:
      "Une classe enfant reprend tout ce que contient sa classe parente (variables, fonctions, composants) et y ajoute ses propres éléments. On l'écrit avec « : public Parent ». Le constructeur du parent s'exécute avant celui de l'enfant, et l'enfant peut appeler la version du parent avec Super::.",
    simple: "L'enfant a déjà tout ce qu'a le parent, et ajoute ce qui lui est propre.",
    code: "class AKartItemBox : public ARotatingObject",
  },
  {
    id: "polymorphisme",
    mot: "Polymorphisme",
    categorie: "Concept",
    definition:
      "Quand on appelle une fonction virtual à travers un pointeur vers la classe parente, c'est la version de la vraie classe de l'objet qui s'exécute. Le code qui appelle n'a pas besoin de connaître les classes enfants.",
    simple: "« Fais ton effet » : chaque objet répond à sa manière.",
    code: "CurrentItem->Activate(Kart); // version du turbo, du piège...",
  },
  {
    id: "ustruct",
    mot: "USTRUCT",
    categorie: "Macro Unreal",
    definition:
      "Macro placée devant une struct pour qu'Unreal la connaisse : ses UPROPERTY s'affichent dans l'éditeur et peuvent être sauvegardées. Le nom d'une struct Unreal commence par F, et elle contient GENERATED_BODY().",
    simple: "Un petit paquet de variables que l'éditeur sait afficher.",
    code: "USTRUCT(BlueprintType)\nstruct FKartItemPoolEntry { GENERATED_BODY() ... };",
  },
  {
    id: "tarray",
    mot: "TArray",
    categorie: "Classe Unreal",
    definition:
      "Le tableau dynamique d'Unreal : sa taille peut changer pendant le jeu. Num() donne le nombre d'éléments, [i] lit l'élément i (en commençant à 0), et une boucle for (... : Tableau) parcourt tous les éléments. En UPROPERTY, l'éditeur affiche un bouton + pour ajouter des lignes.",
    simple: "Une liste d'éléments du même type, qu'on peut agrandir.",
    code: "TArray<FKartItemPoolEntry> Entries;",
  },
  {
    id: "uactorcomponent",
    mot: "UActorComponent",
    categorie: "Classe Unreal",
    definition:
      "Composant sans position ni forme, qu'on ajoute à un acteur pour lui donner un comportement. Contrairement à un USceneComponent (caméra, mesh), il n'est attaché à rien : pas de SetupAttachment. Il permet de ranger une logique à part au lieu de tout mettre dans l'acteur.",
    simple: "Une brique de code qu'on ajoute à un acteur, comme un module.",
    code: "class UKartItemComponent : public UActorComponent",
  },
  {
    id: "findcomponentbyclass",
    mot: "FindComponentByClass",
    categorie: "Fonction Unreal",
    definition:
      "Fonction d'AActor qui renvoie le premier composant de la classe demandée sur cet acteur, ou nullptr s'il n'en a pas. Elle permet de travailler avec « n'importe quel acteur qui a tel composant » sans connaître sa classe exacte.",
    simple: "« As-tu un composant de ce type ? Donne-le-moi. »",
    code: "OtherActor->FindComponentByClass<UKartItemComponent>()",
  },
  {
    id: "getowner",
    mot: "GetOwner (composant)",
    categorie: "Fonction Unreal",
    definition:
      "Appelée dans un composant, elle renvoie l'acteur qui porte ce composant. On la convertit souvent avec Cast pour obtenir la classe exacte de l'acteur.",
    simple: "Le composant demande « à qui j'appartiens ? ».",
    code: "AKartPawn* Kart = Cast<AKartPawn>(GetOwner());",
  },
  {
    id: "sinus",
    mot: "Sinus (FMath::Sin)",
    categorie: "Maths",
    definition:
      "Fonction qui transforme un angle (en radians) en une valeur entre -1 et 1. Quand l'angle augmente régulièrement, le sinus monte, redescend et remonte en douceur, sans fin : parfait pour un mouvement qui oscille. Un tour complet correspond à un angle de 2 × PI.",
    simple: "Une vague qui monte et descend entre -1 et 1.",
    code: "FMath::Sin(Temps * Frequence * 2.f * PI) * Hauteur",
  },
  {
    id: "addlocalrotation",
    mot: "AddLocalRotation",
    categorie: "Fonction Unreal",
    definition:
      "Ajoute une rotation à un composant autour de ses propres axes (son repère local), et non ceux du monde. Si l'objet est déjà penché, la rotation suit son inclinaison : combinée sur les trois axes, elle fait culbuter l'objet.",
    simple: "Tourner autour de ses propres axes, pas ceux du monde.",
    code: "AnimatedRoot->AddLocalRotation(RotationSpeed * DeltaTime);",
  },
  {
    id: "frandrange",
    mot: "FMath::FRandRange",
    categorie: "Fonction Unreal",
    definition: "Renvoie un nombre à virgule tiré au hasard entre une valeur minimale et une valeur maximale.",
    simple: "Un nombre au hasard entre deux bornes.",
    code: "FMath::FRandRange(0.f, TotalWeight)",
  },
  {
    id: "tirage-pondere",
    mot: "Tirage pondéré",
    categorie: "Maths",
    definition:
      "Tirage au hasard où chaque possibilité a un poids : plus le poids est grand, plus elle a de chances de sortir. On tire un nombre entre 0 et la somme des poids, puis on retire les poids un par un jusqu'à ce que le nombre devienne négatif. La chance d'une possibilité vaut son poids divisé par le total.",
    simple: "Un tirage au sort où certaines cases sont plus larges que d'autres.",
  },
];
