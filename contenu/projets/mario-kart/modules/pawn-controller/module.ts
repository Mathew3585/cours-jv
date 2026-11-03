import type { Module } from "@/contenu/types";


export const pawnController: Module = {
  slug: "pawn-controller",
  titre: "Pawn Controller",
  resume: "Le kart pilotable : input, déplacement, gravité, drift, caméra",
  intro:
    "Le Pawn, c'est le kart que le joueur contrôle. On lit d'abord son header, puis son fichier .cpp de la première à la dernière ligne, en huit leçons qui se suivent : tu peux le recopier au fur et à mesure.",
  fichiers: ["KartPawn.h", "KartPawn.cpp", "KartPlayerController.h", "KartPlayerController.cpp"],
  lecons: [
    {
      slug: "header-kartpawn",
      titre: "Le header KartPawn.h",
      resume: "La carte d'identité du kart : macros, composants, réglages et état",
      dureeMin: 20,
      fichiers: ["KartPawn.h"],
      charger: () => import("./header-kartpawn.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/header-kartpawn",
        questions: [
          {
            type: "vrai-faux",
            enonce: "KartPawn.generated.h peut être placé au début de la liste des #include.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Il doit toujours être le dernier #include du header : un include ajouté après lui fait échouer la compilation avec une erreur peu claire.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le header peut-il se contenter de « class USphereComponent; » au lieu d'inclure le fichier de la sphère ?",
            choix: [
              "Parce que USphereComponent est déjà incluse par CoreMinimal.h",
              "Parce que le header n'utilise que des pointeurs vers cette classe : savoir qu'elle existe suffit, et le header compile plus vite",
              "Parce que la sphère n'est pas utilisée dans le .cpp",
              "Parce qu'Unreal inclut automatiquement tous les composants",
            ],
            bonne: 1,
            explication:
              "C'est une déclaration anticipée : pour un pointeur, le compilateur n'a pas besoin du contenu de la classe. Le vrai #include est dans le .cpp, où l'on appelle ses fonctions (SetSphereRadius…).",
          },
          {
            type: "code",
            enonce: "De quelle classe hérite notre kart ?",
            code: "class KARTGAMES_API AKartPawn : public ____",
            choix: ["AActor", "ACharacter", "APawn", "UObject"],
            bonne: 2,
            explication:
              "Le kart est un Pawn : un Actor qu'un Controller peut posséder. ACharacter apporterait un mouvement tout fait de personnage, alors que notre kart calcule tout lui-même.",
          },
          {
            type: "code",
            enonce: "Quel mot manque pour que Tick remplace la version de APawn ?",
            code: "virtual void Tick(float DeltaTime) ____;",
            choix: ["final", "override", "static", "const"],
            bonne: 1,
            explication: "override indique qu'on redéfinit une fonction virtuelle de la classe parente. Le compilateur vérifie que la signature correspond.",
          },
          {
            type: "code",
            enonce: "Pourquoi CanMove est-elle BlueprintPure, alors que SetCanMove est BlueprintCallable ?",
            code: "UFUNCTION(BlueprintPure, Category = \"Kart\")\nbool CanMove() const { return bCanMove; }",
            choix: [
              "CanMove lit une valeur sans rien modifier ; SetCanMove change bCanMove",
              "BlueprintPure rend la fonction plus rapide à exécuter",
              "Une fonction écrite dans le header doit toujours être BlueprintPure",
              "SetCanMove ne peut pas être appelée depuis un Blueprint",
            ],
            bonne: 0,
            explication:
              "BlueprintPure est réservé aux fonctions qui lisent sans modifier (d'où le const). SetCanMove modifie l'état du kart : elle est BlueprintCallable.",
          },
          {
            type: "qcm",
            enonce: "Quelle est la différence entre CollisionSphere (VisibleAnywhere) et MaxForwardSpeed (EditAnywhere) ?",
            choix: [
              "Aucune, les deux options sont synonymes",
              "VisibleAnywhere cache la variable pendant le Play",
              "EditAnywhere ne marche que pour les composants",
              "On voit le composant dans l'éditeur mais on ne peut pas le remplacer ; la vitesse, elle, se modifie",
            ],
            bonne: 3,
            explication:
              "VisibleAnywhere : on voit la variable (et on peut régler les propriétés du composant) mais on ne peut pas changer le pointeur lui-même. EditAnywhere : on change sa valeur dans l'éditeur, sans recompiler.",
          },
          {
            type: "code",
            enonce: "Un designer tape 1.5 dans la case WallSpeedFactor de l'éditeur. Que se passe-t-il ?",
            code: "UPROPERTY(EditAnywhere, Category = \"Kart|Movement\", meta = (ClampMin = \"0\", ClampMax = \"1\"))\nfloat WallSpeedFactor = 0.3f;",
            choix: [
              "Le kart accélère de 50 % en touchant un mur",
              "La valeur est bloquée à 1 : l'éditeur refuse de sortir de la plage 0 à 1",
              "La compilation échoue",
              "La valeur est remise à 0.3",
            ],
            bonne: 1,
            explication:
              "meta = (ClampMin, ClampMax) limite ce qu'on peut taper dans l'éditeur. Une part de vitesse conservée n'a de sens qu'entre 0 (arrêt net) et 1 (aucune perte).",
          },
          {
            type: "qcm",
            enonce: "Laquelle de ces variables est une variable d'état, et pas un réglage ?",
            choix: ["TurnRate", "DriftEnterTime", "BoostSpeed", "bIsDrifting"],
            bonne: 3,
            explication:
              "bIsDrifting change pendant la partie, selon ce que fait le joueur : c'est l'état. Les trois autres sont choisis avant de jouer en EditAnywhere. L'état est en VisibleAnywhere pour le voir évoluer pendant le Play.",
          },
          {
            type: "code",
            enonce: "À quoi servent les & dans les paramètres de cette fonction ?",
            code: "int32 TraceGroundUnderWheels(FVector& OutGroundPoint, FVector& OutGroundNormal) const;",
            choix: [
              "À renvoyer plusieurs résultats : la fonction écrit directement dans les variables de l'appelant",
              "À rendre les vecteurs constants",
              "À copier les vecteurs pour aller plus vite",
              "À indiquer que les paramètres sont facultatifs",
            ],
            bonne: 0,
            explication:
              "Un paramètre passé par référence (&) est la variable de l'appelant elle-même. La fonction renvoie le nombre de roues au sol, et remplit en plus le point et la pente du sol.",
          },
          {
            type: "vrai-faux",
            enonce: "Les étapes du Tick sont déclarées dans le header (lignes 388 à 398) exactement dans l'ordre où le Tick les appelle.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le commentaire dit « dans l'ordre », mais le header range UpdateBoost après UpdateDrift, alors que le Tick l'appelle en deuxième. L'ordre qui compte est celui du Tick.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/header-kartpawn/sections",
          enonce: "Le header range ses variables en trois familles : composants, réglages et état. Explique avec tes mots la différence entre un réglage et une variable d'état, avec un exemple de chaque.",
          attendus:
            "Réglage : valeur choisie par le designer avant de jouer, ne change pas pendant la partie (MaxForwardSpeed, TurnRate). État : valeur calculée pendant la partie, change à chaque image (CurrentSpeed, bIsDrifting).",
        },
      ],
    },
    {
      slug: "cpp-constructeur-beginplay",
      titre: "KartPawn.cpp (1/8) : includes, constructeur et BeginPlay",
      resume: "Lignes 1 à 108 : les includes, deux constantes, la fabrication des composants et l'entrée en jeu",
      dureeMin: 20,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-constructeur-beginplay.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-constructeur-beginplay",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi KartPawn.cpp inclut-il KartPawn.h en tout premier ?",
            choix: [
              "Parce que les autres includes en ont besoin pour compiler",
              "Pour que le .cpp compile plus vite",
              "Pour que s'il manque un include dans KartPawn.h, l'erreur apparaisse tout de suite ici",
              "Parce qu'Unreal refuse un .cpp qui commence par un autre include",
            ],
            bonne: 2,
            explication:
              "Inclus en premier, le header doit compiler avec ses seuls includes. S'il dépend d'un fichier qu'il n'inclut pas, on le voit immédiatement, au lieu d'être sauvé par hasard par un include placé avant lui.",
          },
          {
            type: "code",
            enonce: "Que signifie le mot static devant cette constante ?",
            code: "static constexpr float WalkableFloorZ = 0.7f;",
            choix: [
              "La constante n'est visible que dans KartPawn.cpp",
              "La valeur peut être modifiée dans l'éditeur",
              "La constante est recalculée à chaque image",
              "Chaque kart a sa propre copie modifiable",
            ],
            bonne: 0,
            explication:
              "static rend la constante visible seulement dans ce fichier, et constexpr en fait une vraie constante. Un nom comme WalkableFloorZ dit ce que signifie 0,7, et on le change à un seul endroit.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi la sphère de collision est-elle le RootComponent du kart ?",
            choix: [
              "Parce que c'est le premier composant créé",
              "Parce qu'une sphère est toujours invisible",
              "Parce qu'Unreal interdit qu'un mesh soit racine",
              "Parce que déplacer le kart revient à déplacer sa racine, et c'est sa collision qui est testée",
            ],
            bonne: 3,
            explication:
              "La position de l'acteur est celle de sa racine. Quand on déplace le kart avec un sweep, c'est la forme de collision de la racine, la sphère, qui s'arrête contre les murs.",
          },
          {
            type: "code",
            enonce: "Pourquoi le constructeur désactive-t-il la physique simulée de la sphère ?",
            code: "CollisionSphere->SetSimulatePhysics(false);\nRootComponent = CollisionSphere;",
            choix: [
              "Parce que la physique simulée ne marche pas avec une sphère",
              "Parce que c'est notre code qui calcule vitesse, gravité et déplacement à chaque image",
              "Pour que la sphère ne bloque plus contre les murs",
              "Pour que le kart soit plus léger",
            ],
            bonne: 1,
            explication:
              "Le kart est fait maison : ni masse ni forces calculées par le moteur. La sphère garde sa collision (profil Pawn), mais c'est le Tick qui la déplace.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi les roues sont-elles attachées au châssis (BodyMesh) et pas à la sphère ?",
            choix: [
              "Pour qu'elles aient une collision",
              "Pour qu'elles suivent le châssis quand il se met de travers pendant le drift",
              "Pour qu'elles tournent plus vite",
              "Parce que la sphère n'accepte qu'un seul enfant",
            ],
            bonne: 1,
            explication:
              "Pendant le drift, on tourne le châssis. Les roues, attachées à lui, suivent ce mouvement automatiquement. Leur collision est coupée, comme celle du châssis.",
          },
          {
            type: "code",
            enonce: "Pourquoi le bras de caméra a-t-il du retard en rotation mais pas en position ?",
            code: "SpringArm->bEnableCameraLag = false;\n\n// Retard en rotation seulement : la caméra suit les virages en douceur\nSpringArm->bEnableCameraRotationLag = true;",
            choix: [
              "Parce qu'Unreal n'autorise qu'un seul des deux retards",
              "Pour que la caméra reste toujours exactement derrière le kart, même en virage",
              "Un retard en position ferait trembler le kart d'avant en arrière à l'écran à grande vitesse ; le retard en rotation adoucit les virages",
              "Pour économiser des calculs",
            ],
            bonne: 2,
            explication:
              "Le commentaire de la ligne 65 explique le tremblement à grande vitesse. En rotation, le retard est voulu : la caméra suit le virage en douceur au lieu de tourner sèchement.",
          },
          {
            type: "vrai-faux",
            enonce: "On pourrait lire le GameMode dans le constructeur plutôt que dans BeginPlay.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le constructeur s'exécute aussi en dehors de toute partie (à l'ouverture de l'éditeur), quand il n'y a ni monde ni GameMode. Tout ce qui a besoin du monde se fait dans BeginPlay.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay note-t-elle la rotation de départ du châssis, du bras et des roues ?",
            choix: [
              "Pour remettre le kart à zéro à la fin de la course",
              "Pour tourner les pièces par-dessus cette rotation sans écraser le réglage du Blueprint",
              "Pour l'afficher dans le debug",
              "Pour calculer la vitesse du kart",
            ],
            bonne: 1,
            explication:
              "Les modèles ont parfois besoin d'être tournés dans le Blueprint. Le code ajoute ses rotations (drift, braquage, pente) à cette rotation de départ au lieu de la remplacer.",
          },
          {
            type: "code",
            enonce: "Le niveau utilise un autre GameMode que AKartGameMode. Que vaut bCanMove après BeginPlay ?",
            code: "if (const AKartGameMode* GameMode = GetWorld()->GetAuthGameMode<AKartGameMode>())\n{\n\tbCanMove = GameMode->IsRaceStarted();",
            choix: [
              "false : le kart attend le GO pour toujours",
              "Le jeu plante, car GameMode vaut nullptr",
              "Ça dépend de IsRaceStarted",
              "true : le if est sauté et bCanMove garde sa valeur par défaut",
            ],
            bonne: 3,
            explication:
              "GetAuthGameMode<AKartGameMode>() renvoie nullptr, donc la condition du if est fausse et son bloc n'est jamais exécuté. bCanMove reste à true : pratique pour tester la conduite sur une carte de test.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay recopie-t-elle la case de debug du GameMode dans bShowDebug ?",
            choix: [
              "Pour que le Tick lise une simple variable au lieu de redemander au GameMode à chaque image",
              "Parce que le GameMode est détruit après BeginPlay",
              "Pour pouvoir cocher la case pendant la partie",
              "Parce que ShowDebugInfo ne peut pas lire le GameMode",
            ],
            bonne: 0,
            explication:
              "La case ne change pas pendant la partie : on la lit une seule fois. Conséquence : la cocher pendant le Play n'a aucun effet, elle n'est lue qu'au lancement.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-constructeur-beginplay/sphere",
          enonce: "Le kart se cogne aux murs avec une sphère invisible, pas avec le mesh du châssis. Donne deux raisons de ce choix.",
          attendus:
            "Une sphère n'a ni coins ni arêtes : elle ne se coince pas sur une marche, un bord de route ou entre deux morceaux de décor, elle glisse. Son test de collision est simple et rapide. Une seule forme gère tous les chocs, les meshes sont purement visuels (collision coupée).",
        },
      ],
    },
    {
      slug: "cpp-tours-branchement-input",
      titre: "KartPawn.cpp (2/8) : direction, tours et branchement des touches",
      resume: "Lignes 109 à 215 : GetMoveDirection, le comptage des tours, puis le Mapping Context et les BindAction",
      dureeMin: 20,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-tours-branchement-input.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-tours-branchement-input",
        questions: [
          {
            type: "code",
            enonce: "Le kart recule : CurrentSpeed vaut -300. Que renvoie cette ligne ?",
            code: "return GetActorForwardVector() * FMath::Sign(CurrentSpeed);",
            choix: [
              "La flèche vers l'avant du kart, multipliée par 300",
              "La flèche vers l'arrière du kart, de longueur 1",
              "Une flèche nulle",
              "La flèche vers l'avant du kart, de longueur 1",
            ],
            bonne: 1,
            explication:
              "Sign ne garde que le signe : -1 ici. L'avant multiplié par -1 donne l'arrière, toujours de longueur 1. À l'arrêt, Sign(0) vaudrait 0 et la flèche serait nulle.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi GetMoveDirection est-elle déclarée const ?",
            choix: [
              "Parce qu'elle renvoie toujours la même flèche",
              "Parce qu'elle ne peut être appelée qu'une fois",
              "Parce qu'elle lit l'état du kart sans rien modifier",
              "Parce que les fonctions BlueprintPure ne peuvent rien renvoyer",
            ],
            bonne: 2,
            explication:
              "const promet que la fonction ne modifie pas le kart : le compilateur refuserait par exemple qu'elle change CurrentSpeed. Les zones de tour peuvent l'appeler sans risque.",
          },
          {
            type: "code",
            enonce: "NextCheckpoint vaut 2. Le kart prend un raccourci et traverse la zone 3. Que se passe-t-il ?",
            code: "if (ZoneIndex == NextCheckpoint)\n{\n\t++NextCheckpoint;\n}\nelse if (ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount())\n{\n\tCompleteLap();\n}",
            choix: [
              "NextCheckpoint passe à 4",
              "NextCheckpoint passe à 3",
              "Le tour est validé",
              "Rien : aucune condition n'est vraie, NextCheckpoint reste à 2",
            ],
            bonne: 3,
            explication:
              "3 n'est pas le checkpoint attendu (2), et ce n'est pas la ligne d'arrivée. Il n'y a pas de else final : la zone est ignorée. Le joueur devra revenir passer le checkpoint 2.",
          },
          {
            type: "qcm",
            enonce: "Le kart passe la ligne d'arrivée (zone 0) sans avoir traversé tous les checkpoints du tour. Que fait EnterLapZone ?",
            choix: [
              "Elle appelle CompleteLap",
              "Elle remet NextCheckpoint à 1",
              "Rien : la ligne d'arrivée ne compte que si NextCheckpoint a dépassé le nombre de checkpoints",
              "Elle termine la course",
            ],
            bonne: 2,
            explication:
              "La condition ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount() est fausse : aucun if n'est vrai, la zone est ignorée. C'est ce qui empêche les allers-retours sur la ligne.",
          },
          {
            type: "code",
            enonce: "La course a 3 tours. CurrentLap vaut 3 et le kart valide son tour. Que vaut CurrentLap après l'appel ?",
            code: "if (CurrentLap >= GameMode->GetLapCount())\n{\n\tbHasFinishedRace = true;\n\tFinishTime = GameMode->GetRaceTime();\n\tGameMode->NotifyKartFinished(this);\n\treturn;\n}\n\n++CurrentLap;",
            choix: [
              "3 : le return sort avant ++CurrentLap, la course est finie",
              "4",
              "1 : on repart au premier tour",
              "0",
            ],
            bonne: 0,
            explication:
              "3 >= 3 : la course est finie, on garde le temps d'arrivée et on prévient le GameMode. Le return empêche d'atteindre ++CurrentLap.",
          },
          {
            type: "qcm",
            enonce: "Une IA possède le kart. Que fait NotifyControllerChanged ?",
            choix: [
              "Elle ajoute le Mapping Context à l'IA",
              "Rien : le Cast vers APlayerController renvoie nullptr, et une IA n'a pas de clavier",
              "Elle plante, car l'IA n'a pas de LocalPlayer",
              "Elle donne les touches au premier joueur",
            ],
            bonne: 1,
            explication:
              "Controller peut être un joueur ou une IA. Le Cast ne réussit que pour un APlayerController. On ajoute le Mapping Context ici car c'est à ce moment qu'on sait quel joueur pilote le kart.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si on supprimait le lien Completed de ThrottleAction (ligne 203) ?",
            choix: [
              "Le kart ne pourrait plus accélérer",
              "Rien, Triggered remet la valeur à 0 tout seul",
              "Le kart continuerait d'accélérer après qu'on a lâché la touche",
              "Le jeu ne compilerait plus",
            ],
            bonne: 2,
            explication:
              "Quand on lâche, Triggered n'est plus appelé. Sans OnThrottleReleased, ThrottleInput garderait sa dernière valeur (par exemple 1).",
          },
          {
            type: "code",
            enonce: "Quel événement faut-il pour que le saut ne parte qu'une fois par appui ?",
            code: "EnhancedInput->BindAction(JumpAction, ETriggerEvent::____, this, &AKartPawn::OnJumpPressed);",
            choix: ["Triggered", "Completed", "Ongoing", "Started"],
            bonne: 3,
            explication:
              "Started se déclenche une seule fois, au moment de l'appui. Triggered serait appelé à chaque image tant que le bouton est tenu : le kart sauterait dès qu'il retouche le sol.",
          },
          {
            type: "qcm",
            enonce: "Tu tiens la touche d'accélération pendant une demi-seconde. Combien de fois chaque événement se déclenche-t-il ?",
            choix: [
              "Started à chaque image, Triggered une fois, Completed une fois",
              "Started une fois, Triggered à chaque image, Completed une fois au relâchement",
              "Les trois une seule fois",
              "Triggered une fois à l'appui, Completed à chaque image",
            ],
            bonne: 1,
            explication:
              "Started marque le début de l'appui, Triggered se répète tant qu'on tient, Completed marque le relâchement. Un axe à suivre en continu utilise Triggered, une action ponctuelle Started.",
          },
          {
            type: "qcm",
            enonce: "Le kart ne réagit à aucune touche, et le code compile. Que vérifier en premier ?",
            choix: [
              "Que KartMappingContext et les Input Actions sont bien remplis dans le Blueprint du kart",
              "Que Tick est bien appelé",
              "Que BeginPlay appelle SetupPlayerInputComponent",
              "Que bShowDebug est vrai",
            ],
            bonne: 0,
            explication:
              "Ces variables EditAnywhere sont vides par défaut : le code ne peut pas deviner quels assets utiliser. Sans Mapping Context ni actions, aucune touche n'arrive jusqu'au kart.",
          },
        ],
      },
    },
    {
      slug: "cpp-tick-fonctions-input",
      titre: "KartPawn.cpp (3/8) : le Tick et les fonctions d'input",
      resume: "Lignes 216 à 294 : l'ordre des étapes du Tick, DeltaTime, et les fonctions qui notent les touches",
      dureeMin: 15,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-tick-fonctions-input.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-tick-fonctions-input",
        questions: [
          {
            type: "qcm",
            enonce: "Pendant le compte à rebours (bCanMove faux), que fait le Tick ?",
            choix: [
              "Il quitte la fonction tout de suite avec return",
              "Il désactive le Tick jusqu'au GO",
              "Il met les inputs à zéro puis continue : la gravité marche toujours",
              "Il téléporte le kart sur la ligne de départ",
            ],
            bonne: 2,
            explication:
              "Les lignes 223 à 227 remettent ThrottleInput et SteerInput à 0, mais il n'y a pas de return : toutes les étapes s'exécutent, donc le kart reste posé sur la piste.",
          },
          {
            type: "code",
            enonce: "Quelle étape manque dans le Tick ?",
            code: "UpdateGround(DeltaTime);\nUpdateBoost(DeltaTime);\n____(DeltaTime);\nUpdateSteering(DeltaTime);\nUpdateDrift(DeltaTime);\nMoveKart(DeltaTime);",
            choix: ["AlignToGround", "UpdateSpeed", "UpdateVisuals", "UpdateCameraFieldOfView"],
            bonne: 1,
            explication:
              "Lire le monde, décider, bouger, afficher. UpdateBoost décompte le turbo juste avant qu'UpdateSpeed ne le consulte ; AlignToGround et les visuels viennent après MoveKart.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi UpdateGround est-elle la première étape du mouvement dans le Tick ?",
            choix: [
              "Parce que c'est la fonction la plus courte",
              "Parce qu'Unreal l'exige pour tous les Pawns",
              "Parce qu'elle affiche le debug",
              "Parce que les étapes suivantes ont besoin de savoir si le kart est au sol",
            ],
            bonne: 3,
            explication:
              "Vitesse, virage, drift et déplacement dépendent de bIsGrounded et de la pente : il faut lire le sol avant de décider quoi que ce soit.",
          },
          {
            type: "vrai-faux",
            enonce: "Sans DeltaTime, le kart irait plus vite sur un PC qui affiche plus d'images par seconde.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "Sans DeltaTime, le kart avancerait d'une distance fixe par image : deux fois plus d'images par seconde, deux fois plus de distance par seconde.",
          },
          {
            type: "qcm",
            enonce: "Le kart roule à 2500 cm/s et le jeu tourne à 30 images par seconde. De combien avance-t-il en une image ?",
            choix: ["Environ 42 cm", "2500 cm", "Environ 83 cm", "25 cm"],
            bonne: 2,
            explication:
              "Distance = vitesse × DeltaTime = 2500 × 1/30 ≈ 83 cm. À 60 images par seconde, ce serait environ 42 cm par image : dans les deux cas, 25 mètres par seconde.",
          },
          {
            type: "code",
            enonce: "Le joueur garde l'accélérateur enfoncé pendant tout le décompte. Que se passe-t-il au GO ?",
            code: "if (!bCanMove)\n{\n\tThrottleInput = 0.f;\n\tSteerInput = 0.f;\n}",
            choix: [
              "Le kart démarre aussitôt : OnThrottle réécrit ThrottleInput à chaque image, et plus personne ne l'efface",
              "Il faut relâcher puis réappuyer, car ThrottleInput a été mis à 0",
              "Le kart démarre avec un turbo",
              "Le kart reste bloqué jusqu'à la fin de la course",
            ],
            bonne: 0,
            explication:
              "Tant que la touche est tenue, Triggered appelle OnThrottle à chaque image, puis le Tick efface la valeur. Dès que bCanMove repasse à vrai, l'effacement s'arrête.",
          },
          {
            type: "code",
            enonce: "Le joueur enfonce une gâchette de manette à moitié. Que vaut ThrottleInput après cette ligne ?",
            code: "ThrottleInput = Value.Get<float>();",
            choix: ["1", "0,5", "0", "-0,5"],
            bonne: 1,
            explication:
              "Get<float>() lit la valeur de l'axe, entre -1 et 1. Une gâchette donne des valeurs intermédiaires ; UpdateSpeed visera alors la moitié de la vitesse max.",
          },
          {
            type: "vrai-faux",
            enonce: "OnThrottle fait avancer le kart en modifiant sa position.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "OnThrottle ne fait que ranger la valeur dans ThrottleInput. C'est UpdateSpeed puis MoveKart, dans le Tick, qui font avancer le kart.",
          },
          {
            type: "qcm",
            enonce: "Le kart est bloqué (bCanMove faux) et le joueur relâche le bouton de drift. Que se passe-t-il ?",
            choix: [
              "Rien, car le kart est bloqué",
              "Le kart saute",
              "Le drift démarre",
              "EndDrift est appelée quand même : OnDriftReleased ne teste pas bCanMove",
            ],
            bonne: 3,
            explication:
              "Seules OnDriftPressed et OnJumpPressed vérifient bCanMove. OnDriftReleased appelle toujours EndDrift, pour qu'un drift ne reste jamais bloqué en cours.",
          },
          {
            type: "qcm",
            enonce: "OnThrottleReleased ne se sert pas de son paramètre Value. Pourquoi le reçoit-elle quand même ?",
            choix: [
              "Pour remettre Value à 0 quand on lâche la touche",
              "Parce que Value contient DeltaTime",
              "Pour que toutes les fonctions d'input aient la même forme, celle qu'on branche avec BindAction",
              "Pour savoir quelle touche a été relâchée",
            ],
            bonne: 2,
            explication:
              "Le choix est fait pour l'uniformité : chaque fonction d'input reçoit un FInputActionValue, qu'elle s'en serve ou non. C'est ThrottleInput qu'on remet à 0, pas Value.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-tick-fonctions-input/ecouter-agir",
          enonce: "Les fonctions d'input (OnThrottle, OnSteer...) ne déplacent pas le kart : elles rangent seulement une valeur. Explique avec tes mots pourquoi on fait bouger le kart dans Tick plutôt que directement dans ces fonctions.",
          attendus:
            "Le kart doit bouger à chaque image, même quand aucune touche n'est appuyée (roue libre, gravité, drift). Les fonctions d'input ne sont appelées que lors des événements d'input. Mettre tout le mouvement dans Tick permet d'utiliser DeltaTime et de garder un ordre maîtrisé des étapes (sol, vitesse, virage, déplacement). Bonus : séparer « écouter » et « agir » rend le code plus lisible.",
        },
      ],
    },
    {
      slug: "cpp-sol-vitesse-virage",
      titre: "KartPawn.cpp (4/8) : UpdateGround, UpdateSpeed et UpdateSteering",
      resume: "Lignes 305 à 416 : au sol ou en l'air, gravité, vitesse cible et virage (y compris en drift)",
      dureeMin: 30,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-sol-vitesse-virage.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-sol-vitesse-virage",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi la distance pour rester au sol (RideHeight + GroundStickDistance) est-elle plus grande que celle pour atterrir (RideHeight + GroundSnapTolerance) ?",
            choix: [
              "Pour que le kart saute plus haut",
              "Pour que le kart reste collé en haut des bosses au lieu de clignoter entre « au sol » et « en l'air »",
              "Pour économiser des rayons",
              "Pour que la gravité soit plus forte",
            ],
            bonne: 1,
            explication:
              "Au sommet d'une bosse, la route s'éloigne vite. Une fois au sol, on y reste collé jusqu'à 75 cm ; pour atterrir, il faut descendre sous 50 cm. Deux seuils : c'est une hystérésis.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on retirait « && VerticalSpeed <= 0.f » de cette ligne ?",
            code: "bIsGrounded = bHitFloor && HeightAboveGround <= MaxGroundHeight && VerticalSpeed <= 0.f;",
            choix: [
              "Le saut serait annulé : la route est encore sous les roues, le kart serait déclaré au sol dès l'image suivante",
              "Le kart ne pourrait plus atterrir",
              "Le kart tomberait à travers la route",
              "Rien ne changerait",
            ],
            bonne: 0,
            explication:
              "Juste après un saut, le kart est encore tout près du sol. Comme il monte (VerticalSpeed > 0), cette condition l'empêche d'être recollé au sol, et VerticalSpeed d'être remise à 0.",
          },
          {
            type: "code",
            enonce: "Le kart est au sol, son centre est à 40 cm de la route (RideHeight = 45). Que font ces lignes ?",
            code: "const float HeightError = HeightAboveGround - RideHeight;\nAddActorWorldOffset(-GetActorUpVector() * HeightError, true);",
            choix: [
              "Elles descendent le kart de 5 cm",
              "Elles ne font rien",
              "Elles montent le kart de 45 cm",
              "Elles montent le kart de 5 cm",
            ],
            bonne: 3,
            explication:
              "HeightError = 40 - 45 = -5. -Up × -5 = +5 vers le haut : le kart remonte à la bonne hauteur. À 50 cm, l'erreur vaudrait +5 et il descendrait.",
          },
          {
            type: "qcm",
            enonce: "Le kart quitte une rampe avec VerticalSpeed = 0. Que vaut VerticalSpeed après une demi-seconde en l'air (GravityStrength = 2500) ?",
            choix: ["-2500", "-1250", "-625", "+1250"],
            bonne: 1,
            explication:
              "Chaque image retire GravityStrength × DeltaTime : en 0,5 s, on retire 2500 × 0,5 = 1250. Négative, la vitesse verticale signifie qu'on tombe.",
          },
          {
            type: "vrai-faux",
            enonce: "Dans UpdateGround, la gravité déplace directement le kart vers le bas.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La gravité ne modifie que VerticalSpeed. C'est MoveKart, plus loin dans le Tick, qui transforme cette vitesse en déplacement.",
          },
          {
            type: "vrai-faux",
            enonce: "Pendant un turbo, freiner à fond fait ralentir le kart.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "UpdateSpeed commence par tester BoostTimeRemaining : pendant un turbo, CurrentSpeed = BoostSpeed puis return. L'accélérateur et le frein sont ignorés jusqu'à la fin du turbo.",
          },
          {
            type: "qcm",
            enonce: "Le kart avance à 2000 cm/s et le joueur appuie sur frein (ThrottleInput = -1). Quel rythme utilise UpdateSpeed ?",
            choix: ["CoastDeceleration", "Acceleration", "BrakeDeceleration", "TurnRate"],
            bonne: 2,
            explication:
              "ThrottleInput est négatif et CurrentSpeed est positif : le kart roule encore vers l'avant, donc Rate = BrakeDeceleration. Une fois arrêté, il passera à Acceleration pour reculer.",
          },
          {
            type: "code",
            enonce: "Kart à l'arrêt, accélérateur à fond, 60 images par seconde : TargetSpeed = 2500, Rate = 1500. Que vaut CurrentSpeed après la première image ?",
            code: "CurrentSpeed = FMath::FInterpConstantTo(CurrentSpeed, TargetSpeed, DeltaTime, Rate);",
            choix: ["2500", "25", "Environ 42", "1500"],
            bonne: 1,
            explication:
              "FInterpConstantTo avance d'au plus Rate × DeltaTime = 1500 / 60 = 25 cm/s par image. Le kart atteint 2500 en 2500 / 1500 ≈ 1,7 s, sans jamais dépasser la cible.",
          },
          {
            type: "qcm",
            enonce: "Le kart roule à 30 cm/s (MinSpeedToTurn = 50) et le joueur tourne le volant. Que se passe-t-il ?",
            choix: [
              "Le kart tourne normalement",
              "Le kart tourne deux fois moins vite",
              "Le kart démarre un drift",
              "Le kart ne tourne pas",
            ],
            bonne: 3,
            explication:
              "FMath::Abs(CurrentSpeed) est inférieur à MinSpeedToTurn : UpdateSteering sort tout de suite. Le kart ne pivote pas sur place, en avant comme en marche arrière.",
          },
          {
            type: "qcm",
            enonce: "Pendant un drift à droite entièrement engagé, le joueur pousse le volant à fond à gauche. Que fait le kart ?",
            choix: [
              "Il tourne toujours à droite, mais moins fort (virage plus large)",
              "Il tourne à gauche",
              "Il va tout droit",
              "Le drift s'arrête",
            ],
            bonne: 0,
            explication:
              "SteerAlongDrift vaut -1, converti en 0,5 par GetMappedRangeValueClamped, puis multiplié par DriftDirection (+1) : le kart tourne à droite, à la moitié de la force.",
          },
          {
            type: "code",
            enonce: "Le kart recule (CurrentSpeed négative), sans drift, et le joueur tourne le volant à droite (SteerInput = +1). Où part l'avant du kart ?",
            code: "const float MoveDirection = CurrentSpeed >= 0.f ? 1.f : -1.f;\n\nconst float YawDelta = Steer * Rate * MoveDirection * DeltaTime;",
            choix: [
              "À droite",
              "Nulle part : on ne tourne pas en marche arrière",
              "À gauche, comme une vraie voiture qui recule",
              "Ça dépend de la vitesse",
            ],
            bonne: 2,
            explication:
              "MoveDirection vaut -1 : YawDelta devient négatif, le kart pivote vers la gauche. C'est le comportement d'une vraie voiture en marche arrière.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-sol-vitesse-virage/roue-libre",
          enonce: "Avec les réglages par défaut, combien de temps faut-il au kart pour passer de 2500 cm/s à 0 en lâchant simplement l'accélérateur ? Et en freinant ? Montre ton calcul.",
          attendus:
            "Roue libre : CoastDeceleration = 800 cm/s par seconde, donc 2500 / 800 ≈ 3,1 s. Frein : BrakeDeceleration = 3000, donc 2500 / 3000 ≈ 0,83 s. FInterpConstantTo avance d'un pas constant, donc temps = écart / rythme.",
        },
      ],
    },
    {
      slug: "cpp-drift-deplacement",
      titre: "KartPawn.cpp (5/8) : UpdateDrift, UpdateBoost, MoveKart et AlignToGround",
      resume: "Lignes 417 à 520 : faire progresser le drift, décompter le turbo, se déplacer avec un sweep, cogner les murs, s'incliner",
      dureeMin: 30,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-drift-deplacement.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-drift-deplacement",
        questions: [
          {
            type: "qcm",
            enonce: "Pendant un drift, le kart ralentit à 700 cm/s (DriftMinSpeed = 1000). Que fait UpdateDrift ?",
            choix: [
              "Le drift continue : il ne s'arrête que sous 500 cm/s",
              "Le drift s'arrête, car 700 est sous DriftMinSpeed",
              "Le drift s'arrête et donne un mini-turbo",
              "Le kart accélère pour remonter à 1000",
            ],
            bonne: 0,
            explication:
              "Le drift s'arrête sous DriftMinSpeed × 0,5 = 500. On démarre à 1000 mais on n'arrête qu'à 500 : deux seuils, comme pour le sol, pour ne pas perdre le drift dès qu'on ralentit un peu.",
          },
          {
            type: "code",
            enonce: "DriftEnterTime vaut 0,4. Que vaut DriftBlend 0,2 seconde après le début du drift ?",
            code: "DriftBlend = FMath::Min(1.f, DriftBlend + DeltaTime / DriftEnterTime);",
            choix: ["0,2", "1", "0,5", "0,08"],
            bonne: 2,
            explication:
              "Chaque image ajoute DeltaTime / 0,4 : en tout, 0,2 / 0,4 = 0,5. DriftBlend atteint 1 au bout de 0,4 s, et FMath::Min l'empêche de dépasser 1.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on sautait pendant un drift, DriftChargeTime continuerait d'augmenter en l'air.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Lignes 436 à 440 : la charge n'augmente que si bIsGrounded est vrai. En l'air, elle est en pause (DriftBlend, lui, continue de monter).",
          },
          {
            type: "code",
            enonce: "Il reste 0,01 s de turbo et DeltaTime vaut 0,0167. Que vaut BoostTimeRemaining après cette ligne ?",
            code: "BoostTimeRemaining = FMath::Max(0.f, BoostTimeRemaining - DeltaTime);",
            choix: ["-0,0067", "0,01", "0,0167", "0"],
            bonne: 3,
            explication:
              "0,01 - 0,0167 est négatif, et FMath::Max garde le plus grand des deux nombres : 0. Le temps de turbo ne descend jamais sous 0.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi appelle-t-on GetSafeNormal après VectorPlaneProject dans MoveKart ?",
            choix: [
              "Pour que le kart aille plus vite que sa vitesse max",
              "Pour inverser la direction en marche arrière",
              "Parce que la projection raccourcit la flèche : on la remet à une longueur de 1 pour ne pas ralentir dans les pentes",
              "Pour ignorer les murs",
            ],
            bonne: 2,
            explication:
              "L'ombre d'une flèche est plus courte que la flèche. Sans la remettre à 1, Forward × CurrentSpeed donnerait un déplacement plus petit dans les pentes. « Safe » : pas de plantage si la flèche est nulle.",
          },
          {
            type: "code",
            enonce: "Que se passe-t-il si on remplace true par false dans cette ligne ?",
            code: "FHitResult Hit;\nAddActorWorldOffset(Delta, true, &Hit);",
            choix: [
              "Le kart irait deux fois plus vite",
              "La sphère serait téléportée sans test de collision : le kart pourrait traverser les murs",
              "Le kart ne pourrait plus tourner",
              "Rien ne change",
            ],
            bonne: 1,
            explication:
              "true active le sweep : la sphère glisse le long du trajet et s'arrête au premier obstacle. Sans sweep, à plus de 80 cm par image, elle passerait à travers un mur fin.",
          },
          {
            type: "code",
            enonce: "Le kart roule à 2000 cm/s et prend un mur parfaitement de face (WallSpeedFactor = 0,3). Que vaut CurrentSpeed après le choc ?",
            code: "const float ImpactStrength = FMath::Clamp(-FVector::DotProduct(MoveDirection, Hit.Normal), 0.f, 1.f);\n\n// On perd plus de vitesse quand on tape le mur de face\nCurrentSpeed *= FMath::Lerp(1.f, WallSpeedFactor, ImpactStrength);",
            choix: ["1400", "0", "2000", "600"],
            bonne: 3,
            explication:
              "De face, le produit scalaire vaut -1, donc ImpactStrength = 1 et Lerp(1, 0,3, 1) = 0,3 : 2000 × 0,3 = 600. En frôlant le mur, ImpactStrength vaudrait 0 et le kart garderait ses 2000 cm/s.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi un contact avec Hit.bStartPenetrating vrai n'est-il pas traité comme un choc contre un mur ?",
            choix: [
              "Parce que la sphère était déjà enfoncée dans l'objet au départ : ce n'est pas un vrai choc",
              "Parce que c'est forcément un autre kart",
              "Parce que le sweep était désactivé",
              "Parce que le kart était en l'air",
            ],
            bonne: 0,
            explication:
              "bStartPenetrating signale que la sphère touchait déjà l'objet avant de bouger. Freiner le kart dans ce cas le punirait pour un contact qu'il n'a pas provoqué.",
          },
          {
            type: "qcm",
            enonce: "Au sol, la sphère touche une petite bosse orientée comme la route. Que fait MoveKart ?",
            choix: [
              "Elle arrête le kart net",
              "Elle fait sauter le kart",
              "Elle finit le trajet restant sans collision : UpdateGround remettra le kart à la bonne hauteur",
              "Elle réduit la vitesse de 70 %",
            ],
            bonne: 2,
            explication:
              "Au sol, ce sont les roues qui gèrent la hauteur. Sans ce cas (lignes 487 à 495), la sphère s'arrêterait à chaque petite bosse et le kart saccaderait.",
          },
          {
            type: "qcm",
            enonce: "Après un choc, Hit.Time vaut 0,25. Que fait MoveKart du reste du trajet, Delta * (1.f - Hit.Time) ?",
            choix: [
              "Il l'annule : le kart reste collé au mur",
              "Il projette ces 75 % restants sur la surface touchée et les refait avec un sweep : le kart glisse le long du mur",
              "Il les refait dans la direction opposée : le kart rebondit",
              "Il les ajoute à l'image suivante",
            ],
            bonne: 1,
            explication:
              "Hit.Time = 0,25 : un quart du trajet a été fait avant le choc. VectorPlaneProject ne garde que la partie qui longe l'obstacle, et le nouveau sweep la parcourt.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi AlignToGround utilise-t-il Slerp avec un petit Alpha au lieu d'appliquer directement la rotation cible ?",
            choix: [
              "Parce que SetActorRotation ne peut tourner que d'un petit angle",
              "Pour que le kart tourne plus vite dans les virages",
              "Parce que les quaternions ne peuvent pas être copiés",
              "Pour que le kart ne tremble pas à chaque petite variation de la pente",
            ],
            bonne: 3,
            explication:
              "La normale du sol bouge un peu à chaque bosse. En faisant seulement une partie du chemin à chaque image (environ 13 % à 60 images par seconde), on lisse ces secousses. C'est ce retard qui oblige MoveKart à coucher l'avant sur la route.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-drift-deplacement/sweep",
          enonce: "Dans MoveKart, que fait le kart après avoir touché un mur de biais ? Décris les deux effets et la ligne de code de chacun.",
          attendus:
            "1) Il perd de la vitesse selon l'angle du choc : CurrentSpeed *= Lerp(1, WallSpeedFactor, ImpactStrength) (ligne 485), avec ImpactStrength calculé par le produit scalaire entre la direction du mouvement et la normale du mur (ligne 482). 2) Le reste du trajet est projeté sur la surface du mur et refait avec un sweep (lignes 503-504) : le kart glisse le long du mur au lieu de s'y coller.",
        },
      ],
    },
    {
      slug: "cpp-visuels-camera",
      titre: "KartPawn.cpp (6/8) : roues, châssis, caméra et champ de vision",
      resume: "Lignes 521 à 586 : UpdateVisuals et UpdateCameraFieldOfView, avec radians, FInterpTo et zone morte",
      dureeMin: 20,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-visuels-camera.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-visuels-camera",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi l'angle des roues se calcule-t-il avec distance / rayon ?",
            choix: [
              "Parce que c'est une approximation qui marche à basse vitesse",
              "Parce que le rayon est toujours égal à 1",
              "Parce qu'en radians, l'angle parcouru par une roue qui roule vaut la distance divisée par son rayon",
              "Pour que les roues tournent moins vite que le kart",
            ],
            bonne: 2,
            explication:
              "Un radian, c'est l'angle pour lequel la roue a roulé d'une distance égale à son rayon. La distance de cette image est CurrentSpeed × DeltaTime.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on oubliait RadiansToDegrees dans cette ligne ?",
            code: "WheelSpinAngle += FMath::RadiansToDegrees(CurrentSpeed * DeltaTime / WheelRadius);",
            choix: [
              "Les roues tourneraient environ 57 fois trop lentement",
              "Les roues tourneraient à l'envers",
              "Les roues tourneraient environ 57 fois trop vite",
              "Rien, Unreal convertit tout seul",
            ],
            bonne: 0,
            explication:
              "Le calcul donne des radians, mais Unreal attend des degrés. 1 radian ≈ 57 degrés : sans conversion, on tournerait de 1 degré là où il en faut 57.",
          },
          {
            type: "vrai-faux",
            enonce: "Sans Fmod, la roue tournerait à l'envers au bout d'un moment.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le problème serait la précision : un angle qui grandit sans fin devient un float énorme qui perd en précision, et la roue saccaderait. Fmod garde l'angle entre -360 et 360.",
          },
          {
            type: "code",
            enonce: "Le joueur tourne le volant à moitié à droite (SteerInput = 0,5). De combien braquent les roues avant et les roues arrière ?",
            code: "const float WheelSteerAngle = SteerInput * MaxWheelSteerAngle;\nSetWheelRotation(WheelFrontLeft, WheelFrontLeftBaseRotation, WheelSteerAngle);\nSetWheelRotation(WheelFrontRight, WheelFrontRightBaseRotation, WheelSteerAngle);\nSetWheelRotation(WheelRearLeft, WheelRearLeftBaseRotation, 0.f);\nSetWheelRotation(WheelRearRight, WheelRearRightBaseRotation, 0.f);",
            choix: [
              "30 degrés à l'avant, 30 degrés à l'arrière",
              "15 degrés à l'avant, 15 degrés à l'arrière",
              "30 degrés à l'avant, 0 à l'arrière",
              "15 degrés à l'avant, 0 à l'arrière",
            ],
            bonne: 3,
            explication:
              "0,5 × MaxWheelSteerAngle (30) = 15 degrés. Les roues arrière reçoivent 0 : elles tournent sur elles-mêmes mais ne braquent pas.",
          },
          {
            type: "qcm",
            enonce: "Quelle différence entre FInterpConstantTo et FInterpTo ?",
            choix: [
              "Aucune, ce sont deux noms pour la même fonction",
              "FInterpConstantTo avance d'un pas constant ; FInterpTo fait une fraction du chemin restant et ralentit en approchant",
              "FInterpTo ne marche que pour les rotations",
              "FInterpConstantTo dépasse la cible puis revient",
            ],
            bonne: 1,
            explication:
              "Le pas constant donne une accélération régulière, comme un moteur (UpdateSpeed). FInterpTo donne un mouvement doux, utilisé pour le châssis, la caméra et le FOV.",
          },
          {
            type: "code",
            enonce: "Drift à droite entièrement engagé : la cible vaut 25 degrés et BodySlideYaw vaut encore 0. À 60 images par seconde (DriftSlideInterpSpeed = 6), que vaut BodySlideYaw après une image ?",
            code: "BodySlideYaw = FMath::FInterpTo(BodySlideYaw, TargetSlideYaw, DeltaTime, DriftSlideInterpSpeed);",
            choix: ["25", "6", "2,5", "0,1"],
            bonne: 2,
            explication:
              "FInterpTo fait une fraction Vitesse × DeltaTime = 6 / 60 = 10 % du chemin restant : 10 % de 25 = 2,5. L'image suivante, 10 % des 22,5 restants : 4,75, et ainsi de suite.",
          },
          {
            type: "vrai-faux",
            enonce: "Pendant un tête-à-queue, la caméra tourne sur elle-même avec le châssis.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La caméra suit BodySlideYaw (l'angle du drift), pas SpinOutYaw. Et elle le suit avec une vitesse plus faible (3 contre 6) : elle rattrape le châssis avec retard, sans tourner d'un coup.",
          },
          {
            type: "code",
            enonce: "Le kart descend une pente : KartPitch vaut -20 et CameraSlopeDeadZone vaut 10. Quelle inclinaison vise la caméra ?",
            code: "const float TargetSlopePitch = FMath::Abs(KartPitch) > CameraSlopeDeadZone ? KartPitch - FMath::Sign(KartPitch) * CameraSlopeDeadZone : 0.f;",
            choix: ["-10", "-20", "-30", "0"],
            bonne: 0,
            explication:
              "|-20| > 10, donc on retire la zone morte : Sign(-20) = -1, et -20 - (-1 × 10) = -10. En retirant la zone morte, la cible part de 0 au passage du seuil, sans à-coup.",
          },
          {
            type: "qcm",
            enonce: "Le kart recule à 800 cm/s, sans turbo. Quel FOV vise UpdateCameraFieldOfView (BaseFieldOfView = 90, MaxSpeedFieldOfView = 100) ?",
            choix: ["100", "Environ 93", "110", "90"],
            bonne: 3,
            explication:
              "CurrentSpeed / MaxForwardSpeed est négatif, et Clamp le ramène à 0 : le Lerp donne BaseFieldOfView, 90. Le FOV ne s'élargit qu'en marche avant.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le FOV s'élargit-il quand le kart va vite ?",
            choix: [
              "Pour voir le compteur de vitesse",
              "Pour donner une sensation de vitesse : le décor semble défiler plus vite sur les côtés",
              "Pour que le kart aille réellement plus vite",
              "Pour réduire le nombre d'objets affichés",
            ],
            bonne: 1,
            explication:
              "Un champ de vision plus large étire les bords de l'image. C'est un effet visuel : comme toutes les étapes de cette leçon, il ne touche pas à la trajectoire.",
          },
        ],
      },
    },
    {
      slug: "cpp-rayons-roues",
      titre: "KartPawn.cpp (7/8) : les rayons sous les roues et l'orientation des roues",
      resume: "Lignes 587 à 675 : TraceGroundUnderWheels (line trace, moyennes, produit vectoriel) et SetWheelRotation",
      dureeMin: 25,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-rayons-roues.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-rayons-roues",
        questions: [
          {
            type: "qcm",
            enonce: "Le produit scalaire entre la normale d'une surface touchée et le haut du kart vaut 0,2. Qu'est-ce que c'est pour le kart ?",
            choix: [
              "Un sol plat",
              "Une pente douce",
              "Une surface sous le kart, à l'envers",
              "Un mur (ou une pente trop raide) : la roue est comptée comme ne touchant pas le sol",
            ],
            bonne: 3,
            explication:
              "Plus le produit scalaire est proche de 1, plus la surface est à plat. 0,2 est sous WalkableFloorZ (0,7) : bHitFloor est faux pour cette roue.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi les rayons partent-ils au-dessus du kart (Up * RideHeight) ?",
            choix: [
              "Pour que le rayon soit plus précis",
              "Pour ne pas démarrer sous la route quand le kart est dans une montée",
              "Pour toucher le toit du kart",
              "Parce qu'un rayon doit toujours partir du ciel",
            ],
            bonne: 1,
            explication:
              "Dans une montée, le point sous une roue avant peut se trouver sous la surface. En partant 45 cm au-dessus du centre, le rayon commence toujours au-dessus de la route.",
          },
          {
            type: "code",
            enonce: "Avec RideHeight = 45 et GroundTraceDistance = 80, quelle longueur fait chaque rayon ?",
            code: "const FVector Start = GetActorLocation() + WheelOffsets[Index] + Up * RideHeight;\nconst FVector End = Start - Up * (RideHeight * 2.f + GroundTraceDistance);",
            choix: ["80 cm", "125 cm", "170 cm", "215 cm"],
            bonne: 2,
            explication:
              "2 × 45 + 80 = 170 cm, le long de l'axe haut du kart. 45 cm pour revenir au centre, 45 cm pour descendre jusqu'à la hauteur normale du sol, puis 80 cm de marge.",
          },
          {
            type: "qcm",
            enonce: "À quoi sert Params.AddIgnoredActor(this) ?",
            choix: [
              "À ce que le rayon ne touche pas notre propre kart",
              "À empêcher le kart de toucher les autres karts",
              "À rendre le rayon invisible",
              "À ignorer les murs",
            ],
            bonne: 0,
            explication:
              "Les rayons partent de l'intérieur de notre kart : sans cette option, ils toucheraient d'abord notre propre sphère au lieu du sol.",
          },
          {
            type: "qcm",
            enonce: "TraceGroundUnderWheels est const, pourtant elle modifie OutGroundPoint et OutGroundNormal. Pourquoi le compilateur l'accepte-t-il ?",
            choix: [
              "Parce que const ne s'applique qu'à la valeur renvoyée",
              "Parce que const interdit de modifier le kart lui-même, pas les variables de l'appelant passées par référence",
              "Parce que les FVector ne peuvent jamais être const",
              "Il ne l'accepte pas : c'est une erreur qu'Unreal ignore",
            ],
            bonne: 1,
            explication:
              "Une fonction const promet de ne pas changer les variables du kart (CurrentSpeed, GroundNormal…). OutGroundPoint et OutGroundNormal appartiennent à UpdateGround, qui les a passées par référence pour récupérer les résultats.",
          },
          {
            type: "code",
            enonce: "Seules deux roues touchent le sol, en des points de hauteur Z = 100 et Z = 110. Que vaut OutGroundPoint.Z ?",
            code: "OutGroundPoint = PointSum / WheelsOnFloor;",
            choix: ["210", "105", "52,5", "110"],
            bonne: 1,
            explication:
              "PointSum ne contient que les points des roues qui touchent, et on divise par leur nombre (2) : (100 + 110) / 2 = 105. Le point moyen du sol sous le kart.",
          },
          {
            type: "vrai-faux",
            enonce: "Si aucune roue ne touche le sol, la fonction renvoie 0 et une normale qui pointe vers le ciel.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "Lignes 631 à 636 : OutGroundPoint vaut la position du kart, OutGroundNormal vaut FVector::UpVector, et la fonction renvoie 0. UpdateGround en déduit que le kart est en l'air.",
          },
          {
            type: "qcm",
            enonce: "Quand les quatre roues touchent, que donne le produit vectoriel des deux diagonales ?",
            choix: [
              "La hauteur moyenne du sol",
              "La vitesse du kart",
              "Une flèche perpendiculaire au plan des quatre roues : la normale du sol",
              "La distance entre les roues",
            ],
            bonne: 2,
            explication:
              "Le produit vectoriel de deux flèches couchées sur une surface donne la flèche perpendiculaire à cette surface. Les diagonales relient les points réellement touchés : c'est le plan sur lequel le kart est posé.",
          },
          {
            type: "code",
            enonce: "Pourquoi ce test après le produit vectoriel ?",
            code: "if (FVector::DotProduct(PlaneNormal, Up) < 0.f)\n{\n\tPlaneNormal = -PlaneNormal;\n}",
            choix: [
              "Pour détecter les murs",
              "Pour ignorer les pentes trop raides",
              "Pour normaliser la flèche à une longueur de 1",
              "Selon l'ordre des diagonales, le produit vectoriel peut pointer vers le bas : on le retourne",
            ],
            bonne: 3,
            explication:
              "Inverser les deux flèches d'un produit vectoriel inverse le résultat. Un produit scalaire négatif avec le haut du kart signifie que la normale pointe vers le bas.",
          },
          {
            type: "qcm",
            enonce: "Trois roues touchent le sol, la quatrième est dans le vide au bord d'un saut. Quelle normale renvoie la fonction ?",
            choix: [
              "La verticale du monde",
              "La moyenne des normales touchées par les trois roues",
              "Le produit vectoriel des diagonales",
              "La normale de la roue avant gauche",
            ],
            bonne: 1,
            explication:
              "Les diagonales ne sont utilisées que si WheelsOnFloor vaut 4. Sinon, on garde NormalSum.GetSafeNormal() : la pente moyenne sous les roues qui touchent.",
          },
          {
            type: "code",
            enonce: "Dans quel ordre ces deux rotations sont-elles appliquées à la roue ?",
            code: "const FQuat SpinAndSteer = FQuat(FRotator(0.f, SteerAngle, WheelSpinAngle));\nWheel->SetRelativeRotation(SpinAndSteer * FQuat(BaseRotation));",
            choix: [
              "D'abord la rotation de départ (BaseRotation), puis la rotation et le braquage par-dessus",
              "D'abord la rotation et le braquage, puis la rotation de départ",
              "Les deux en même temps : l'ordre ne compte pas",
              "Seule la rotation de départ est appliquée",
            ],
            bonne: 0,
            explication:
              "Avec A * B, Unreal applique d'abord B puis A. L'ordre compte avec les quaternions : c'est justement pour dire « fais cette rotation, puis celle-là » qu'on les utilise.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-rayons-roues/quatre-rayons",
          enonce: "Pourquoi lancer quatre rayons, un sous chaque roue, plutôt qu'un seul sous le centre du kart ? Donne au moins deux raisons.",
          attendus:
            "Un seul point de contact saute d'un triangle à l'autre et fait trembler la hauteur et la pente. Quatre rayons donnent une moyenne plus stable. Le kart s'incline comme un vrai véhicule posé sur ses roues (le plan des quatre points touchés). Au bord d'un saut, certaines roues peuvent être dans le vide : on garde la moyenne des autres.",
        },
      ],
    },
    {
      slug: "cpp-saut-drift-debug",
      titre: "KartPawn.cpp (8/8) : saut, drift, turbo et texte de debug",
      resume: "Lignes 676 à 776 : Jump, StartDrift, EndDrift, StartBoost, GetCurrentMaxSpeed et ShowDebugInfo",
      dureeMin: 20,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./cpp-saut-drift-debug.mdx"),
      quiz: {
        id: "mario-kart/pawn-controller/cpp-saut-drift-debug",
        questions: [
          {
            type: "vrai-faux",
            enonce: "Jump() déplace directement le kart vers le haut.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Jump ne fait que donner une vitesse verticale (JumpVelocity) et déclarer le kart en l'air. C'est MoveKart qui le déplace, et la gravité d'UpdateGround qui réduit cette vitesse jusqu'à le faire retomber.",
          },
          {
            type: "qcm",
            enonce: "Le kart saute avec VerticalSpeed = 450 cm/s, et la gravité retire 2500 cm/s chaque seconde. Au bout de combien de temps atteint-il le sommet du saut ?",
            choix: ["0,18 s", "0,45 s", "1 s", "5,6 s"],
            bonne: 0,
            explication:
              "Au sommet, la vitesse verticale vaut 0 : 450 / 2500 = 0,18 s. Avec une vitesse moyenne de 225 cm/s pendant 0,18 s, le kart monte d'environ 40 cm.",
          },
          {
            type: "qcm",
            enonce: "Le joueur appuie sur drift à 1500 cm/s, au sol, mais sans tourner. Que se passe-t-il ?",
            choix: [
              "Le drift démarre vers la droite",
              "Le kart obtient tout de suite un mini-turbo",
              "Le drift ne démarre pas : il faut tourner d'un côté",
              "Le kart saute",
            ],
            bonne: 2,
            explication:
              "StartDrift vérifie FMath::IsNearlyZero(SteerInput) : sans direction, on ne sait pas de quel côté glisser, et la fonction s'arrête.",
          },
          {
            type: "code",
            enonce: "Le kart roule à 800 cm/s, au sol, volant à droite, et le joueur appuie sur drift (DriftMinSpeed = 1000). Que se passe-t-il ?",
            code: "if (!bIsGrounded || CurrentSpeed < DriftMinSpeed || FMath::IsNearlyZero(SteerInput))\n{\n\treturn;\n}",
            choix: [
              "Le drift démarre, car le kart est au sol et tourne",
              "Le drift démarre, mais sans charger de turbo",
              "Le kart accélère jusqu'à 1000 puis drifte",
              "Rien : une seule condition vraie suffit (||), et 800 < 1000",
            ],
            bonne: 3,
            explication:
              "Avec ||, il suffit qu'une condition soit vraie pour sortir. Les deux autres sont remplies, mais le kart est trop lent : bIsDrifting reste faux.",
          },
          {
            type: "qcm",
            enonce: "Le joueur démarre un drift avec le volant légèrement à droite (SteerInput = 0,3), puis braque à fond à gauche. Que vaut DriftDirection ?",
            choix: [
              "+1 : le côté est choisi une fois, au démarrage du drift",
              "-1 : il suit le volant",
              "0,3",
              "0 : le drift s'annule",
            ],
            bonne: 0,
            explication:
              "StartDrift fixe DriftDirection à +1 si SteerInput > 0, quelle que soit sa force. Ensuite, le volant ne fait que serrer ou élargir le virage, toujours du côté du drift.",
          },
          {
            type: "code",
            enonce: "Le joueur relâche le drift avec DriftChargeTime = 0,8 (MiniTurboChargeTime = 1, SuperTurboChargeTime = 2). Que se passe-t-il ?",
            code: "if (DriftChargeTime >= SuperTurboChargeTime)\n{\n\tStartBoost(SuperTurboDuration);\n}\nelse if (DriftChargeTime >= MiniTurboChargeTime)\n{\n\tStartBoost(MiniTurboDuration);\n}\n\nbIsDrifting = false;",
            choix: [
              "Un mini-turbo de 0,6 s",
              "Le drift continue jusqu'à 1 s",
              "Aucun turbo, mais le drift se termine quand même",
              "Un turbo de 0,8 s",
            ],
            bonne: 2,
            explication:
              "0,8 n'atteint aucun des deux seuils : aucun StartBoost. Les lignes après les if s'exécutent dans tous les cas : bIsDrifting, DriftDirection et DriftChargeTime sont remis à zéro.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi EndDrift teste-t-elle SuperTurboChargeTime avant MiniTurboChargeTime ?",
            choix: [
              "Parce que le super-turbo est plus rapide à calculer",
              "Parce qu'un drift assez long pour le super-turbo l'est aussi pour le mini : testé en premier, le mini gagnerait toujours",
              "Pour que le mini-turbo soit plus long",
              "L'ordre n'a aucune importance",
            ],
            bonne: 1,
            explication:
              "Avec if / else if, seule la première condition vraie compte. Un drift de 2,5 s passe le test du mini (≥ 1 s) : il faut donc tester le super (≥ 2 s) d'abord.",
          },
          {
            type: "qcm",
            enonce: "Le turbo se termine : CurrentSpeed vaut 3500 et le joueur garde l'accélérateur à fond. Que se passe-t-il ?",
            choix: [
              "Le kart garde 3500 cm/s tant qu'il accélère",
              "Le kart retombe aussitôt à 2500 cm/s",
              "Le kart ralentit au rythme du frein, BrakeDeceleration",
              "Le kart redescend vers 2500 au rythme Acceleration, en environ deux tiers de seconde",
            ],
            bonne: 3,
            explication:
              "La cible devient MaxForwardSpeed (2500) et, comme le kart n'a pas une vitesse négative, Rate = Acceleration (1500) : 1000 / 1500 ≈ 0,67 s.",
          },
          {
            type: "vrai-faux",
            enonce: "Là où UpdateSpeed l'appelle, GetCurrentMaxSpeed peut renvoyer BoostSpeed.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "UpdateSpeed fait return pendant un turbo (lignes 345 à 349), avant d'appeler GetCurrentMaxSpeed (ligne 363). À cet endroit, BoostTimeRemaining vaut toujours 0 : elle renvoie MaxForwardSpeed.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ShowDebugInfo doit-elle être appelée à chaque image ?",
            choix: [
              "Parce que GEngine est remis à nullptr à chaque image",
              "Parce que ses messages ont une durée de 0 : ils ne restent affichés qu'une image",
              "Parce que la case de debug du GameMode peut changer à tout moment",
              "Ce n'est pas nécessaire, une fois suffit",
            ],
            bonne: 1,
            explication:
              "AddOnScreenDebugMessage est appelée avec une durée de 0 : le message disparaît après une image. La case du GameMode, elle, n'est lue qu'une fois, dans BeginPlay.",
          },
          {
            type: "code",
            enonce: "Que verrait-on si les trois messages de debug utilisaient tous la clé 1 ?",
            code: "GEngine->AddOnScreenDebugMessage(1, 0.f, FColor::White, FString::Printf(TEXT(\"Speed: %.0f  Grounded: %s\"),\n\tCurrentSpeed, bIsGrounded ? TEXT(\"yes\") : TEXT(\"no\")));\nGEngine->AddOnScreenDebugMessage(2, 0.f, DriftColor, FString::Printf(TEXT(\"Drift: %s  Charge: %.2f\"),\n\tbIsDrifting ? TEXT(\"yes\") : TEXT(\"no\"), DriftChargeTime));\nGEngine->AddOnScreenDebugMessage(3, 0.f, FColor::Yellow, FString::Printf(TEXT(\"Boost: %.2f\"),\n\tBoostTimeRemaining));",
            choix: [
              "Les trois lignes, comme maintenant",
              "Les trois lignes, toutes en blanc",
              "Une seule ligne : chaque message remplacerait le précédent, il ne resterait que celui du turbo",
              "Aucune ligne",
            ],
            bonne: 2,
            explication:
              "Un message avec une clé déjà utilisée remplace l'ancien au lieu de s'ajouter. Des clés différentes donnent trois lignes qui se mettent à jour sans s'empiler.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/pawn-controller/cpp-saut-drift-debug/ordre-turbos",
          enonce: "Décris, étape par étape, ce qui arrive aux variables bIsDrifting, DriftBlend, DriftChargeTime et BoostTimeRemaining quand le joueur drifte pendant 1,5 seconde au sol puis relâche.",
          attendus:
            "Appui : StartDrift met bIsDrifting à true, DriftDirection à ±1, DriftChargeTime et DriftBlend à 0. Pendant le drift : DriftBlend monte jusqu'à 1 en 0,4 s, DriftChargeTime monte jusqu'à 1,5 (au sol). Relâchement : 1,5 ≥ MiniTurboChargeTime (1) mais < SuperTurboChargeTime (2), donc StartBoost(MiniTurboDuration) : BoostTimeRemaining = 0,6 et CurrentSpeed = BoostSpeed. bIsDrifting repasse à false, DriftChargeTime à 0. Ensuite UpdateBoost fait baisser BoostTimeRemaining jusqu'à 0.",
        },
      ],
    },
  ],
  carte: {
    fichier: "KartPawn.cpp",
    lignes: 833,
    tranches: [
      { lecon: "cpp-constructeur-beginplay", label: "Includes, constructeur, BeginPlay", debut: 1, fin: 108 },
      { lecon: "cpp-tours-branchement-input", label: "Direction, tours, branchement de l'input", debut: 109, fin: 215 },
      { lecon: "cpp-tick-fonctions-input", label: "Tick et fonctions d'input", debut: 216, fin: 304 },
      { lecon: "cpp-sol-vitesse-virage", label: "Sol, vitesse, virage", debut: 305, fin: 416 },
      { lecon: "cpp-drift-deplacement", label: "Drift, turbo, déplacement, inclinaison", debut: 417, fin: 520 },
      { lecon: "cpp-visuels-camera", label: "Roues, châssis, caméra, FOV", debut: 521, fin: 586 },
      { lecon: "cpp-rayons-roues", label: "Rayons sous les roues, rotation des roues", debut: 587, fin: 675 },
      { lecon: "cpp-saut-drift-debug", label: "Saut, drift, turbo, debug", debut: 676, fin: 776 },
      { lecon: "objets-bonus", label: "Turbo d'objet et tête-à-queue (modules Objets bonus et Pièges)", debut: 777, fin: 833 },
    ],
  },
  quizFinal: {
    id: "mario-kart/pawn-controller/final",
    questions: [
      {
        type: "qcm",
        enonce: "Dans quel ordre le Tick appelle-t-il ces étapes ?",
        choix: [
          "MoveKart, UpdateGround, UpdateSpeed, UpdateVisuals",
          "UpdateGround, UpdateSpeed, MoveKart, UpdateVisuals",
          "UpdateSpeed, UpdateGround, UpdateVisuals, MoveKart",
          "UpdateVisuals, UpdateSpeed, UpdateGround, MoveKart",
        ],
        bonne: 1,
        explication:
          "Lire le monde (sol), décider (vitesse), bouger (MoveKart), afficher (visuels). Chaque étape utilise le résultat des précédentes.",
      },
      {
        type: "qcm",
        enonce: "Quel composant se déplace vraiment et bloque contre les murs ?",
        choix: ["BodyMesh", "SpringArm", "WheelFrontLeft", "CollisionSphere"],
        bonne: 3,
        explication:
          "La sphère est la racine du kart, et c'est elle que MoveKart déplace avec un sweep. Les meshes n'ont pas de collision : ils sont seulement visuels et suivent la sphère.",
      },
      {
        type: "vrai-faux",
        enonce: "Le kart utilise la physique simulée d'Unreal (SetSimulatePhysics) pour avancer.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication:
          "Le constructeur appelle SetSimulatePhysics(false). Vitesse, gravité et collisions sont calculées à la main dans le Tick.",
      },
      {
        type: "qcm",
        enonce: "Pendant le compte à rebours, le kart est posé 1 mètre au-dessus de la piste. Que se passe-t-il ?",
        choix: [
          "Il reste suspendu en l'air jusqu'au GO",
          "Il tombe et se pose : le Tick efface seulement les touches, les étapes continuent",
          "Il est téléporté sur la piste par BeginPlay",
          "Il tombe à travers la piste",
        ],
        bonne: 1,
        explication:
          "BeginPlay met bCanMove à faux si la course n'a pas commencé. Le Tick remet alors ThrottleInput et SteerInput à 0, mais UpdateGround applique toujours la gravité et MoveKart déplace le kart.",
      },
      {
        type: "code",
        enonce: "Après ces deux lignes de Jump, qu'est-ce qui empêche UpdateGround de redéclarer le kart au sol à l'image suivante, alors que la route est encore juste sous les roues ?",
        code: "VerticalSpeed = JumpVelocity;\nbIsGrounded = false;",
        choix: [
          "La condition VerticalSpeed <= 0 : tant que le kart monte, il ne peut pas être au sol",
          "bIsGrounded = false bloque UpdateGround pendant une seconde",
          "Les rayons sous les roues sont désactivés pendant le saut",
          "Rien : le saut est annulé à l'image suivante",
        ],
        bonne: 0,
        explication:
          "bIsGrounded = bHitFloor && HeightAboveGround <= MaxGroundHeight && VerticalSpeed <= 0.f. Avec VerticalSpeed positive, la dernière condition est fausse : le kart reste en l'air jusqu'à ce que la gravité inverse sa vitesse.",
      },
      {
        type: "qcm",
        enonce: "Que se passe-t-il, dans l'ordre, quand le joueur appuie sur drift en tournant à 1500 cm/s, garde le bouton 1,5 s au sol, puis le relâche ?",
        choix: [
          "StartDrift, puis UpdateDrift charge à chaque image, puis EndDrift lance un super-turbo",
          "OnDriftPressed appelle UpdateDrift, qui donne le turbo tout de suite",
          "OnDriftPressed appelle StartDrift ; à chaque Tick, UpdateDrift fait monter DriftBlend et DriftChargeTime ; OnDriftReleased appelle EndDrift, qui lance un mini-turbo",
          "OnDriftReleased appelle StartDrift, puis EndDrift lance un mini-turbo",
        ],
        bonne: 2,
        explication:
          "Le bouton (Started puis Completed) démarre et termine le drift ; le Tick le fait progresser entre les deux. 1,5 s ≥ 1 s mais < 2 s : c'est le mini-turbo, de 0,6 s.",
      },
      {
        type: "qcm",
        enonce: "Le joueur drifte 2,5 secondes au sol puis relâche. Que se passe-t-il ?",
        choix: [
          "Rien, le drift était trop long",
          "Un mini-turbo de 0,6 seconde",
          "Les deux turbos à la suite",
          "Un super-turbo de 1,2 seconde",
        ],
        bonne: 3,
        explication:
          "2,5 s ≥ SuperTurboChargeTime (2 s), testé en premier : EndDrift appelle StartBoost(SuperTurboDuration), soit 1,2 s à BoostSpeed.",
      },
      {
        type: "qcm",
        enonce: "Pendant un turbo, que valent la vitesse du kart et le FOV visé ?",
        choix: [
          "CurrentSpeed = BoostSpeed (3500) et FOV visé = BoostFieldOfView (110)",
          "CurrentSpeed monte vers 3500 au rythme Acceleration, FOV visé = 100",
          "CurrentSpeed = MaxForwardSpeed (2500) et FOV visé = 110",
          "CurrentSpeed dépend de l'accélérateur, FOV visé = 90",
        ],
        bonne: 0,
        explication:
          "UpdateSpeed impose BoostSpeed tant que BoostTimeRemaining > 0, et UpdateCameraFieldOfView vise BoostFieldOfView. Le FOV, lui, y va en douceur avec FInterpTo.",
      },
      {
        type: "code",
        enonce: "Un designer met WallSpeedFactor à 0 dans l'éditeur. Que se passe-t-il quand le kart prend un mur de face ?",
        code: "CurrentSpeed *= FMath::Lerp(1.f, WallSpeedFactor, ImpactStrength);",
        choix: [
          "Le kart garde toute sa vitesse",
          "Le kart repart en arrière",
          "Le kart s'arrête net",
          "La valeur 0 est refusée par l'éditeur",
        ],
        bonne: 2,
        explication:
          "De face, ImpactStrength = 1 et Lerp(1, 0, 1) = 0 : CurrentSpeed devient 0. Le commentaire du header le dit (« 0 = arrêt net »), et ClampMin = 0 autorise cette valeur.",
      },
      {
        type: "qcm",
        enonce: "La constante WalkableFloorZ (0,7) sert à trier sol et mur. Où est-elle utilisée ?",
        choix: [
          "Seulement dans UpdateGround",
          "Dans TraceGroundUnderWheels (pour les rayons sous les roues) et dans MoveKart (pour les chocs de la sphère)",
          "Seulement dans AlignToGround",
          "Dans UpdateSteering, pour savoir si on peut tourner",
        ],
        bonne: 1,
        explication:
          "Les rayons ignorent une surface trop penchée (ce n'est pas un sol), et MoveKart traite un contact trop penché comme un mur. Une constante nommée garde la même valeur aux deux endroits.",
      },
      {
        type: "qcm",
        enonce: "Quel point commun entre UpdateGround (75 cm / 50 cm) et UpdateDrift (1000 cm/s / 500 cm/s) ?",
        choix: [
          "Les deux utilisent FInterpTo",
          "Les deux ne marchent qu'au sol",
          "Les deux utilisent un seuil pour entrer et un autre, plus permissif, pour sortir : l'état ne clignote pas",
          "Aucun",
        ],
        bonne: 2,
        explication:
          "C'est une hystérésis. On reste au sol jusqu'à 75 cm mais on n'atterrit que sous 50 cm ; on démarre un drift à 1000 cm/s mais il ne s'arrête que sous 500.",
      },
      {
        type: "qcm",
        enonce: "FInterpTo et FInterpConstantTo rapprochent tous deux une valeur de sa cible. Laquelle utilise-t-on pour la vitesse du moteur, et pourquoi ?",
        choix: [
          "FInterpTo, car elle est plus douce",
          "Aucune : la vitesse est copiée directement depuis l'input",
          "FInterpConstantTo, car elle donne une accélération régulière",
          "FInterpTo, car elle dépasse la cible",
        ],
        bonne: 2,
        explication:
          "Un moteur pousse toujours autant : un pas constant (FInterpConstantTo) est plus naturel. FInterpTo, qui ralentit près de la cible, sert aux mouvements du châssis, de la caméra et du FOV.",
      },
      {
        type: "code",
        enonce: "Pourquoi MoveKart couche-t-il la direction avant sur le plan du sol quand le kart est au sol ?",
        code: "Forward = FVector::VectorPlaneProject(Forward, GroundNormal).GetSafeNormal();",
        choix: [
          "Parce qu'AlignToGround incline le kart progressivement : sans ça, il taperait dans le bas des montées et décollerait en haut des bosses",
          "Pour que le kart tourne plus vite",
          "Pour détecter les murs",
          "Pour que la caméra suive le kart",
        ],
        bonne: 0,
        explication:
          "Le Slerp d'AlignToGround laisse l'avant du kart en retard sur la pente. La projection fait avancer le kart le long de la route, et GetSafeNormal lui garde sa vitesse.",
      },
      {
        type: "code",
        enonce: "D'où vient BodyBaseRotation, utilisée dans UpdateVisuals ?",
        code: "FRotator BodyRotation = BodyBaseRotation;\nBodyRotation.Yaw += BodySlideYaw + SpinOutYaw;\nBodyMesh->SetRelativeRotation(BodyRotation);",
        choix: [
          "Du constructeur, qui la met à zéro",
          "D'UpdateGround, qui la calcule à partir de la pente",
          "De la rotation du châssis à l'image précédente",
          "De BeginPlay, qui note la rotation du châssis réglée dans le Blueprint",
        ],
        bonne: 3,
        explication:
          "BeginPlay lit BodyMesh->GetRelativeRotation() une seule fois. Chaque image repart de cette valeur et ajoute l'angle de glissade : le réglage du Blueprint n'est jamais écrasé.",
      },
    ],
  },
  defi: {
    id: "mario-kart/pawn-controller/defi-boost-depart",
    titre: "Ajouter un boost au départ",
    consigne:
      "Si le joueur accélère pendant la dernière seconde du compte à rebours, le kart part avec un mini-turbo. Indices : pendant le décompte, OnThrottle remplit encore ThrottleInput avant que le Tick ne l'efface (ligne 223) ; le GameMode a une fonction GetCountdownNumber() qui vaut 1 pendant la dernière seconde ; quand le GameMode appelle SetCanMove(true), tu peux lancer StartBoost(MiniTurboDuration). Dépose un lien vers une capture ou une vidéo une fois fait.",
  },
};
