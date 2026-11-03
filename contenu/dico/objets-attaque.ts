import type { EntreeDico } from "@/contenu/types";

// Mots ajoutés par le module « Pièges, projectiles et HUD ».
// Déjà définis ailleurs et utilisés ici : virtual, override, tsubclassof, cast, overlap, profil-collision, sweep,
// line-trace, fhitresult, adddynamic, bindwidget, nativeconstruct, nativetick (modules précédents),
// heritage, data-asset, findcomponentbyclass (objets-bonus).
export const termes: EntreeDico[] = [
  {
    id: "spawnactor",
    mot: "SpawnActor",
    categorie: "Fonction Unreal",
    definition:
      "Fonction du monde (UWorld) qui crée un nouvel acteur pendant la partie, à une position et une rotation données. On lui passe la classe à créer (souvent un Blueprint choisi avec TSubclassOf) et des options (FActorSpawnParameters : le propriétaire, que faire s'il touche déjà quelque chose...). Elle renvoie l'acteur créé, ou nullptr si la création a échoué.",
    simple: "Faire apparaître un acteur dans le niveau pendant le jeu.",
    code: "GetWorld()->SpawnActor<AActor>(ActorClass, Position, Rotation, Params);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/spawning-actors-in-unreal-engine",
  },
  {
    id: "owner",
    mot: "Owner (propriétaire)",
    categorie: "Concept",
    definition:
      "Chaque acteur peut avoir un propriétaire, un autre acteur qui « possède » celui-ci. On le donne à la création (FActorSpawnParameters::Owner) et on le relit avec GetOwner(). Ici, le piège ou le projectile retient le kart qui l'a lancé : il peut ainsi l'ignorer quelques instants.",
    simple: "L'acteur à qui appartient un autre acteur, par exemple le kart qui a lancé un projectile.",
    code: "if (Kart == GetOwner()) { ... }",
  },
  {
    id: "transformposition",
    mot: "TransformPosition",
    categorie: "Fonction Unreal",
    definition:
      "Fonction de FTransform qui convertit une position exprimée dans le repère d'un objet (devant, derrière, à droite de lui) en position dans le repère du monde. Elle tient compte de la position, de la rotation et de l'échelle de l'objet.",
    simple: "Transformer « 150 cm devant le kart » en vraie position dans le niveau.",
    code: "const FVector Position = Kart->GetActorTransform().TransformPosition(FVector(150.f, 0.f, 0.f));",
  },
  {
    id: "initiallifespan",
    mot: "InitialLifeSpan",
    categorie: "Système Unreal",
    definition:
      "Variable de AActor : durée de vie de l'acteur, en secondes. Si elle est plus grande que 0, l'acteur se détruit tout seul quand ce temps est écoulé. 0 (la valeur par défaut) veut dire « pour toujours ». Dans l'éditeur, elle s'appelle Initial Life Span.",
    simple: "Le minuteur d'autodestruction d'un acteur.",
    code: "InitialLifeSpan = 10.f;",
  },
  {
    id: "canal-collision",
    mot: "Canal de collision",
    categorie: "Système Unreal",
    definition:
      "Unreal range les objets par type (WorldStatic, WorldDynamic, Pawn...) et les rayons par canal (Visibility, Camera...). Chaque composant choisit, canal par canal, sa réponse : Block (bloque), Overlap (laisse passer mais signale) ou Ignore (ne voit rien). Entre deux objets, c'est la réponse la plus faible des deux qui gagne : il faut que les deux bloquent pour qu'il y ait un blocage.",
    simple: "Le réglage qui dit, type d'objet par type d'objet, si on bloque, si on signale ou si on ignore.",
    code: "Sphere->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/collision-response-reference-in-unreal-engine",
  },
  {
    id: "getgametimesincecreation",
    mot: "GetGameTimeSinceCreation",
    categorie: "Fonction Unreal",
    definition:
      "Fonction de AActor qui renvoie l'âge de l'acteur : le nombre de secondes de jeu écoulées depuis sa création. Pratique pour faire quelque chose seulement pendant les premiers instants de vie d'un acteur, sans timer.",
    simple: "Depuis combien de secondes cet acteur existe.",
    code: "if (GetGameTimeSinceCreation() < 0.5f) { ... }",
  },
  {
    id: "destroy",
    mot: "Destroy",
    categorie: "Fonction Unreal",
    definition:
      "Fonction de AActor qui retire l'acteur du niveau. Il disparaît à l'écran et ses composants sont détruits. Après l'appel, il ne faut plus se servir de l'acteur : on sort en général de la fonction juste après.",
    simple: "Supprimer un acteur du niveau.",
    code: "Destroy();",
  },
  {
    id: "mirrorbyvector",
    mot: "MirrorByVector",
    categorie: "Maths",
    definition:
      "Fonction de FVector qui renvoie la direction « en miroir » par rapport à une surface, dont on donne la normale. La partie de la direction qui rentre dans la surface est inversée, la partie qui longe la surface est gardée. C'est le rebond d'une balle de billard sur une bande.",
    simple: "Faire rebondir une direction sur un mur, comme une balle de billard.",
    code: "Direction = Direction.MirrorByVector(Hit.Normal);",
  },
  {
    id: "ease-out",
    mot: "Ease out (courbe qui ralentit)",
    categorie: "Maths",
    definition:
      "Courbe d'animation qui va vite au début puis ralentit en arrivant. Une formule simple : 1 - (1 - t)², avec t qui va de 0 à 1. À t = 0 elle vaut 0, à t = 1 elle vaut 1, mais elle monte beaucoup au début et presque plus à la fin. Le contraire s'appelle ease in.",
    simple: "Une animation qui démarre fort et s'arrête en douceur.",
    code: "const float EaseOut = 1.f - FMath::Square(1.f - Progress);",
  },
  {
    id: "tweakobjectptr",
    mot: "TWeakObjectPtr",
    categorie: "C++",
    definition:
      "Pointeur « faible » d'Unreal. Contrairement à un UPROPERTY TObjectPtr, il ne garde pas l'objet en vie : si l'objet est détruit, le pointeur devient nul tout seul. On vérifie avec IsValid() avant de s'en servir. Idéal pour écouter un objet qui peut disparaître sans en être responsable.",
    simple: "Un pointeur qui ne retient pas l'objet, et qui devient vide si l'objet disparaît.",
    code: "TWeakObjectPtr<UKartItemComponent> ItemComponent;\nif (ItemComponent.IsValid()) { ... }",
  },
  {
    id: "uimage",
    mot: "UImage",
    categorie: "Classe Unreal",
    definition:
      "Widget UMG qui affiche une image (une texture ou un matériau). En C++, SetBrushFromTexture change l'image affichée. On le relie à un élément du Widget Blueprint avec BindWidget, comme un UTextBlock.",
    simple: "Le widget qui affiche une image dans l'interface.",
    code: "ItemIcon->SetBrushFromTexture(Texture);",
  },
  {
    id: "onpossessedpawnchanged",
    mot: "OnPossessedPawnChanged",
    categorie: "Système Unreal",
    definition:
      "Delegate de AController (donc aussi des PlayerController). Il est envoyé chaque fois que le controller prend un nouveau pawn ou le lâche, avec l'ancien et le nouveau pawn en paramètres. Utile pour un widget qui doit suivre le pawn du joueur même s'il change ou n'existe pas encore.",
    simple: "L'event « le joueur vient de changer de pawn ».",
    code: "PlayerController->OnPossessedPawnChanged.AddUniqueDynamic(this, &UKartItemWidget::HandlePossessedPawnChanged);",
  },
  {
    id: "modulo",
    mot: "Modulo (%)",
    categorie: "C++",
    definition:
      "Opérateur qui donne le reste d'une division entière : 7 % 3 vaut 1. Il sert souvent à faire boucler un index dans une liste : (Index + 1) % Nombre repart à 0 après le dernier élément. Il ne marche qu'avec des entiers (pour les nombres à virgule, on utilise FMath::Fmod).",
    simple: "Le reste d'une division, pratique pour revenir au début d'une liste.",
    code: "Index = (Index + 1) % Liste.Num();",
  },
];
