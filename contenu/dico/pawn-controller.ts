import type { EntreeDico } from "@/contenu/types";

// Termes ajoutés par le module Pawn Controller (le kart pilotable).
export const termes: EntreeDico[] = [
  // ---------- C++ ----------
  {
    id: "super",
    mot: "Super::",
    categorie: "C++",
    definition:
      "Raccourci d'Unreal qui désigne la classe parente. Super::Tick(DeltaTime) appelle la version de Tick écrite dans APawn avant d'ajouter notre propre code, pour ne pas perdre ce que le parent faisait.",
    simple: "« Fais d'abord ce que faisait mon parent. »",
    code: "Super::BeginPlay();",
  },
  {
    id: "nullptr",
    mot: "nullptr",
    categorie: "C++",
    definition:
      "Valeur d'un pointeur qui ne pointe vers rien. Utiliser un pointeur nul fait planter le jeu : on vérifie donc avec un if avant de s'en servir.",
    simple: "Une adresse vide : il n'y a rien au bout.",
    code: "if (EnhancedInput == nullptr)\n{\n\treturn;\n}",
  },
  {
    id: "cast",
    mot: "Cast",
    categorie: "Fonction Unreal",
    definition:
      "Fonction qui essaie de voir un objet comme une classe plus précise. Si l'objet est bien de cette classe (ou d'une classe enfant), on récupère un pointeur utilisable ; sinon on récupère nullptr.",
    simple: "« Es-tu vraiment un PlayerController ? Si oui, je te traite comme tel. »",
    code: "APlayerController* PC = Cast<APlayerController>(Controller);",
  },
  {
    id: "constexpr",
    mot: "static constexpr",
    categorie: "C++",
    definition:
      "Constante dont la valeur est connue dès la compilation et ne change jamais. Placée en haut du .cpp avec static, elle n'est visible que dans ce fichier. On lui donne un nom parlant au lieu d'écrire un nombre magique dans le code.",
    simple: "Un nombre fixe avec un nom, pour ne pas écrire 0.7 partout.",
    code: "static constexpr float WalkableFloorZ = 0.7f;",
  },
  {
    id: "operateur-ternaire",
    mot: "Opérateur ternaire ( ? : )",
    categorie: "C++",
    definition:
      "Un if/else qui tient sur une ligne et qui donne une valeur : condition ? valeur si vrai : valeur si faux.",
    simple: "« Si oui ceci, sinon cela », en une ligne.",
    code: "Rate = CurrentSpeed < 0.f ? BrakeDeceleration : Acceleration;",
  },
  {
    id: "passage-par-reference",
    mot: "Passage par référence (&)",
    categorie: "C++",
    definition:
      "Un paramètre suivi de & n'est pas une copie : la fonction travaille directement sur la variable de l'appelant. Sans const, elle peut la modifier, ce qui permet de renvoyer plusieurs résultats à la fois. Avec const, on évite seulement une copie.",
    simple: "On prête la variable elle-même, pas une photocopie.",
    code: "int32 TraceGroundUnderWheels(FVector& OutGroundPoint, FVector& OutGroundNormal) const;",
  },
  {
    id: "fonction-const",
    mot: "Fonction const",
    categorie: "C++",
    definition:
      "Une fonction membre suivie du mot const promet de ne modifier aucune variable de l'objet. Le compilateur refuse la compilation si elle essaie.",
    simple: "Une fonction qui regarde sans toucher.",
    code: "void ShowDebugInfo() const;",
  },

  // ---------- Classes et fonctions Unreal ----------
  {
    id: "createdefaultsubobject",
    mot: "CreateDefaultSubobject",
    categorie: "Fonction Unreal",
    definition:
      "Fonction qui crée un composant dans le constructeur d'un acteur. Le texte passé en paramètre est le nom du composant, celui qu'on voit dans le Blueprint. Elle ne s'utilise que dans le constructeur.",
    simple: "Fabrique une pièce du kart au moment de sa naissance.",
    code: 'BodyMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BodyMesh"));',
  },
  {
    id: "rootcomponent",
    mot: "RootComponent",
    categorie: "Classe Unreal",
    definition:
      "Le composant racine d'un acteur. La position et la rotation de l'acteur sont celles de sa racine ; tous les autres composants y sont attachés, directement ou non. Quand on déplace l'acteur avec un sweep, c'est la collision de la racine qui est testée.",
    simple: "Le tronc de l'arbre : quand il bouge, tout le reste suit.",
    code: "RootComponent = CollisionSphere;",
  },
  {
    id: "setupattachment",
    mot: "SetupAttachment",
    categorie: "Fonction Unreal",
    definition:
      "Attache un composant à un autre dans le constructeur. L'enfant suit alors tous les mouvements et rotations du parent, et sa position est décrite par rapport à lui.",
    simple: "On visse une pièce sur une autre.",
    code: "WheelFrontLeft->SetupAttachment(BodyMesh);",
  },
  {
    id: "springarm",
    mot: "SpringArm (bras à ressort)",
    categorie: "Classe Unreal",
    definition:
      "Composant qui tient un enfant (souvent la caméra) au bout d'un bras de longueur TargetArmLength. Si un mur se trouve entre le kart et la caméra, le bras se raccourcit. Il peut ajouter du retard (lag) en position et en rotation.",
    simple: "Une perche à selfie qui tient la caméra derrière le kart.",
    code: "SpringArm->TargetArmLength = 600.f;",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/using-spring-arm-components-in-unreal-engine",
  },
  {
    id: "fov",
    mot: "FOV (champ de vision)",
    categorie: "Concept",
    definition:
      "Angle, en degrés, que la caméra voit de gauche à droite. Un FOV plus large montre plus de choses et étire les bords de l'image, ce qui donne une impression de vitesse.",
    simple: "La largeur du regard de la caméra.",
    code: "Camera->SetFieldOfView(NewFieldOfView);",
  },
  {
    id: "gamemode",
    mot: "GameMode",
    categorie: "Classe Unreal",
    definition:
      "Acteur unique qui porte les règles de la partie. On le récupère avec GetWorld()->GetAuthGameMode(). Dans ce projet, AKartGameMode gère le compte à rebours, les tours et la fin de course.",
    simple: "L'arbitre de la partie.",
    code: "GetWorld()->GetAuthGameMode<AKartGameMode>()",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/game-mode-and-game-state-in-unreal-engine",
  },
  {
    id: "input-mapping-context",
    mot: "Input Mapping Context",
    categorie: "Système Unreal",
    definition:
      "Asset de l'Enhanced Input qui relie des touches et des boutons de manette aux Input Actions. Il ne sert à rien tant qu'on ne l'a pas ajouté au sous-système Enhanced Input du joueur avec AddMappingContext.",
    simple: "La liste « telle touche = telle action ».",
    code: "Subsystem->AddMappingContext(KartMappingContext, 0);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/enhanced-input-in-unreal-engine",
  },
  {
    id: "bindaction",
    mot: "BindAction",
    categorie: "Fonction Unreal",
    definition:
      "Fonction de l'Enhanced Input Component qui relie une Input Action et un moment (Started, Triggered, Completed...) à une fonction de notre classe. Quand l'événement arrive, Unreal appelle la fonction.",
    simple: "« Quand on appuie sur Sauter, appelle OnJumpPressed. »",
    code: "EnhancedInput->BindAction(JumpAction, ETriggerEvent::Started, this, &AKartPawn::OnJumpPressed);",
  },
  {
    id: "trigger-event",
    mot: "ETriggerEvent",
    categorie: "Système Unreal",
    definition:
      "Le moment où une Input Action prévient le code. Started : une fois, au moment de l'appui. Triggered : à chaque image tant que l'action est active. Completed : une fois, quand on relâche.",
    simple: "Au début, pendant, ou à la fin de l'appui.",
    code: "ETriggerEvent::Triggered",
  },
  {
    id: "finputactionvalue",
    mot: "FInputActionValue",
    categorie: "Classe Unreal",
    definition:
      "La valeur envoyée par une Input Action : un booléen pour un bouton, un nombre pour un axe 1D, un FVector2D pour un joystick. On la lit avec Get, en précisant le type attendu.",
    simple: "Le colis envoyé par la touche, qu'on ouvre avec Get.",
    code: "ThrottleInput = Value.Get<float>();",
  },
  {
    id: "line-trace",
    mot: "Line trace (rayon)",
    categorie: "Fonction Unreal",
    definition:
      "Test qui lance un rayon invisible d'un point de départ à un point d'arrivée et dit s'il touche quelque chose. LineTraceSingleByChannel ne garde que le premier objet touché et remplit un FHitResult.",
    simple: "Un laser invisible qui dit ce qu'il rencontre.",
    code: "GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params)",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/traces-with-raycasts-in-unreal-engine",
  },
  {
    id: "fhitresult",
    mot: "FHitResult",
    categorie: "Classe Unreal",
    definition:
      "Structure remplie par un rayon ou un sweep quand il touche quelque chose : bBlockingHit (a-t-on touché ?), ImpactPoint (où), Normal et ImpactNormal (orientation de la surface), Time (à quelle fraction du trajet), bStartPenetrating (on était déjà dedans au départ).",
    simple: "Le rapport d'accident : où, quoi, dans quel angle.",
    code: "FHitResult Hit;",
  },
  {
    id: "sweep",
    mot: "Sweep",
    categorie: "Concept",
    definition:
      "Déplacement qui teste la collision tout le long du trajet. Avec sweep, la forme de collision s'arrête au premier obstacle au lieu de le traverser. Le dernier paramètre de AddActorWorldOffset peut récupérer le FHitResult du choc.",
    simple: "On fait glisser la sphère au lieu de la téléporter.",
    code: "AddActorWorldOffset(Delta, true, &Hit);",
  },
  {
    id: "frotator",
    mot: "FRotator (Pitch, Yaw, Roll)",
    categorie: "Classe Unreal",
    definition:
      "Rotation décrite par trois angles en degrés, dans cet ordre : Pitch (lever ou baisser le nez, autour de Y), Yaw (tourner à gauche ou à droite, autour de Z), Roll (pencher sur le côté, autour de X).",
    simple: "Hocher la tête, dire non, pencher la tête.",
    code: "FRotator(0.f, YawDelta, 0.f)",
  },
  {
    id: "quaternion",
    mot: "Quaternion (FQuat)",
    categorie: "Maths",
    definition:
      "Autre façon de stocker une rotation, avec quatre nombres. Moins lisible qu'un FRotator, mais sans les blocages des angles (vers 90° de Pitch) et pratique pour enchaîner deux rotations (en les multipliant) ou passer en douceur de l'une à l'autre (Slerp).",
    simple: "Une rotation « en boîte noire », fiable pour les calculs.",
    code: "FQuat::Slerp(GetActorQuat(), TargetRotation, Alpha)",
  },
  {
    id: "gengine",
    mot: "GEngine",
    categorie: "Classe Unreal",
    definition:
      "Pointeur global vers le moteur. On s'en sert souvent pour AddOnScreenDebugMessage, qui écrit un texte de debug en haut à gauche de l'écran. On vérifie qu'il n'est pas nul avant de l'utiliser.",
    simple: "Le moteur lui-même, accessible de partout.",
    code: 'GEngine->AddOnScreenDebugMessage(1, 0.f, FColor::White, TEXT("Hello"));',
  },
  {
    id: "repere-local",
    mot: "Repère local / repère monde",
    categorie: "Concept",
    definition:
      "Une position ou une rotation peut se mesurer par rapport au monde (World) ou par rapport à l'objet lui-même ou à son parent (Local, Relative). « Avancer en local », c'est avancer vers son propre avant, quelle que soit la direction dans le monde.",
    simple: "« À ma droite » ou « à l'est » : ça dépend de qui regarde.",
    code: "AddActorLocalRotation(FRotator(0.f, YawDelta, 0.f));",
  },

  // ---------- Maths ----------
  {
    id: "vecteur",
    mot: "Vecteur (FVector)",
    categorie: "Maths",
    definition:
      "Une flèche dans l'espace, décrite par trois nombres X, Y, Z. Dans Unreal, X va vers l'avant, Y vers la droite, Z vers le haut, en centimètres. Un vecteur sert à la fois de position (où) et de direction (vers où, et de combien).",
    simple: "Une flèche : une direction et une longueur.",
    code: "FVector Delta = Forward * CurrentSpeed * DeltaTime;",
  },
  {
    id: "vecteur-unitaire",
    mot: "Vecteur unitaire (normaliser)",
    categorie: "Maths",
    definition:
      "Vecteur de longueur 1 : il ne donne qu'une direction. Normaliser, c'est ramener un vecteur à la longueur 1 sans changer sa direction. GetSafeNormal le fait sans planter si le vecteur est nul (il renvoie alors (0,0,0)).",
    simple: "Une flèche de longueur 1, qui dit juste « par là ».",
    code: "Forward = Forward.GetSafeNormal();",
  },
  {
    id: "normale",
    mot: "Normale",
    categorie: "Maths",
    definition:
      "Vecteur unitaire perpendiculaire à une surface, qui pointe vers l'extérieur. Un sol plat a pour normale (0,0,1), un mur a une normale horizontale. La normale dit donc comment la surface est penchée.",
    simple: "Le bâton planté droit dans la surface.",
    code: "FVector GroundNormal = FVector::UpVector;",
  },
  {
    id: "produit-scalaire",
    mot: "Produit scalaire (DotProduct)",
    categorie: "Maths",
    definition:
      "Opération qui prend deux vecteurs et renvoie un nombre : A.X*B.X + A.Y*B.Y + A.Z*B.Z. Pour deux vecteurs unitaires, il vaut 1 s'ils pointent dans le même sens, 0 s'ils sont perpendiculaires, -1 s'ils sont opposés. Avec un vecteur quelconque et un vecteur unitaire, il donne la longueur de la partie du premier qui va dans la direction du second.",
    simple: "« À quel point ces deux flèches vont-elles dans le même sens ? »",
    code: "FVector::DotProduct(Hit.ImpactNormal, Up) >= WalkableFloorZ",
  },
  {
    id: "produit-vectoriel",
    mot: "Produit vectoriel (CrossProduct)",
    categorie: "Maths",
    definition:
      "Opération qui prend deux vecteurs et renvoie un troisième vecteur perpendiculaire aux deux. Si les deux vecteurs sont posés à plat sur une surface, le résultat est donc la normale de cette surface. Inverser l'ordre des deux vecteurs inverse le sens du résultat.",
    simple: "Deux flèches posées sur la table donnent la flèche qui sort de la table.",
    code: "FVector::CrossProduct(DiagonalA, DiagonalB)",
  },
  {
    id: "projection-plan",
    mot: "Projection sur un plan",
    categorie: "Maths",
    definition:
      "Retirer d'un vecteur sa partie qui va dans la direction de la normale d'un plan. Ce qui reste est couché sur le plan, comme l'ombre de la flèche posée sur ce plan. FVector::VectorPlaneProject fait ce calcul.",
    simple: "On écrase la flèche à plat sur le sol.",
    code: "FVector::VectorPlaneProject(Forward, GroundNormal)",
  },
  {
    id: "lerp",
    mot: "Lerp (interpolation linéaire)",
    categorie: "Maths",
    definition:
      "Lerp(A, B, Alpha) mélange deux valeurs : A + (B - A) * Alpha. Alpha = 0 donne A, Alpha = 1 donne B, Alpha = 0.5 donne le milieu.",
    simple: "Un curseur entre deux valeurs.",
    code: "FMath::Lerp(BaseFieldOfView, MaxSpeedFieldOfView, SpeedRatio)",
  },
  {
    id: "finterpto",
    mot: "FInterpTo",
    categorie: "Fonction Unreal",
    definition:
      "Rapproche une valeur de sa cible d'une fraction de la distance restante à chaque image (fraction = vitesse × DeltaTime). Le mouvement est rapide quand on est loin et ralentit en approchant : c'est doux, sans à-coup.",
    simple: "On fait un bout du chemin restant à chaque image, comme un aimant qui adoucit.",
    code: "FMath::FInterpTo(Current, Target, DeltaTime, InterpSpeed)",
  },
  {
    id: "finterpconstantto",
    mot: "FInterpConstantTo",
    categorie: "Fonction Unreal",
    definition:
      "Rapproche une valeur de sa cible d'un pas constant (vitesse × DeltaTime) à chaque image, et s'arrête pile sur la cible sans la dépasser. Le changement est régulier, comme un moteur qui accélère toujours autant.",
    simple: "On avance à pas réguliers jusqu'à la cible.",
    code: "FMath::FInterpConstantTo(CurrentSpeed, TargetSpeed, DeltaTime, Rate)",
  },
  {
    id: "smoothstep",
    mot: "SmoothStep",
    categorie: "Maths",
    definition:
      "Transforme une valeur qui monte de façon régulière entre deux bornes en une courbe en S entre 0 et 1 : départ doux, accélération au milieu, arrivée douce.",
    simple: "Une montée qui démarre et finit en douceur.",
    code: "FMath::SmoothStep(0.f, 1.f, DriftBlend)",
  },
  {
    id: "clamp",
    mot: "Clamp",
    categorie: "Maths",
    definition:
      "Bloque une valeur entre un minimum et un maximum. FMath::Clamp(X, 0, 1) renvoie 0 si X est négatif, 1 si X dépasse 1, et X sinon.",
    simple: "Des butées : la valeur ne sort pas de la boîte.",
    code: "FMath::Clamp(CurrentSpeed / MaxForwardSpeed, 0.f, 1.f)",
  },
  {
    id: "sign",
    mot: "Sign",
    categorie: "Maths",
    definition: "FMath::Sign renvoie +1 si un nombre est positif, -1 s'il est négatif, 0 s'il vaut 0.",
    simple: "Ne garde que le signe d'un nombre.",
    code: "FMath::Sign(CurrentSpeed)",
  },
  {
    id: "radian",
    mot: "Radian",
    categorie: "Maths",
    definition:
      "Autre unité d'angle que le degré. Un angle d'un radian, c'est l'angle pour lequel l'arc parcouru sur le cercle est égal au rayon. Un tour complet vaut 2π radians, environ 6,28. D'où la formule : angle (en radians) = distance parcourue / rayon.",
    simple: "L'unité d'angle qui relie directement la distance roulée et le rayon de la roue.",
    code: "FMath::RadiansToDegrees(Distance / WheelRadius)",
  },
  {
    id: "fmod",
    mot: "Fmod",
    categorie: "Maths",
    definition:
      "Reste d'une division pour des nombres à virgule, comme l'opérateur % des entiers. FMath::Fmod(370, 360) vaut 10. Le résultat garde le signe du premier nombre.",
    simple: "Ce qui reste quand on retire des tours complets.",
    code: "FMath::Fmod(WheelSpinAngle, 360.f)",
  },
  {
    id: "hysteresis",
    mot: "Hystérésis",
    categorie: "Concept",
    definition:
      "Utiliser deux seuils différents pour entrer dans un état et pour en sortir. Ça évite qu'une valeur proche du seuil fasse clignoter l'état à chaque image (au sol, en l'air, au sol...).",
    simple: "Un seuil pour entrer, un autre pour sortir, pour éviter de clignoter.",
  },
];
