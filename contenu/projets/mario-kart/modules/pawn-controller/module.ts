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
            type: "qcm",
            enonce: "Pourquoi MaxForwardSpeed est-il précédé de UPROPERTY(EditAnywhere) ?",
            choix: [
              "Pour que la variable soit plus rapide à lire",
              "Pour pouvoir régler la vitesse dans l'éditeur sans recompiler",
              "Parce que toute variable float doit avoir cette macro",
              "Pour la rendre publique",
            ],
            bonne: 1,
            explication:
              "EditAnywhere affiche la variable dans le panneau Details : on ajuste la vitesse du kart dans l'éditeur, sans toucher au code ni recompiler.",
          },
          {
            type: "code",
            enonce: "Quel mot manque pour que Tick remplace la version de APawn ?",
            code: "virtual void Tick(float DeltaTime) ____;",
            choix: ["override", "final", "static", "const"],
            bonne: 0,
            explication: "override indique qu'on redéfinit une fonction virtuelle de la classe parente. Le compilateur vérifie que la signature correspond.",
          },
          {
            type: "vrai-faux",
            enonce: "KartPawn.generated.h peut être placé au début de la liste des #include.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Il doit toujours être le dernier #include du header, sinon l'outil de génération d'Unreal (UHT) refuse de compiler.",
          },
          {
            type: "qcm",
            enonce: "Quelle est la différence entre CollisionSphere (VisibleAnywhere) et MaxForwardSpeed (EditAnywhere) ?",
            choix: [
              "Aucune, les deux options sont synonymes",
              "On voit le composant dans l'éditeur mais on ne peut pas le remplacer ; la vitesse, elle, se modifie",
              "VisibleAnywhere cache la variable pendant le Play",
              "EditAnywhere ne marche que pour les composants",
            ],
            bonne: 1,
            explication:
              "VisibleAnywhere : on voit la variable (et on peut régler les propriétés du composant) mais on ne peut pas changer le pointeur lui-même. EditAnywhere : on peut changer sa valeur.",
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
            enonce: "Pourquoi la sphère de collision est-elle le RootComponent du kart ?",
            choix: [
              "Parce que c'est le premier composant créé",
              "Parce que déplacer le kart revient à déplacer sa racine, et c'est sa collision qui est testée",
              "Parce qu'une sphère est toujours invisible",
              "Parce qu'Unreal interdit qu'un mesh soit racine",
            ],
            bonne: 1,
            explication:
              "La position de l'acteur est celle de sa racine. Quand on déplace le kart avec un sweep, c'est la forme de collision de la racine, la sphère, qui s'arrête contre les murs.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi les roues sont-elles attachées au châssis (BodyMesh) et pas à la sphère ?",
            choix: [
              "Pour qu'elles aient une collision",
              "Pour qu'elles tournent plus vite",
              "Pour qu'elles suivent le châssis quand il se met de travers pendant le drift",
              "Parce que la sphère n'accepte qu'un seul enfant",
            ],
            bonne: 2,
            explication:
              "Pendant le drift, on tourne le châssis. Les roues, attachées à lui, suivent ce mouvement automatiquement.",
          },
          {
            type: "vrai-faux",
            enonce: "On pourrait lire le GameMode dans le constructeur plutôt que dans BeginPlay.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le constructeur s'exécute aussi en dehors de toute partie, quand il n'y a ni monde ni GameMode. Tout ce qui a besoin du monde se fait dans BeginPlay.",
          },
          {
            type: "qcm",
            enonce: "Que se passe-t-il si on lance un niveau qui n'utilise pas AKartGameMode ?",
            choix: [
              "Le jeu plante dans BeginPlay",
              "Le kart reste bloqué pour toujours",
              "Le kart attend 3 secondes avant de rouler",
              "Le kart peut rouler tout de suite, car bCanMove garde sa valeur par défaut (true)",
            ],
            bonne: 3,
            explication:
              "GetAuthGameMode<AKartGameMode>() renvoie nullptr, le if est sauté, et bCanMove reste à true.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay note-t-elle la rotation de départ du châssis et des roues ?",
            choix: [
              "Pour tourner les pièces par-dessus cette rotation sans écraser le réglage du Blueprint",
              "Pour remettre le kart à zéro à la fin de la course",
              "Pour l'afficher dans le debug",
              "Pour calculer la vitesse du kart",
            ],
            bonne: 0,
            explication:
              "Les modèles ont parfois besoin d'être tournés dans le Blueprint. Le code ajoute ses rotations (drift, braquage) à cette rotation de départ au lieu de la remplacer.",
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
            type: "qcm",
            enonce: "Le kart est à l'arrêt (CurrentSpeed = 0). Que renvoie GetMoveDirection ?",
            choix: [
              "La flèche vers l'avant du kart",
              "La flèche vers l'arrière du kart",
              "Une flèche nulle, car Sign(0) vaut 0",
              "La verticale du monde",
            ],
            bonne: 2,
            explication:
              "GetMoveDirection multiplie l'avant du kart par FMath::Sign(CurrentSpeed). Sign vaut 0 quand la vitesse est nulle : la flèche obtenue est nulle.",
          },
          {
            type: "qcm",
            enonce: "Le kart passe la ligne d'arrivée (zone 0) sans avoir traversé tous les checkpoints du tour. Que fait EnterLapZone ?",
            choix: [
              "Elle appelle CompleteLap",
              "Rien : la ligne d'arrivée ne compte que si NextCheckpoint a dépassé le nombre de checkpoints",
              "Elle remet NextCheckpoint à 1",
              "Elle termine la course",
            ],
            bonne: 1,
            explication:
              "La condition ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount() est fausse : aucun if n'est vrai, la zone est ignorée.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si on supprimait le lien Completed de ThrottleAction (ligne 203) ?",
            choix: [
              "Le kart ne pourrait plus accélérer",
              "Rien, Triggered remet la valeur à 0 tout seul",
              "Le jeu ne compilerait plus",
              "Le kart continuerait d'accélérer après qu'on a lâché la touche",
            ],
            bonne: 3,
            explication:
              "Quand on lâche, Triggered n'est plus appelé. Sans OnThrottleReleased, ThrottleInput garderait sa dernière valeur (par exemple 1).",
          },
          {
            type: "code",
            enonce: "Quel événement faut-il pour que le saut ne parte qu'une fois par appui ?",
            code: "EnhancedInput->BindAction(JumpAction, ETriggerEvent::____, this, &AKartPawn::OnJumpPressed);",
            choix: ["Triggered", "Started", "Completed", "Ongoing"],
            bonne: 1,
            explication:
              "Started se déclenche une seule fois, au moment de l'appui. Triggered serait appelé à chaque image tant que le bouton est tenu.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ajoute-t-on le Mapping Context dans NotifyControllerChanged ?",
            choix: [
              "Parce que c'est à ce moment qu'on sait quel Controller (et donc quel joueur) pilote le kart",
              "Parce que BeginPlay n'existe pas pour un Pawn",
              "Parce que le constructeur est trop lent",
              "Parce que le Mapping Context doit être recréé à chaque image",
            ],
            bonne: 0,
            explication:
              "Le Mapping Context s'ajoute au sous-système Enhanced Input d'un joueur local. Il faut donc connaître le PlayerController qui possède le kart.",
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
              "Il met les inputs à zéro puis continue : la gravité marche toujours",
              "Il désactive le Tick jusqu'au GO",
              "Il téléporte le kart sur la ligne de départ",
            ],
            bonne: 1,
            explication:
              "Les lignes 223 à 227 remettent ThrottleInput et SteerInput à 0, mais il n'y a pas de return : toutes les étapes s'exécutent, donc le kart reste posé sur la piste.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi UpdateGround est-elle la première étape du Tick ?",
            choix: [
              "Parce que c'est la fonction la plus courte",
              "Parce qu'Unreal l'exige pour tous les Pawns",
              "Parce que les étapes suivantes ont besoin de savoir si le kart est au sol",
              "Parce qu'elle affiche le debug",
            ],
            bonne: 2,
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
              "EndDrift est appelée quand même : OnDriftReleased ne teste pas bCanMove",
              "Le kart saute",
              "Le drift démarre",
            ],
            bonne: 1,
            explication:
              "Seules OnDriftPressed et OnJumpPressed vérifient bCanMove. OnDriftReleased appelle toujours EndDrift, pour qu'un drift ne reste jamais bloqué en cours.",
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
              "Pour que le kart reste collé en haut des bosses au lieu de décoller",
              "Pour que le kart saute plus haut",
              "Pour économiser des rayons",
              "Pour que la gravité soit plus forte",
            ],
            bonne: 0,
            explication:
              "Au sommet d'une bosse, la route s'éloigne vite. Une fois au sol, on y reste collé jusqu'à 75 cm : le kart ne clignote pas entre « au sol » et « en l'air ».",
          },
          {
            type: "code",
            enonce: "Le kart est au sol, son centre est à 40 cm de la route (RideHeight = 45). Que fait cette ligne ?",
            code: "const float HeightError = HeightAboveGround - RideHeight;\nAddActorWorldOffset(-GetActorUpVector() * HeightError, true);",
            choix: [
              "Elle descend le kart de 5 cm",
              "Elle monte le kart de 5 cm",
              "Elle ne fait rien",
              "Elle monte le kart de 45 cm",
            ],
            bonne: 1,
            explication:
              "HeightError = 40 - 45 = -5. -Up × -5 = +5 vers le haut : le kart remonte à la bonne hauteur.",
          },
          {
            type: "qcm",
            enonce: "Le kart avance à 2000 cm/s et le joueur appuie sur frein (ThrottleInput = -1). Quel rythme utilise UpdateSpeed ?",
            choix: [
              "CoastDeceleration",
              "Acceleration",
              "TurnRate",
              "BrakeDeceleration",
            ],
            bonne: 3,
            explication:
              "ThrottleInput est négatif et CurrentSpeed est positif : le kart roule encore vers l'avant, donc Rate = BrakeDeceleration. Une fois arrêté, il passera à Acceleration pour reculer.",
          },
          {
            type: "qcm",
            enonce: "Le kart roule à 30 cm/s (MinSpeedToTurn = 50) et le joueur tourne le volant. Que se passe-t-il ?",
            choix: [
              "Le kart tourne normalement",
              "Le kart tourne deux fois moins vite",
              "Le kart ne tourne pas",
              "Le kart démarre un drift",
            ],
            bonne: 2,
            explication:
              "FMath::Abs(CurrentSpeed) est inférieur à MinSpeedToTurn : UpdateSteering sort tout de suite. Le kart ne pivote pas sur place.",
          },
          {
            type: "qcm",
            enonce: "Pendant un drift à droite entièrement engagé, le joueur pousse le volant à fond à gauche. Que fait le kart ?",
            choix: [
              "Il tourne à gauche",
              "Il va tout droit",
              "Il tourne toujours à droite, mais moins fort (virage plus large)",
              "Le drift s'arrête",
            ],
            bonne: 2,
            explication:
              "SteerAlongDrift vaut -1, converti en 0,5 par GetMappedRangeValueClamped, puis multiplié par DriftDirection (+1) : le kart tourne à droite, à la moitié de la force.",
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
            type: "vrai-faux",
            enonce: "Si on sautait pendant un drift, DriftChargeTime continuerait d'augmenter en l'air.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Lignes 436 à 440 : la charge n'augmente que si bIsGrounded est vrai. En l'air, elle est en pause.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi appelle-t-on GetSafeNormal après VectorPlaneProject dans MoveKart ?",
            choix: [
              "Pour que le kart aille plus vite que sa vitesse max",
              "Parce que la projection raccourcit la flèche : on la remet à une longueur de 1 pour ne pas ralentir dans les pentes",
              "Pour inverser la direction en marche arrière",
              "Pour ignorer les murs",
            ],
            bonne: 1,
            explication:
              "L'ombre d'une flèche est plus courte que la flèche. Sans la remettre à 1, Forward × CurrentSpeed donnerait un déplacement plus petit dans les pentes.",
          },
          {
            type: "qcm",
            enonce: "Que se passe-t-il si on remplace true par false dans AddActorWorldOffset(Delta, true, &Hit) ?",
            choix: [
              "Le kart irait deux fois plus vite",
              "Le kart ne pourrait plus tourner",
              "La sphère serait téléportée sans test de collision : le kart pourrait traverser les murs",
              "Rien ne change",
            ],
            bonne: 2,
            explication:
              "true active le sweep : la sphère s'arrête au premier obstacle. Sans sweep, elle est simplement déplacée à la nouvelle position, même à travers un mur.",
          },
          {
            type: "qcm",
            enonce: "Le kart prend un mur parfaitement de face. Quelle part de sa vitesse garde-t-il (WallSpeedFactor = 0,3) ?",
            choix: ["100 %", "70 %", "0 %", "30 %"],
            bonne: 3,
            explication:
              "De face, ImpactStrength vaut 1, et Lerp(1, WallSpeedFactor, 1) = 0,3. En frôlant le mur, ImpactStrength vaudrait 0 et la vitesse serait conservée.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi AlignToGround utilise-t-il Slerp avec un petit Alpha au lieu d'appliquer directement la rotation cible ?",
            choix: [
              "Pour que le kart ne tremble pas à chaque petite variation de la pente",
              "Parce que SetActorRotation ne peut tourner que d'un petit angle",
              "Pour que le kart tourne plus vite dans les virages",
              "Parce que les quaternions ne peuvent pas être copiés",
            ],
            bonne: 0,
            explication:
              "La normale du sol bouge un peu à chaque bosse. En faisant seulement une partie du chemin à chaque image, on lisse ces secousses.",
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
              "Parce qu'en radians, l'angle parcouru par une roue qui roule vaut la distance divisée par son rayon",
              "Parce que c'est une approximation qui marche à basse vitesse",
              "Parce que le rayon est toujours égal à 1",
              "Pour que les roues tournent moins vite que le kart",
            ],
            bonne: 0,
            explication:
              "Un radian, c'est l'angle pour lequel la roue a roulé d'une distance égale à son rayon. On convertit ensuite en degrés avec RadiansToDegrees.",
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
              "Le pas constant donne une accélération régulière, comme un moteur. FInterpTo donne un mouvement doux, utilisé pour la caméra et le châssis.",
          },
          {
            type: "qcm",
            enonce: "CameraSlopeDeadZone vaut 10. Le kart monte une pente de 25 degrés. Quelle inclinaison vise la caméra ?",
            choix: ["25 degrés", "10 degrés", "0 degré", "15 degrés"],
            bonne: 3,
            explication:
              "Au-delà de la zone morte, on retire ses 10 degrés : 25 - 10 = 15. Ainsi la caméra commence à s'incliner depuis 0, sans à-coup au passage du seuil.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le FOV s'élargit-il quand le kart va vite ?",
            choix: [
              "Pour voir le compteur de vitesse",
              "Pour que le kart aille réellement plus vite",
              "Pour donner une sensation de vitesse : le décor semble défiler plus vite sur les côtés",
              "Pour réduire le nombre d'objets affichés",
            ],
            bonne: 2,
            explication:
              "Un champ de vision plus large étire les bords de l'image. C'est un effet visuel : la vitesse réelle du kart ne change pas.",
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
            enonce: "Le produit scalaire entre la normale d'une surface et le haut du kart vaut 0,2. Qu'est-ce que c'est pour le kart ?",
            choix: [
              "Un sol plat",
              "Un mur (ou une pente trop raide)",
              "Une surface sous le kart, à l'envers",
              "Une pente douce",
            ],
            bonne: 1,
            explication:
              "Plus le produit scalaire est proche de 1, plus la surface est à plat. 0,2 est sous WalkableFloorZ (0,7) : la surface est trop penchée, c'est un mur.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi les rayons partent-ils au-dessus du kart (Up * RideHeight) ?",
            choix: [
              "Pour que le rayon soit plus long et plus précis",
              "Pour toucher le toit du kart",
              "Pour ne pas démarrer sous la route quand le kart est dans une montée",
              "Parce qu'un rayon doit toujours partir du ciel",
            ],
            bonne: 2,
            explication:
              "Dans une montée, le point sous une roue avant peut se trouver sous la surface. En partant plus haut, le rayon commence toujours au-dessus de la route.",
          },
          {
            type: "qcm",
            enonce: "À quoi sert Params.AddIgnoredActor(this) ?",
            choix: [
              "À empêcher le kart de toucher les autres karts",
              "À rendre le rayon invisible",
              "À ce que le rayon ne touche pas notre propre kart",
              "À ignorer les murs",
            ],
            bonne: 2,
            explication:
              "Les rayons partent de l'intérieur de notre kart : sans cette option, ils toucheraient d'abord notre propre sphère au lieu du sol.",
          },
          {
            type: "qcm",
            enonce: "Quand les quatre roues touchent, que donne le produit vectoriel des deux diagonales ?",
            choix: [
              "La hauteur moyenne du sol",
              "La vitesse du kart",
              "La distance entre les roues",
              "Une flèche perpendiculaire au plan des quatre roues : la normale du sol",
            ],
            bonne: 3,
            explication:
              "Le produit vectoriel de deux flèches couchées sur une surface donne la flèche perpendiculaire à cette surface. On la retourne si elle pointe vers le bas.",
          },
          {
            type: "vrai-faux",
            enonce: "Si aucune roue ne touche le sol, la fonction renvoie 0 et une normale qui pointe vers le ciel.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "Lignes 631 à 636 : OutGroundPoint vaut la position du kart, OutGroundNormal vaut FVector::UpVector, et la fonction renvoie 0.",
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
              "Jump ne fait que donner une vitesse verticale (JumpVelocity). C'est MoveKart qui déplace le kart, et la gravité d'UpdateGround qui réduit cette vitesse jusqu'à le faire retomber.",
          },
          {
            type: "qcm",
            enonce: "Le joueur appuie sur drift à 1500 cm/s, au sol, mais sans tourner. Que se passe-t-il ?",
            choix: [
              "Le drift démarre vers la droite",
              "Le drift ne démarre pas : il faut tourner d'un côté",
              "Le kart obtient tout de suite un mini-turbo",
              "Le kart saute",
            ],
            bonne: 1,
            explication:
              "StartDrift vérifie FMath::IsNearlyZero(SteerInput) : sans direction, on ne sait pas de quel côté glisser, et la fonction s'arrête.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi EndDrift teste-t-elle SuperTurboChargeTime avant MiniTurboChargeTime ?",
            choix: [
              "Parce que le super-turbo est plus rapide à calculer",
              "Pour que le mini-turbo soit plus long",
              "L'ordre n'a aucune importance",
              "Parce qu'un drift assez long pour le super-turbo l'est aussi pour le mini : testé en premier, le mini gagnerait toujours",
            ],
            bonne: 3,
            explication:
              "Avec if / else if, seule la première condition vraie compte. Un drift de 2,5 s passe le test du mini (≥ 1 s) : il faut donc tester le super (≥ 2 s) d'abord.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ShowDebugInfo doit-elle être appelée à chaque image ?",
            choix: [
              "Parce que ses messages ont une durée de 0 : ils ne restent affichés qu'une image",
              "Parce que GEngine est remis à nullptr à chaque image",
              "Parce que la case de debug du GameMode peut changer à tout moment",
              "Ce n'est pas nécessaire, une fois suffit",
            ],
            bonne: 0,
            explication:
              "AddOnScreenDebugMessage est appelée avec une durée de 0 : le message disparaît après une image. La case du GameMode, elle, n'est lue qu'une fois, dans BeginPlay.",
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
        choix: ["BodyMesh", "SpringArm", "CollisionSphere", "WheelFrontLeft"],
        bonne: 2,
        explication:
          "La sphère est la racine du kart. Les meshes n'ont pas de collision : ils sont seulement visuels et suivent la sphère.",
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
        enonce: "Deux vecteurs de longueur 1 sont perpendiculaires. Que vaut leur produit scalaire ?",
        choix: ["1", "-1", "0", "0,7"],
        bonne: 2,
        explication:
          "Le produit scalaire vaut 1 pour deux directions identiques, -1 pour deux directions opposées, 0 quand elles sont perpendiculaires.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi les fonctions OnThrottle et OnSteer se contentent-elles de ranger une valeur ?",
        choix: [
          "Parce qu'une fonction d'input ne peut pas appeler d'autres fonctions",
          "Parce que le mouvement est calculé dans le Tick, à chaque image, avec DeltaTime et dans un ordre maîtrisé",
          "Parce que l'Enhanced Input efface les variables à chaque image",
          "Pour économiser de la mémoire",
        ],
        bonne: 1,
        explication:
          "Les fonctions d'input notent ce que veut le joueur. Le Tick transforme ces notes en mouvement à chaque image, même quand aucune touche n'est appuyée.",
      },
      {
        type: "qcm",
        enonce: "Que fait Jump() ?",
        choix: [
          "Elle déplace le kart de 40 cm vers le haut",
          "Elle désactive la gravité pendant une seconde",
          "Si le kart est au sol, elle lui donne une vitesse verticale vers le haut ; la gravité le fait ensuite retomber",
          "Elle lance un drift",
        ],
        bonne: 2,
        explication:
          "Jump règle VerticalSpeed = JumpVelocity et bIsGrounded = false. UpdateGround applique la gravité, MoveKart déplace le kart.",
      },
      {
        type: "qcm",
        enonce: "Le joueur drifte 2,5 secondes au sol puis relâche. Que se passe-t-il ?",
        choix: [
          "Rien, le drift était trop long",
          "Un mini-turbo de 0,6 seconde",
          "Un super-turbo de 1,2 seconde",
          "Les deux turbos à la suite",
        ],
        bonne: 2,
        explication:
          "2,5 s ≥ SuperTurboChargeTime (2 s) : EndDrift appelle StartBoost(SuperTurboDuration), soit 1,2 s à BoostSpeed.",
      },
      {
        type: "qcm",
        enonce: "FInterpTo et FInterpConstantTo rapprochent tous deux une valeur de sa cible. Laquelle utilise-t-on pour la vitesse du moteur, et pourquoi ?",
        choix: [
          "FInterpConstantTo, car elle donne une accélération régulière",
          "FInterpTo, car elle est plus douce",
          "Aucune : la vitesse est copiée directement depuis l'input",
          "FInterpTo, car elle dépasse la cible",
        ],
        bonne: 0,
        explication:
          "Un moteur pousse toujours autant : un pas constant (FInterpConstantTo) est plus naturel. FInterpTo, qui ralentit près de la cible, sert aux mouvements de caméra et du châssis.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi MoveKart projette-t-il la direction avant sur le plan du sol quand le kart est au sol ?",
        choix: [
          "Pour que le kart avance le long de la route même s'il n'a pas fini de s'incliner",
          "Pour que le kart tourne plus vite",
          "Pour détecter les murs",
          "Pour que la caméra suive le kart",
        ],
        bonne: 0,
        explication:
          "AlignToGround incline le kart progressivement. Sans projection, il taperait dans le bas des montées et décollerait en haut des bosses.",
      },
      {
        type: "vrai-faux",
        enonce: "Le kart est déclaré au sol avec deux seuils différents : un pour y rester, un pour y revenir. Ça évite qu'il clignote entre « au sol » et « en l'air » sur les bosses.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication:
          "Au sol, on y reste jusqu'à RideHeight + GroundStickDistance (75 cm). Pour atterrir, il faut descendre sous RideHeight + GroundSnapTolerance (50 cm).",
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
