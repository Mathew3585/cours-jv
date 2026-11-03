import type { Module } from "@/contenu/types";

export const objetsBonus: Module = {
  slug: "objets-bonus",
  titre: "Boîtes et objets bonus",
  resume: "Un cube qui tourne, des objets en Data Assets, une poche et des boîtes sur la piste",
  intro:
    "On ajoute au jeu des boîtes à bonus : le kart qui roule dedans reçoit un objet au hasard, qu'il utilise avec une touche. Tout est construit pour être modulaire : chaque objet est un Data Asset, la poche du kart est un composant, et la boîte hérite d'une classe qui sait tourner et flotter. À la fin, ajouter un objet ne demande plus de toucher au kart.",
  fichiers: [
    "RotatingObject.h",
    "RotatingObject.cpp",
    "KartItemData.h",
    "KartItemData.cpp",
    "KartItemData_Boost.h",
    "KartItemData_Boost.cpp",
    "KartItemPoolData.h",
    "KartItemPoolData.cpp",
    "KartItemComponent.h",
    "KartItemComponent.cpp",
    "KartItemBox.h",
    "KartItemBox.cpp",
    "KartPawn.h",
    "KartPawn.cpp",
  ],
  lecons: [
    {
      slug: "rotating-object",
      titre: "Un objet qui tourne et flotte : RotatingObject",
      resume: "RotatingObject.h puis RotatingObject.cpp en entier : deux racines, rotation sur trois axes et flottement avec un sinus",
      dureeMin: 20,
      fichiers: ["RotatingObject.h", "RotatingObject.cpp"],
      charger: () => import("./rotating-object.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/rotating-object",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi les meshes doivent-ils être attachés à AnimatedRoot et pas à Root ?",
            choix: [
              "Parce que c'est AnimatedRoot qui tourne et flotte : ce qui est attaché à Root reste immobile",
              "Parce que Root n'accepte pas d'enfants",
              "Parce que Root est détruit au lancement du jeu",
              "Pour que la collision fonctionne",
            ],
            bonne: 0,
            explication:
              "Le Tick ne fait bouger qu'AnimatedRoot. Root reste à la position posée dans le niveau, c'est voulu : on y accroche ce qui ne doit pas bouger.",
          },
          {
            type: "code",
            enonce: "BobHeight vaut 20. Entre quelles valeurs varie BobOffset ?",
            code: "const float BobOffset = FMath::Sin(AnimationTime * BobFrequency * 2.f * PI) * BobHeight;",
            choix: ["Entre 0 et 20", "Entre -1 et 1", "Entre -20 et 20", "Entre 0 et 40"],
            bonne: 2,
            explication: "Le sinus varie entre -1 et 1. Multiplié par 20, le décalage va de -20 à +20 cm autour de la position de départ.",
          },
          {
            type: "qcm",
            enonce: "BobFrequency vaut 0,5. Combien de temps dure un aller-retour complet (monter puis redescendre) ?",
            choix: ["0,5 seconde", "2 secondes", "1 seconde", "5 secondes"],
            bonne: 1,
            explication: "La fréquence est le nombre d'allers-retours par seconde. 0,5 par seconde, c'est un aller-retour toutes les 1 / 0,5 = 2 secondes.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on décoche bRandomStartPhase, toutes les boîtes posées dans le niveau tournent et flottent exactement en même temps.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "Elles partent toutes avec AnimationTime = 0 et la même rotation de départ. Avec un départ au hasard, chacune commence à un moment différent de l'animation.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi Root et AnimatedRoot sont-ils protected plutôt que private ?",
            choix: [
              "Pour qu'on puisse les modifier depuis le niveau",
              "Parce qu'un composant ne peut pas être private",
              "Pour les cacher dans l'éditeur",
              "Pour que les classes enfants, comme AKartItemBox, puissent y attacher leurs composants",
            ],
            bonne: 3,
            explication: "protected rend un membre accessible à la classe et à ses enfants. La boîte accroche sa sphère à Root et son cube à AnimatedRoot.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/rotating-object/deux-racines",
          enonce:
            "Un camarade propose de supprimer AnimatedRoot et de faire tourner l'acteur entier avec AddActorLocalRotation. Explique ce qui ne marcherait plus pour la boîte à bonus.",
          attendus:
            "Tous les composants tourneraient et flotteraient, y compris la sphère de détection de la boîte. La position de l'acteur changerait à chaque image (il faudrait gérer la position de départ autrement). Avec deux racines, Root reste fixe (zone de détection, position dans le niveau) et seul AnimatedRoot bouge (le visuel).",
        },
      ],
    },
    {
      slug: "principe-bonus",
      titre: "Le principe et le Data Asset parent",
      resume: "Qui fait quoi dans le système d'objets, puis KartItemData.h et KartItemData.cpp : Abstract, virtual et const",
      dureeMin: 15,
      fichiers: ["KartItemData.h", "KartItemData.cpp"],
      charger: () => import("./principe-bonus.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/principe-bonus",
        questions: [
          {
            type: "qcm",
            enonce: "Que se passe-t-il quand tu crées un Data Asset dans l'éditeur et que tu cherches la classe KartItemData ?",
            choix: [
              "Elle apparaît en premier dans la liste",
              "Unreal plante",
              "Elle n'apparaît pas, à cause de Abstract : seules ses classes enfants sont proposées",
              "Elle apparaît, mais grisée",
            ],
            bonne: 2,
            explication: "UCLASS(Abstract) interdit de créer un asset de cette classe. On choisit un enfant comme KartItemData_Boost.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi Activate est-elle const ?",
            choix: [
              "Parce qu'un même Data Asset est partagé par tous les karts : il ne doit rien retenir sur un kart en particulier",
              "Pour qu'elle soit plus rapide",
              "Parce que toutes les fonctions virtual doivent être const",
              "Pour pouvoir l'appeler depuis un Blueprint",
            ],
            bonne: 0,
            explication: "Il n'existe qu'un DA_Item_Turbo en mémoire. Le const empêche de modifier l'asset : l'état propre à chaque kart est rangé dans sa poche.",
          },
          {
            type: "vrai-faux",
            enonce: "Pour ajouter un triple turbo, il faut écrire une nouvelle classe C++.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "On crée un deuxième asset de la classe turbo avec Uses = 3. Les données changent, pas le code.",
          },
          {
            type: "code",
            enonce: "Que renvoie la version du parent, et pourquoi ?",
            code: "bool UKartItemData::Activate(AKartPawn* Kart) const\n{\n\treturn false;\n}",
            choix: [
              "true, pour que l'objet soit toujours consommé",
              "nullptr, car il n'y a pas d'objet",
              "Elle ne compile pas : un parent ne peut pas avoir de code",
              "false : le parent n'a pas d'effet, donc l'objet n'est pas consommé si un enfant oublie de la redéfinir",
            ],
            bonne: 3,
            explication: "false veut dire « pas utilisé ». La poche ne retire alors pas d'utilisation.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/principe-bonus/const-partage",
          enonce:
            "Un élève veut ajouter une variable « int32 UsesLeft » dans UKartItemData pour compter les utilisations restantes. Explique pourquoi c'est une mauvaise idée avec un exemple à deux karts, et dis où ranger ce compteur.",
          attendus:
            "Le Data Asset est partagé : les deux karts qui ont un triple turbo pointent vers le même DA_Item_TripleTurbo. Si le kart A utilise un turbo, le compteur baisse aussi pour le kart B. En plus, la modification resterait dans l'asset pendant la session. Le compteur doit être dans quelque chose qui existe une fois par kart : le composant UKartItemComponent (UsesLeft).",
        },
      ],
    },
    {
      slug: "objets-et-tirage",
      titre: "Le turbo et la table de tirage",
      resume: "KartItemData_Boost (un enfant qui redéfinit Activate) puis KartItemPoolData (USTRUCT, TArray et tirage pondéré)",
      dureeMin: 20,
      fichiers: ["KartItemData_Boost.h", "KartItemData_Boost.cpp", "KartItemPoolData.h", "KartItemPoolData.cpp"],
      charger: () => import("./objets-et-tirage.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/objets-et-tirage",
        questions: [
          {
            type: "qcm",
            enonce: "Dans KartItemData_Boost.h, pourquoi inclut-on Items/KartItemData.h au lieu d'une déclaration anticipée ?",
            choix: [
              "Parce que c'est plus rapide à compiler",
              "Pour hériter d'une classe, le compilateur doit la connaître en entier",
              "Parce que UKartItemData est abstraite",
              "Ce n'est pas nécessaire, une déclaration anticipée suffirait",
            ],
            bonne: 1,
            explication: "Une déclaration anticipée suffit pour un pointeur, pas pour hériter : le compilateur doit savoir ce que contient le parent.",
          },
          {
            type: "qcm",
            enonce: "Une table contient : turbo (poids 3), triple turbo (poids 1). Quelle est la chance d'obtenir le triple turbo ?",
            choix: ["1 sur 4", "1 sur 3", "1 sur 2", "1 %"],
            bonne: 0,
            explication: "Total des poids = 4. Le triple turbo a 1 part sur 4, donc 25 %.",
          },
          {
            type: "code",
            enonce: "Turbo 50, Piège 30, Projectile 20, dans cet ordre. Roll vaut 85. Quel objet sort ?",
            code: "Roll -= Entry.Weight;\nif (Roll < 0.f)\n{\n\treturn Entry.Item;\n}",
            choix: ["Turbo", "Piège", "Projectile", "Aucun"],
            bonne: 2,
            explication: "85 - 50 = 35, 35 - 30 = 5, encore positifs. 5 - 20 = -15 : c'est le projectile.",
          },
          {
            type: "vrai-faux",
            enonce: "Une ligne de la table avec un poids de 0 peut quand même sortir.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Les lignes de poids 0 (ou sans objet) sont ignorées dans la somme et dans la boucle de tirage avec continue.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si on oubliait override sur Activate dans le turbo, en se trompant aussi en oubliant le const ?",
            choix: [
              "Rien de grave : le turbo marche pareil",
              "Ça compile, mais c'est une nouvelle fonction : la poche appellerait la version du parent, qui renvoie false",
              "Le compilateur refuse",
              "Le jeu plante au lancement",
            ],
            bonne: 1,
            explication:
              "Sans const, la signature est différente : ce n'est plus un remplacement. Sans override, le compilateur ne le signale pas. override sert justement à attraper cette erreur.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/objets-et-tirage/poids",
          enonce:
            "Le game designer veut qu'une boîte donne un turbo 60 % du temps, un piège 30 % du temps et un projectile 10 % du temps. Quels poids mets-tu dans la table ? Puis il ajoute un bouclier qui doit sortir aussi souvent que le piège : que fais-tu, et que deviennent les pourcentages ?",
          attendus:
            "Poids 6, 3 et 1 (ou 60, 30, 10). Pour le bouclier on ajoute une ligne avec le même poids que le piège (3), sans toucher aux autres. Le total passe à 13 : turbo 6/13 (environ 46 %), piège 3/13 (environ 23 %), bouclier 3/13, projectile 1/13 (environ 8 %). Les poids sont des parts, les pourcentages se recalculent seuls.",
        },
      ],
    },
    {
      slug: "item-component",
      titre: "La poche du kart : KartItemComponent",
      resume: "Un ActorComponent qui garde l'objet en main, lance la roulette avec un timer et utilise l'objet (polymorphisme)",
      dureeMin: 25,
      fichiers: ["KartItemComponent.h", "KartItemComponent.cpp"],
      charger: () => import("./item-component.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/item-component",
        questions: [
          {
            type: "qcm",
            enonce: "Quand l'objet que va recevoir le kart est-il choisi ?",
            choix: [
              "À la fin de la roulette, dans FinishRoulette",
              "Quand le joueur appuie sur la touche",
              "Par le widget du HUD",
              "Au début, dans TryGiveRandomItem : la roulette n'est qu'une animation",
            ],
            bonne: 3,
            explication: "PickRandomItem est appelé tout de suite et le résultat est gardé dans PendingItem. FinishRoulette ne fait que le donner.",
          },
          {
            type: "qcm",
            enonce: "Le kart a un triple turbo (UsesLeft = 3). Combien de fois OnItemChanged est-il envoyé s'il utilise les trois ?",
            choix: ["1 fois", "2 fois", "3 fois", "Jamais"],
            bonne: 2,
            explication: "Chaque utilisation passe par SetItem : 3 → 2, puis 2 → 1, puis 1 → poche vide. Trois Broadcast.",
          },
          {
            type: "vrai-faux",
            enonce: "UKartItemComponent doit connaître la classe UKartItemData_Boost pour utiliser un turbo.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Il appelle Activate sur un UKartItemData. Grâce au polymorphisme, c'est la version du turbo qui s'exécute, sans que le composant la connaisse.",
          },
          {
            type: "code",
            enonce: "Le joueur appuie sur la touche pendant la roulette. Que se passe-t-il ?",
            code: "if (bRouletteRunning || CurrentItem == nullptr)\n{\n\treturn;\n}",
            choix: [
              "Rien : la fonction sort tout de suite",
              "L'objet en attente est utilisé tout de suite",
              "La roulette s'arrête",
              "Le kart perd son objet",
            ],
            bonne: 0,
            explication: "bRouletteRunning est vrai : on sort. Le timer continue et l'objet arrivera normalement.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi PendingItem a-t-il un UPROPERTY() sans aucune option ?",
            choix: [
              "Pour l'afficher dans le panneau Details",
              "Pour pouvoir le modifier dans un Blueprint",
              "Il ne sert à rien, on pourrait l'enlever",
              "Pour que le ramasse-miettes d'Unreal sache qu'on garde un pointeur vers cet objet",
            ],
            bonne: 3,
            explication: "Un pointeur vers un UObject doit être déclaré en UPROPERTY pour que le moteur le suive. Sans option, il reste invisible dans l'éditeur.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/item-component/roulette",
          enonce:
            "Décris tout ce qui se passe, dans l'ordre, entre le moment où le kart touche une boîte (poche vide) et le moment où il a un objet en main. Cite les fonctions et l'event envoyé.",
          attendus:
            "La boîte appelle TryGiveRandomItem(ItemPool). La poche vérifie qu'elle est vide, tire l'objet avec PickRandomItem et le range dans PendingItem, passe bRouletteRunning à vrai, envoie OnRouletteStarted (table et durée) et lance un timer de RouletteDuration secondes. À la fin du timer, FinishRoulette remet bRouletteRunning à faux et appelle SetItem(PendingItem, Uses), qui range l'objet et envoie OnItemChanged.",
        },
      ],
    },
    {
      slug: "item-box",
      titre: "La boîte à bonus : hériter de RotatingObject",
      resume: "KartItemBox.h et KartItemBox.cpp : hériter de notre propre classe, détecter une poche, disparaître et réapparaître",
      dureeMin: 20,
      fichiers: ["KartItemBox.h", "KartItemBox.cpp"],
      charger: () => import("./item-box.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/item-box",
        questions: [
          {
            type: "qcm",
            enonce: "Où est écrit le code qui fait tourner la boîte à bonus ?",
            choix: [
              "Dans le Tick de AKartItemBox",
              "Dans le Tick de ARotatingObject, dont la boîte hérite",
              "Dans le Blueprint BP_ItemBox",
              "Dans le kart",
            ],
            bonne: 1,
            explication: "AKartItemBox ne redéfinit pas Tick : c'est celui du parent qui s'exécute et anime AnimatedRoot.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi la boîte utilise-t-elle FindComponentByClass au lieu d'un Cast vers AKartPawn ?",
            choix: [
              "Pour que n'importe quel acteur avec une poche à objets puisse prendre la boîte, pas seulement le kart",
              "Parce que Cast ne marche pas dans un overlap",
              "Parce que c'est plus rapide",
              "Parce que le kart n'est pas un Actor",
            ],
            bonne: 0,
            explication: "La boîte ne dépend que du composant. Une IA ou un autre véhicule avec un UKartItemComponent pourrait la prendre sans changer la boîte.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on oublie Super::BeginPlay() dans AKartItemBox::BeginPlay, la boîte flotte quand même autour de la bonne position.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "C'est le BeginPlay du parent qui retient AnimatedRootBaseLocation et choisit le départ au hasard. Sans lui, la boîte flotterait autour de (0, 0, 0) relatif.",
          },
          {
            type: "code",
            enonce: "La boîte vient d'être prise. Pourquoi coupe-t-on aussi la collision ?",
            code: "BoxMesh->SetVisibility(false, true);\nDetectionSphere->SetCollisionEnabled(ECollisionEnabled::NoCollision);",
            choix: [
              "Pour économiser de la mémoire",
              "Pour que le timer de réapparition marche",
              "Sinon un kart pourrait prendre la boîte alors qu'elle est invisible",
              "Ce n'est pas nécessaire",
            ],
            bonne: 2,
            explication: "Cacher le mesh ne change pas la détection. Sans NoCollision, la sphère invisible donnerait encore des objets.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/item-box/heritage",
          enonce:
            "On veut ajouter une pièce à ramasser qui tourne comme une toupie et ne flotte pas. Explique quelle classe tu crées, de qui elle hérite, ce que tu écris dans le code et ce que tu règles dans l'éditeur.",
          attendus:
            "Une classe (par exemple ACoin) qui hérite de ARotatingObject. Dans le code : une sphère de détection sur Root, un mesh sur AnimatedRoot, un overlap comme la boîte. Aucune ligne pour l'animation. Dans l'éditeur (ou les valeurs par défaut) : RotationSpeed = (0, 90, 0) pour tourner seulement en Yaw, bEnableBobbing décoché.",
        },
      ],
    },
    {
      slug: "brancher-le-kart",
      titre: "Brancher les objets sur le kart",
      resume: "Les lignes ajoutées dans KartPawn.h et KartPawn.cpp (composant, touche, ApplyBoost), puis les assets à créer dans l'éditeur",
      dureeMin: 15,
      fichiers: ["KartPawn.h", "KartPawn.cpp"],
      charger: () => import("./brancher-le-kart.mdx"),
      quiz: {
        id: "mario-kart/objets-bonus/brancher-le-kart",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi ne fait-on pas de SetupAttachment pour ItemComponent dans le constructeur du kart ?",
            choix: [
              "On a oublié",
              "Un ActorComponent n'a pas de position : il n'est attaché à rien",
              "Parce qu'il est créé dans BeginPlay",
              "Parce qu'il est attaché automatiquement à la caméra",
            ],
            bonne: 1,
            explication: "SetupAttachment sert aux SceneComponent (meshes, caméra). Un UActorComponent n'est que de la logique.",
          },
          {
            type: "qcm",
            enonce: "La touche d'objet est branchée avec ETriggerEvent::Triggered au lieu de Started. Que se passe-t-il avec un triple turbo ?",
            choix: [
              "Rien de différent",
              "La touche ne marche plus du tout",
              "Le turbo dure trois fois plus longtemps",
              "En maintenant la touche, les trois turbos partent sur des images qui se suivent",
            ],
            bonne: 3,
            explication: "Triggered se déclenche à chaque image tant qu'on appuie. Started se déclenche une seule fois par appui.",
          },
          {
            type: "vrai-faux",
            enonce: "Pour ajouter un nouvel objet (par exemple un super turbo de 3 secondes), il faut modifier AKartPawn.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Il suffit d'un Data Asset de la classe turbo avec BoostDuration = 3, ajouté à une table. Le kart ne change pas.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ajouter ApplyBoost au lieu de rendre StartBoost publique ?",
            choix: [
              "Parce qu'une fonction ne peut pas changer de section",
              "Parce que StartBoost est const",
              "Pour garder StartBoost interne au kart, et avoir une porte d'entrée publique où le kart peut ajouter ses propres vérifications",
              "Parce que les objets ne peuvent pas appeler de fonctions",
            ],
            bonne: 2,
            explication: "ApplyBoost ignore déjà les durées nulles. Le kart décide de ce qui est accepté, les objets n'ont pas accès à l'intérieur.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-bonus/brancher-le-kart/porte-entree",
          enonce:
            "Le game designer veut que le turbo d'objet soit refusé quand le kart est en l'air. Où ajoutes-tu cette règle, et pourquoi pas dans UKartItemData_Boost ? Que se passe-t-il alors pour l'objet du joueur ?",
          attendus:
            "Dans le kart, à la porte d'entrée : ApplyBoost (par exemple en renvoyant un bool, faux si !bIsGrounded). C'est une règle du kart, et bIsGrounded est protected : l'objet n'y a pas accès. UKartItemData_Boost renverrait alors le résultat d'ApplyBoost au lieu de true : si c'est faux, la poche ne consomme pas l'utilisation et le joueur garde son turbo.",
        },
      ],
    },
  ],
  quizFinal: {
    id: "mario-kart/objets-bonus/final",
    questions: [
      {
        type: "qcm",
        enonce: "Quelle classe décide de l'effet d'un objet ?",
        choix: ["La classe enfant de UKartItemData, dans Activate", "AKartPawn", "UKartItemComponent", "AKartItemBox"],
        bonne: 0,
        explication: "Chaque enfant de UKartItemData redéfinit Activate. Le kart et la poche ne savent pas ce que fait un objet.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre les choses se passent-elles quand un kart roule dans une boîte ?",
        choix: [
          "La boîte appelle Activate, puis la poche reçoit l'objet",
          "Le kart cherche la boîte la plus proche à chaque Tick",
          "La table de tirage détecte le kart",
          "Overlap de la boîte, TryGiveRandomItem sur la poche, tirage dans la table, roulette, FinishRoulette, OnItemChanged",
        ],
        bonne: 3,
        explication: "Tout part de l'overlap de la sphère. La poche tire tout de suite, attend la fin du timer, puis range l'objet et prévient les abonnés.",
      },
      {
        type: "vrai-faux",
        enonce: "Un Data Asset existe une fois en mémoire et est partagé par tous ceux qui l'utilisent.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "C'est pour ça qu'Activate est const et que le nombre d'utilisations restantes est rangé dans la poche de chaque kart.",
      },
      {
        type: "qcm",
        enonce: "Que contient AKartItemBox qui gère la rotation de la boîte ?",
        choix: [
          "Un Tick avec AddLocalRotation",
          "Rien : la rotation vient de ARotatingObject, dont elle hérite",
          "Un RotatingMovementComponent",
          "Un timer qui la tourne toutes les secondes",
        ],
        bonne: 1,
        explication: "La boîte hérite de Root, AnimatedRoot et du Tick qui anime. Elle n'écrit que sa propre logique.",
      },
      {
        type: "code",
        enonce: "Pourquoi le compilateur refuse-t-il ce code ?",
        code: "bool UKartItemData_Boost::Activate(AKartPawn* Kart) const\n{\n\tUses = Uses - 1;\n\treturn true;\n}",
        choix: [
          "Parce qu'une fonction const ne peut pas modifier les variables de l'objet",
          "Parce que Uses n'existe pas dans le turbo",
          "Parce qu'il manque override",
          "Il ne refuse pas",
        ],
        bonne: 0,
        explication: "Activate est const : modifier Uses est interdit. C'est voulu, l'asset est partagé.",
      },
      {
        type: "qcm",
        enonce: "Table : turbo (poids 2), triple turbo (poids 2), piège (poids 4). Quelle est la chance d'obtenir un turbo, simple ou triple ?",
        choix: ["25 %", "33 %", "50 %", "75 %"],
        bonne: 2,
        explication: "Total 8. Turbo 2 + triple turbo 2 = 4 parts sur 8, soit 50 %.",
      },
      {
        type: "qcm",
        enonce: "Quel est l'avantage de ranger les objets dans un composant plutôt que dans AKartPawn ?",
        choix: [
          "Le jeu tourne plus vite",
          "Le kart reste lisible, et n'importe quel acteur avec le composant peut ramasser et utiliser des objets",
          "Les composants sont obligatoires pour utiliser des Data Assets",
          "Le composant est visible dans le niveau",
        ],
        bonne: 1,
        explication: "La boîte cherche le composant, pas le kart. La logique des objets est à un seul endroit.",
      },
      {
        type: "vrai-faux",
        enonce: "Pour créer un triple turbo, on duplique DA_Item_Turbo et on met Uses à 3.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "FinishRoulette donne à la poche le nombre d'utilisations lu dans l'asset. Aucune ligne de code en plus.",
      },
      {
        type: "qcm",
        enonce: "Dans ARotatingObject, que fait AddLocalRotation(RotationSpeed * DeltaTime) avec RotationSpeed = (30, 90, 45) ?",
        choix: [
          "La boîte tourne comme une toupie à 90 degrés par seconde",
          "La boîte se déplace de 30, 90 et 45 cm par seconde",
          "Rien, il faut un FVector",
          "La boîte culbute dans tous les sens, en tournant autour de ses propres axes",
        ],
        bonne: 3,
        explication: "Les trois axes tournent en même temps, autour des axes de l'objet lui-même : il culbute.",
      },
    ],
  },
  defi: {
    id: "mario-kart/objets-bonus/defi-vider-poche",
    titre: "Vider la poche au départ d'une course",
    consigne:
      "Quand une course recommence, le kart garde l'objet qu'il avait. Corrige ça : dans AKartPawn::ResetRaceProgress, appelle ClearItem sur le composant d'objet (pense à vérifier qu'il n'est pas nullptr). Ensuite, crée un nouvel objet sans écrire de C++ : un « super turbo » de 3 secondes, ajouté à DA_ItemPool_Default avec un petit poids. Dépose une vidéo où l'on voit la roulette, le super turbo et une boîte qui réapparaît.",
  },
};
