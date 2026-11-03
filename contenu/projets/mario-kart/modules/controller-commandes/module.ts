import type { Module } from "@/contenu/types";

export const controllerCommandes: Module = {
  slug: "controller-commandes",
  titre: "Le controller prend les commandes",
  resume: "Les touches passent du kart au PlayerController, pour qu'une IA puisse piloter le même kart",
  intro:
    "On veut ajouter des karts pilotés par des IA. Plutôt que d'écrire un deuxième kart, on sépare qui décide de qui exécute : le kart expose des commandes (accélérer, tourner, drifter, sauter, utiliser un objet), et c'est le PlayerController qui lit les touches et les transforme en commandes. Une IA appellera les mêmes commandes, sur le même BP_Kart. Le code évolue : on revient modifier deux classes déjà écrites.",
  fichiers: ["KartPawn.h", "KartPawn.cpp", "KartPlayerController.h", "KartPlayerController.cpp"],
  lecons: [
    {
      slug: "pourquoi",
      titre: "Pourquoi déplacer les touches ?",
      resume: "Séparer décision et exécution, puis les commandes publiques ajoutées dans KartPawn.h",
      dureeMin: 15,
      fichiers: ["KartPawn.h"],
      charger: () => import("./pourquoi.mdx"),
      quiz: {
        id: "mario-kart/controller-commandes/pourquoi",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi ne pas laisser le kart lire le clavier, comme avant ?",
            choix: [
              "Parce qu'une IA n'a pas de clavier : il faudrait un deuxième kart pour elle, avec tout le moteur en double",
              "Parce qu'un pawn n'a pas le droit de lire le clavier",
              "Parce que l'Enhanced Input ne marche que dans un PlayerController",
              "Pour que le jeu tourne plus vite",
            ],
            bonne: 0,
            explication:
              "Un pawn peut très bien lire les touches. Mais si la lecture des touches est dans le kart, une IA ne peut pas le piloter. Avec des commandes, le même kart sert à tout le monde.",
          },
          {
            type: "vrai-faux",
            enonce: "Avec les commandes, le kart sait s'il est piloté par un joueur ou par une IA.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Le kart reçoit seulement des appels à SetThrottleInput, StartDrift… Il ne sait pas qui les envoie, et n'a pas besoin de le savoir.",
          },
          {
            type: "qcm",
            enonce: "Qu'est devenue la fonction OnThrottleReleased du kart ?",
            choix: [
              "Elle est devenue publique",
              "Elle a été renommée EndThrottle",
              "Elle a disparu du kart : relâcher l'accélérateur, c'est appeler SetThrottleInput(0)",
              "Elle est appelée par le Tick",
            ],
            bonne: 2,
            explication: "Le kart n'a plus que SetThrottleInput. Le controller l'appelle avec la valeur de la touche, puis avec 0 quand on lâche.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi StartDrift, EndDrift et Jump sont-elles passées de private à public ?",
            choix: [
              "Parce qu'une UFUNCTION doit être publique",
              "Parce que ce sont maintenant des commandes appelées par le controller, une autre classe",
              "Pour pouvoir les appeler depuis le Tick",
              "Pour qu'elles apparaissent dans le panneau Details",
            ],
            bonne: 1,
            explication: "Avant, seules les fonctions d'input du kart les appelaient. Maintenant c'est le controller (ou une IA) : elles doivent être accessibles de l'extérieur.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/controller-commandes/pourquoi/ia",
          enonce:
            "Décris en quelques phrases ce que ferait une IA très simple pour faire un tour de circuit avec notre kart. Quelles commandes appellerait-elle, et à partir de quelles informations ?",
          attendus:
            "Un AIController qui, à chaque Tick, regarde où est le prochain checkpoint (position des ALapZone, NextCheckpoint du kart). Il calcule l'angle entre la direction du kart et la direction du checkpoint, appelle SetSteerInput avec une valeur entre -1 et 1 selon cet angle, et SetThrottleInput(1) (ou moins dans les virages serrés). Il peut appeler UseItem quand il a un objet, StartDrift/EndDrift dans les grands virages. Il n'a besoin d'aucune touche et le kart applique les mêmes règles que pour le joueur.",
        },
      ],
    },
    {
      slug: "commandes-kart",
      titre: "Les commandes dans KartPawn.cpp",
      resume: "SetThrottleInput, SetSteerInput et UseItem, puis les vérifications qui passent dans Jump et StartDrift",
      dureeMin: 15,
      fichiers: ["KartPawn.cpp"],
      charger: () => import("./commandes-kart.mdx"),
      quiz: {
        id: "mario-kart/controller-commandes/commandes-kart",
        questions: [
          {
            type: "code",
            enonce: "Une IA boguée appelle SetThrottleInput(5.f). Que vaut ThrottleInput ?",
            code: "ThrottleInput = FMath::Clamp(Value, -1.f, 1.f);",
            choix: ["5", "0", "-1", "1"],
            bonne: 3,
            explication: "Clamp ramène la valeur dans l'intervalle [-1, 1]. Le kart ne fait pas confiance à celui qui le pilote.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le test de bCanMove est-il maintenant dans Jump, et plus dans la fonction de la touche ?",
            choix: [
              "Parce que le controller n'a pas accès à bCanMove",
              "Parce que c'est plus rapide",
              "Parce que Jump est publique : si le test était dans le controller du joueur, une IA pourrait sauter pendant le compte à rebours",
              "Parce que le GameMode appelle Jump",
            ],
            bonne: 2,
            explication: "Une règle du kart doit être dans le kart : ainsi elle s'applique à tous ceux qui l'appellent, joueur ou IA.",
          },
          {
            type: "vrai-faux",
            enonce: "EndDrift teste bCanMove avant de finir le drift.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Finir un drift doit toujours être possible, même si le kart vient d'être bloqué : sinon un drift pourrait rester coincé.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi UseItem ne reçoit-il plus de FInputActionValue ?",
            choix: [
              "Parce que le kart ne connaît plus les touches : une commande n'a pas à savoir d'où elle vient",
              "Parce qu'un bouton n'a pas de valeur",
              "Parce que FInputActionValue n'existe plus dans Unreal 5",
              "Pour économiser de la mémoire",
            ],
            bonne: 0,
            explication: "FInputActionValue est un type d'Enhanced Input. Le kart n'inclut plus Enhanced Input : ses commandes reçoivent des valeurs simples, ou rien.",
          },
        ],
      },
    },
    {
      slug: "controller-header",
      titre: "Le header du PlayerController reçoit les touches",
      resume: "SetupInputComponent, la catégorie Kart > Input et les fonctions des touches dans KartPlayerController.h",
      dureeMin: 10,
      fichiers: ["KartPlayerController.h"],
      charger: () => import("./controller-header.mdx"),
      quiz: {
        id: "mario-kart/controller-commandes/controller-header",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi le header du controller annonce-t-il la classe AKartPawn ?",
            choix: [
              "Pour hériter du kart",
              "Pour créer le kart au début de la partie",
              "Ce n'est pas nécessaire",
              "Parce qu'il garde un pointeur vers le kart (GetKart) pour lui envoyer des commandes",
            ],
            bonne: 3,
            explication: "GetKart renvoie un AKartPawn*. Un pointeur suffit dans le header : la déclaration anticipée évite d'inclure KartPawn.h.",
          },
          {
            type: "qcm",
            enonce: "Quelle fonction joue, pour un controller, le rôle de SetupPlayerInputComponent du pawn ?",
            choix: ["BeginPlay", "SetupInputComponent", "OnPossess", "Tick"],
            bonne: 1,
            explication: "Unreal appelle SetupInputComponent quand il crée le composant d'input du controller : c'est là qu'on fait les BindAction.",
          },
          {
            type: "vrai-faux",
            enonce: "Les fonctions OnThrottle, OnSteer… du controller gardent un paramètre FInputActionValue.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication: "C'est la forme qu'attend BindAction. Ce sont les commandes du kart qui n'en ont plus.",
          },
        ],
      },
    },
    {
      slug: "controller-cpp",
      titre: "Des touches aux commandes : KartPlayerController.cpp",
      resume: "Le Mapping Context dans BeginPlay, les BindAction dans SetupInputComponent, GetKart et les huit fonctions qui envoient les commandes",
      dureeMin: 20,
      fichiers: ["KartPlayerController.cpp"],
      charger: () => import("./controller-cpp.mdx"),
      quiz: {
        id: "mario-kart/controller-commandes/controller-cpp",
        questions: [
          {
            type: "qcm",
            enonce: "Le joueur change de kart en cours de partie (réapparition). Ses touches marchent-elles encore ?",
            choix: [
              "Oui : l'InputComponent appartient au controller, et GetKart renvoie toujours le kart actuellement possédé",
              "Non, il faut rappeler SetupInputComponent",
              "Seulement l'accélérateur",
              "Non, le Mapping Context est perdu",
            ],
            bonne: 0,
            explication: "Les BindAction sont faits une fois sur le controller. Chaque fonction relit le kart possédé avec GetKart au moment de la touche.",
          },
          {
            type: "code",
            enonce: "Que se passe-t-il si le controller ne possède aucun kart quand on appuie sur l'accélérateur ?",
            code: "if (AKartPawn* Kart = GetKart())\n{\n\tKart->SetThrottleInput(Value.Get<float>());\n}",
            choix: [
              "Le jeu plante",
              "La valeur est gardée pour le prochain kart",
              "Rien : GetKart renvoie nullptr et le if est faux",
              "Un kart est créé",
            ],
            bonne: 2,
            explication: "La variable est déclarée et testée dans la même ligne. Avec nullptr, le bloc n'est pas exécuté.",
          },
          {
            type: "qcm",
            enonce: "Où le Mapping Context est-il ajouté maintenant ?",
            choix: [
              "Dans NotifyControllerChanged du kart",
              "Dans BeginPlay du PlayerController, pour le joueur local",
              "Dans SetupInputComponent",
              "Dans le GameMode",
            ],
            bonne: 1,
            explication: "Le controller récupère le sous-système Enhanced Input de son joueur local avec GetLocalPlayer() et y ajoute KartMappingContext.",
          },
          {
            type: "vrai-faux",
            enonce: "OnJumpPressed vérifie bCanMove avant d'appeler Jump.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Le controller ne fait que transmettre. C'est Jump, dans le kart, qui vérifie bCanMove et le tête-à-queue.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/controller-commandes/controller-cpp/regles",
          enonce:
            "Un camarade veut interdire l'utilisation d'objets pendant les 5 premières secondes de la course. Il propose d'ajouter le test dans OnUseItemPressed du PlayerController. Explique pourquoi ce n'est pas le bon endroit, et où le mettre.",
          attendus:
            "OnUseItemPressed n'est appelée que pour le joueur : une IA appellerait UseItem directement et échapperait à la règle. C'est une règle du kart (ou de la course), elle doit être dans la commande UseItem du kart (par exemple en comparant GetRaceTime() du GameMode à 5 secondes), là où passent tous les pilotes.",
        },
      ],
    },
    {
      slug: "mise-en-place",
      titre: "Mise en place dans l'éditeur",
      resume: "Les touches passent de BP_Kart à BP_Kart_Controller, avec des captures, puis le test",
      dureeMin: 10,
      fichiers: [],
      charger: () => import("./mise-en-place.mdx"),
      quiz: {
        id: "mario-kart/controller-commandes/mise-en-place",
        questions: [
          {
            type: "qcm",
            enonce: "Après le changement, le kart ne réagit à aucune touche. Que vérifies-tu en premier ?",
            choix: [
              "Les Input Actions de BP_Kart",
              "La table de tirage des objets",
              "Le nombre de tours du GameMode",
              "Que Kart Mapping Context et les Input Actions sont remplis dans BP_Kart_Controller",
            ],
            bonne: 3,
            explication: "Les réglages des touches sont maintenant dans le Blueprint du PlayerController. Ceux de BP_Kart n'existent plus.",
          },
          {
            type: "vrai-faux",
            enonce: "Il faut recréer les Input Actions et le Mapping Context pour le controller.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Ce sont les mêmes assets (IMC_Default, IA_Throttle…). On les choisit simplement dans un autre Blueprint.",
          },
          {
            type: "qcm",
            enonce: "Pour qu'un kart adverse soit piloté par une IA, que faudra-t-il changer dans BP_Kart ?",
            choix: [
              "Écrire une copie de BP_Kart pour les IA",
              "Rajouter les Input Actions dans BP_Kart",
              "Rien dans le code du kart : on lui donnera un AI Controller Class qui appelle les mêmes commandes",
              "Supprimer le PlayerController",
            ],
            bonne: 2,
            explication: "C'est tout l'intérêt du changement : le même kart, piloté par un autre controller.",
          },
        ],
      },
    },
  ],
  quizFinal: {
    id: "mario-kart/controller-commandes/final",
    questions: [
      {
        type: "qcm",
        enonce: "Dans cette nouvelle organisation, qui lit les touches du joueur ?",
        choix: ["Le PlayerController", "Le kart", "Le GameMode", "Le widget du HUD"],
        bonne: 0,
        explication: "Le PlayerController lit les touches et appelle les commandes du kart. Le kart ne lit plus rien.",
      },
      {
        type: "qcm",
        enonce: "Quel est le chemin d'un appui sur la touche de saut ?",
        choix: [
          "Touche → BindAction du kart → Jump",
          "Touche → GameMode → Jump",
          "Touche → Jump directement, sans controller",
          "Touche → Mapping Context → OnJumpPressed (controller) → GetKart → Kart->Jump → tests bCanMove, sol, tête-à-queue",
        ],
        bonne: 3,
        explication: "Le controller transmet ; c'est la commande du kart qui décide si le saut est permis.",
      },
      {
        type: "vrai-faux",
        enonce: "Une règle de jeu placée dans le PlayerController s'applique aussi aux IA.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication: "Les IA n'utilisent pas le PlayerController. Les règles communes vont dans le kart.",
      },
      {
        type: "code",
        enonce: "Que vaut SteerInput après cet appel ?",
        code: "Kart->SetSteerInput(-3.f);",
        choix: ["-3", "-1", "0", "3"],
        bonne: 1,
        explication: "SetSteerInput fait un Clamp entre -1 et 1 : -3 devient -1, à fond à gauche.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi KartPawn.cpp n'inclut-il plus EnhancedInputComponent.h ?",
        choix: [
          "Parce que le kart n'utilise plus aucune classe d'Enhanced Input : ses commandes reçoivent des float ou rien",
          "Parce qu'Unreal l'inclut tout seul",
          "Parce que c'est interdit dans un pawn",
          "Il l'inclut encore",
        ],
        bonne: 0,
        explication: "Les includes suivent le code : l'Enhanced Input est maintenant utilisé dans KartPlayerController.cpp.",
      },
      {
        type: "qcm",
        enonce: "À quoi sert GetKart dans le controller ?",
        choix: [
          "À créer un kart",
          "À vérifier bCanMove",
          "À retrouver le kart possédé, déjà converti en AKartPawn (ou nullptr)",
          "À ajouter le Mapping Context",
        ],
        bonne: 2,
        explication: "GetPawn<AKartPawn>() renvoie le pawn possédé converti en kart, ou nullptr si ce n'est pas un kart.",
      },
      {
        type: "vrai-faux",
        enonce: "Après le changement, il faut remplir les Input Actions dans BP_Kart_Controller au lieu de BP_Kart.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "Les UPROPERTY de la catégorie Kart > Input sont maintenant déclarés dans AKartPlayerController.",
      },
      {
        type: "qcm",
        enonce: "Un AKartAIController voudrait faire accélérer son kart. Que doit-il appeler ?",
        choix: [
          "OnThrottle du PlayerController",
          "GetPawn<AKartPawn>()->SetThrottleInput(1.f)",
          "Un BindAction sur IA_Throttle",
          "Il doit modifier CurrentSpeed directement",
        ],
        bonne: 1,
        explication: "L'IA n'a pas de touches : elle appelle directement les commandes du kart qu'elle possède.",
      },
    ],
  },
  defi: {
    id: "mario-kart/controller-commandes/defi-ia-simple",
    titre: "Une première IA",
    consigne:
      "Crée une classe C++ AKartAIController qui hérite de AAIController. Dans son Tick, récupère le kart avec GetPawn<AKartPawn>(), appelle SetThrottleInput(1.f), et SetSteerInput avec une valeur qui tourne vers le prochain checkpoint (indice : compare la direction du kart et la direction vers la zone avec un produit scalaire, ou plus simplement avec FVector::CrossProduct pour savoir si la cible est à gauche ou à droite). Pose un deuxième BP_Kart dans le niveau, mets AKartAIController dans AI Controller Class et Auto Possess AI sur Placed in World. Dépose une vidéo de ton kart IA qui fait un tour.",
  },
};
