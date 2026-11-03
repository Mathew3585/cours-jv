import type { Module } from "@/contenu/types";

export const compteurTours: Module = {
  slug: "compteur-tours",
  titre: "Compteur de tours",
  resume: "Ligne d'arrivée, checkpoints et tours validés",
  intro:
    "Pour savoir à quel tour en est un kart, on pose sur le circuit des zones de passage : une ligne d'arrivée et des checkpoints numérotés. Chaque zone vérifie que le kart la traverse dans le bon sens, puis le kart compte ses checkpoints et valide ses tours. Tu vas voir comment ce système empêche de tricher.",
  fichiers: ["LapZone.h", "LapZone.cpp"],
  lecons: [
    {
      slug: "principe-lapzone",
      titre: "Le principe et le header LapZone.h",
      resume: "Le principe des checkpoints et de la flèche, puis LapZone.h de la ligne 1 à 70",
      dureeMin: 15,
      fichiers: ["LapZone.h"],
      charger: () => import("./principe-lapzone.mdx"),
      quiz: {
        id: "mario-kart/compteur-tours/principe-lapzone",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi une ligne d'arrivée avec une flèche de sens ne suffit-elle pas à compter les tours ?",
            choix: [
              "Parce que la flèche n'est pas visible en jeu",
              "Parce qu'on peut passer la ligne en avant, reculer à travers en marche arrière, puis la repasser en avant, et gagner un tour à chaque fois",
              "Parce que la boîte est trop fine pour détecter les karts rapides",
              "Parce que le kart ne connaît pas son numéro de tour",
            ],
            bonne: 1,
            explication:
              "Le passage en marche arrière est ignoré (mauvais sens), mais rien n'empêche de repasser en avant. Les checkpoints obligent à faire tout le tour avant que la ligne compte.",
          },
          {
            type: "qcm",
            enonce: "Sur un circuit, tu poses 4 zones. Quels ZoneIndex dois-tu leur donner ?",
            choix: [
              "1, 2, 3, 4",
              "0, 1, 2, 3, avec 0 pour la ligne d'arrivée",
              "0, 2, 4, 6",
              "N'importe quels numéros, du moment qu'ils sont différents",
            ],
            bonne: 1,
            explication:
              "0 est réservé à la ligne d'arrivée, et les checkpoints se suivent sans trou à partir de 1, dans l'ordre du circuit.",
          },
          {
            type: "vrai-faux",
            enonce: "Pour inverser le sens dans lequel une zone doit être traversée, il faut modifier le code de LapZone.cpp.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La flèche pointe vers l'avant de l'acteur. Il suffit de tourner l'acteur dans le niveau, sans toucher au code.",
          },
          {
            type: "code",
            enonce: "Quelle macro manque pour qu'Unreal puisse brancher cette fonction sur l'event de la boîte ?",
            code: "____\nvoid HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, ...);",
            choix: ["UPROPERTY()", "GENERATED_BODY()", "UFUNCTION()", "UCLASS()"],
            bonne: 2,
            explication:
              "Une fonction branchée sur un event dynamique doit être une UFUNCTION : sans elle, Unreal ne connaît pas la fonction et ne peut pas l'appeler.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/compteur-tours/principe-lapzone/triche",
          enonce:
            "Un camarade propose de supprimer les checkpoints et de garder seulement la ligne d'arrivée avec sa flèche. Explique-lui, étape par étape, comment un joueur pourrait finir la course sans faire le circuit.",
          attendus:
            "Le joueur passe la ligne en avant (+1 tour), recule à travers la ligne en marche arrière (passage ignoré car mauvais sens), puis repasse en avant (+1 tour), et recommence jusqu'au dernier tour. Avec les checkpoints, la ligne ne compte que si tous les checkpoints du tour ont été passés dans l'ordre.",
        },
      ],
    },
    {
      slug: "boite-overlap",
      titre: "La zone : boîte, flèche et overlap",
      resume: "LapZone.cpp lignes 1 à 52 : le constructeur, puis l'abonnement à l'event de la boîte",
      dureeMin: 20,
      fichiers: ["LapZone.cpp"],
      charger: () => import("./boite-overlap.mdx"),
      quiz: {
        id: "mario-kart/compteur-tours/boite-overlap",
        questions: [
          {
            type: "qcm",
            enonce: "Que se passerait-il si la boîte utilisait le profil de collision « BlockAll » au lieu de « Trigger » ?",
            choix: [
              "Rien de différent",
              "La boîte deviendrait invisible",
              "Le kart taperait dedans comme dans un mur invisible",
              "Le kart passerait deux fois dans la zone",
            ],
            bonne: 2,
            explication:
              "BlockAll bloque tout. Trigger ne bloque rien et signale seulement les objets qui entrent : c'est ce qu'il faut pour une zone de passage.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi la zone désactive-t-elle son Tick ?",
            choix: [
              "Parce qu'elle n'a rien à faire à chaque image : c'est le moteur qui la prévient quand un objet entre",
              "Parce que le Tick empêche les overlaps",
              "Parce qu'un Actor ne peut pas avoir de Tick",
              "Pour que la flèche reste immobile",
            ],
            bonne: 0,
            explication:
              "La zone réagit à l'event OnComponentBeginOverlap. Un Tick vide serait appelé pour rien sur chaque zone, à chaque image.",
          },
          {
            type: "code",
            enonce: "bShowInGame est décoché dans le Blueprint. Que se passe-t-il ?",
            code: "Box->SetHiddenInGame(!bShowInGame);\nArrow->SetHiddenInGame(!bShowInGame);",
            choix: [
              "La boîte et la flèche disparaissent aussi dans l'éditeur",
              "La zone ne détecte plus les karts",
              "La boîte et la flèche sont visibles en jeu",
              "La boîte et la flèche sont cachées pendant le jeu, mais restent visibles dans l'éditeur",
            ],
            bonne: 3,
            explication:
              "!bShowInGame vaut vrai, donc SetHiddenInGame(true) cache les composants pendant le jeu seulement. La détection ne dépend pas de la visibilité.",
          },
          {
            type: "qcm",
            enonce: "SetBoxExtent(FVector(50.f, 500.f, 200.f)) : quelle est l'épaisseur réelle de la boîte ?",
            choix: ["50 cm", "1 m", "5 m", "10 m"],
            bonne: 1,
            explication: "Box Extent est une demi-taille : 50 cm de chaque côté du centre donnent 1 m d'épaisseur.",
          },
          {
            type: "vrai-faux",
            enonce: "Pour qu'Unreal appelle HandleBeginOverlap quand un kart entre, il suffit que la fonction existe : AddDynamic n'est pas nécessaire.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Sans l'abonnement fait dans BeginPlay avec AddDynamic, l'event OnComponentBeginOverlap ne sait pas qu'il doit appeler HandleBeginOverlap.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/compteur-tours/boite-overlap/epaisseur",
          enonce:
            "La boîte de la zone fait 1 m d'épaisseur par défaut. Explique pourquoi on ne la fait pas très fine (1 cm, par exemple), en t'appuyant sur la vitesse du kart et le nombre d'images par seconde.",
          attendus:
            "Le kart avance par bonds, une fois par image : à 2500 cm/s et 60 images par seconde, il fait environ 42 cm par image. Une boîte de 1 cm pourrait se trouver entre deux positions du kart sans qu'il soit jamais dedans, et l'overlap ne se déclencherait pas. Avec 1 m, le kart est forcément dedans à au moins une image.",
        },
      ],
    },
    {
      slug: "produit-scalaire",
      titre: "Le bon sens : le produit scalaire",
      resume: "Direction du kart, direction de la flèche, et IsGoingRightWay (lignes 54 à 63)",
      dureeMin: 20,
      fichiers: ["LapZone.cpp"],
      charger: () => import("./produit-scalaire.mdx"),
      quiz: {
        id: "mario-kart/compteur-tours/produit-scalaire",
        questions: [
          {
            type: "qcm",
            enonce: "La flèche de la zone pointe vers (1, 0, 0). Le kart roule vers (-1, 0, 0). Que vaut le produit scalaire ?",
            choix: ["1", "0", "-1", "2"],
            bonne: 2,
            explication: "-1 × 1 + 0 × 0 + 0 × 0 = -1 : les deux directions sont opposées, le passage est ignoré.",
          },
          {
            type: "qcm",
            enonce: "Un kart longe la ligne d'arrivée sans la traverser. Que vaut à peu près le produit scalaire avec la flèche ?",
            choix: ["Environ 1", "Environ 0", "Environ -1", "Il est impossible à calculer"],
            bonne: 1,
            explication:
              "Les deux directions sont à angle droit : le produit scalaire vaut 0. Comme le test demande > 0, ce passage ne compte pas.",
          },
          {
            type: "qcm",
            enonce: "Que renvoie GetMoveDirection quand le kart est à l'arrêt ?",
            choix: [
              "La direction avant du kart",
              "La direction arrière du kart",
              "(0, 0, 0), car Sign(0) vaut 0",
              "La direction de la dernière zone traversée",
            ],
            bonne: 2,
            explication:
              "FMath::Sign(0) vaut 0, et une direction multipliée par 0 donne (0, 0, 0). Le produit scalaire vaut alors 0 : un kart arrêté ne valide aucune zone.",
          },
          {
            type: "vrai-faux",
            enonce: "Un kart qui traverse la ligne en biais, mais vers l'avant de la flèche, est compté.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "Le produit scalaire est positif dès que les deux directions vont plutôt dans le même sens, même avec un angle. Seul le signe compte.",
          },
          {
            type: "code",
            enonce: "Quelle comparaison faut-il pour accepter seulement les karts qui vont dans le sens de la flèche ?",
            code: "return FVector::DotProduct(MoveDirection, Arrow->GetForwardVector()) ____;",
            choix: ["< 0.f", "== 0.f", "> 0.f", "!= 0.f"],
            bonne: 2,
            explication:
              "Positif = même sens. < 0.f accepterait seulement la marche arrière, et != 0.f accepterait les deux sens.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/compteur-tours/produit-scalaire/marche-arriere",
          enonce:
            "Avec tes mots et un exemple chiffré, explique comment une zone sait qu'un kart la traverse en marche arrière.",
          attendus:
            "En marche arrière, CurrentSpeed est négative : FMath::Sign donne -1 et GetMoveDirection renvoie l'arrière du kart. Exemple : flèche (1, 0, 0), kart qui regarde vers (1, 0, 0) mais recule, direction (-1, 0, 0). Produit scalaire : -1 × 1 + 0 + 0 = -1, négatif, donc IsGoingRightWay renvoie faux et le passage est ignoré.",
        },
      ],
    },
    {
      slug: "comptage-tours",
      titre: "Prévenir le kart et compter les tours",
      resume: "HandleBeginOverlap (lignes 65 à 84), puis ce que fait le kart : checkpoints, tours, fin de course",
      dureeMin: 20,
      fichiers: ["LapZone.cpp"],
      charger: () => import("./comptage-tours.mdx"),
      quiz: {
        id: "mario-kart/compteur-tours/comptage-tours",
        questions: [
          {
            type: "code",
            enonce: "Que vaut Kart si l'objet entré dans la boîte est un rocher du décor ?",
            code: "AKartPawn* Kart = Cast<AKartPawn>(OtherActor);",
            choix: ["Un pointeur vers le rocher", "nullptr", "Le kart le plus proche", "Le jeu plante"],
            bonne: 1,
            explication:
              "Cast renvoie nullptr quand l'objet n'est pas du type demandé. C'est pour ça qu'on teste Kart == nullptr juste après, avant de s'en servir.",
          },
          {
            type: "vrai-faux",
            enonce: "C'est la zone qui retient combien de checkpoints chaque kart a passés.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La zone ne retient rien : elle appelle EnterLapZone avec son numéro, et c'est le kart qui tient ses propres comptes.",
          },
          {
            type: "qcm",
            enonce:
              "Le circuit a 3 checkpoints. NextCheckpoint vaut 2 et le kart traverse le checkpoint 3 dans le bon sens. Que se passe-t-il ?",
            choix: [
              "Rien : le kart attend le checkpoint 2",
              "NextCheckpoint passe à 4",
              "Le tour est validé",
              "NextCheckpoint revient à 1",
            ],
            bonne: 0,
            explication:
              "3 n'est pas égal à NextCheckpoint (2), et ce n'est pas la ligne d'arrivée : le passage est ignoré. C'est ce qui empêche de couper par un raccourci.",
          },
          {
            type: "vrai-faux",
            enonce: "Juste après un tour validé, repasser la ligne d'arrivée dans le bon sens ajoute un tour.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "CompleteLap remet NextCheckpoint à 1. Tant que les checkpoints du nouveau tour ne sont pas passés, la ligne est ignorée.",
          },
          {
            type: "code",
            enonce: "Course en 3 tours. Le kart termine son 3e tour. Que se passe-t-il dans CompleteLap ?",
            code: "if (CurrentLap >= GameMode->GetLapCount())\n{\n\tbHasFinishedRace = true;\n\tFinishTime = GameMode->GetRaceTime();\n\tGameMode->NotifyKartFinished(this);\n\treturn;\n}\n++CurrentLap;",
            choix: [
              "CurrentLap passe à 4, puis la course se termine",
              "Le GameMode remet le kart au tour 1",
              "La course est finie pour ce kart et CurrentLap reste à 3",
              "Rien, il faut un 4e passage sur la ligne",
            ],
            bonne: 2,
            explication:
              "CurrentLap (3) >= 3 : on note la fin de course et le temps, on prévient le GameMode, et le return empêche d'arriver à ++CurrentLap.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/compteur-tours/comptage-tours/numeros",
          enonce:
            "Un élève a posé quatre checkpoints numérotés 1, 2, 4 et 5 (il a oublié le 3). Ses tours ne sont jamais validés. Explique pourquoi, en suivant la valeur de NextCheckpoint, et dis comment corriger.",
          attendus:
            "Le GameMode prend le plus grand ZoneIndex comme nombre de checkpoints : 5. Le kart passe 1 puis 2 (NextCheckpoint = 3), puis attend le 3, qui n'existe pas : 4 et 5 sont ignorés. NextCheckpoint ne dépasse jamais 5, donc la ligne d'arrivée ne valide jamais le tour. Correction : renuméroter les zones 1, 2, 3, 4 sans trou.",
        },
      ],
    },
  ],
  quizFinal: {
    id: "mario-kart/compteur-tours/final",
    questions: [
      {
        type: "qcm",
        enonce: "Quel est le rôle des checkpoints dans ce système ?",
        choix: [
          "Afficher le chrono intermédiaire",
          "Obliger le kart à faire tout le tour avant que la ligne d'arrivée compte",
          "Remettre le kart sur la piste quand il tombe",
          "Indiquer le sens de la course",
        ],
        bonne: 1,
        explication:
          "Le sens est donné par la flèche de chaque zone. Les checkpoints, passés dans l'ordre, prouvent que le kart a fait le circuit, ce qui bloque les allers-retours sur la ligne.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre les choses se passent-elles quand un kart traverse un checkpoint ?",
        choix: [
          "Le kart appelle la zone, qui vérifie le sens puis compte le tour",
          "La boîte déclenche HandleBeginOverlap, la zone vérifie que c'est un kart et le sens, puis appelle EnterLapZone",
          "Le GameMode vérifie à chaque Tick quelles zones chaque kart a traversées",
          "La zone appelle directement CompleteLap",
        ],
        bonne: 1,
        explication:
          "Tout part de l'event d'overlap de la boîte. La zone filtre (Cast, puis le sens), et c'est le kart qui décide dans EnterLapZone.",
      },
      {
        type: "vrai-faux",
        enonce: "Si on oublie Box->SetGenerateOverlapEvents(true), la zone ne détecte plus les karts.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "Sans cette option, la boîte ne déclenche pas OnComponentBeginOverlap, et HandleBeginOverlap n'est jamais appelée.",
      },
      {
        type: "qcm",
        enonce: "Que fait AddDynamic dans BeginPlay ?",
        choix: [
          "Il crée la boîte de collision",
          "Il appelle HandleBeginOverlap une fois pour tester",
          "Il abonne HandleBeginOverlap à l'event de la boîte, pour qu'Unreal l'appelle quand quelque chose entre",
          "Il rend la boîte visible en jeu",
        ],
        bonne: 2,
        explication:
          "OnComponentBeginOverlap est un délégué : une liste de fonctions à appeler. AddDynamic y ajoute HandleBeginOverlap.",
      },
      {
        type: "qcm",
        enonce: "La flèche pointe vers (1, 0, 0). Lequel de ces karts valide la zone ?",
        choix: [
          "Un kart qui roule vers (0, 1, 0)",
          "Un kart qui roule vers (-0.7, 0.7, 0)",
          "Un kart qui roule vers (0.7, -0.7, 0)",
          "Un kart arrêté",
        ],
        bonne: 2,
        explication:
          "0.7 × 1 + (-0.7) × 0 + 0 × 0 = 0.7, positif : il va plutôt dans le sens de la flèche. Les autres donnent 0, -0.7 et 0.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi GetMoveDirection multiplie-t-elle la direction avant du kart par FMath::Sign(CurrentSpeed) ?",
        choix: [
          "Pour que la direction soit plus longue quand le kart va vite",
          "Pour retourner la direction en marche arrière, et la mettre à zéro à l'arrêt",
          "Pour convertir la vitesse en km/h",
          "Pour que le kart tourne dans le bon sens",
        ],
        bonne: 1,
        explication:
          "Sign donne 1, -1 ou 0. La direction reste vers l'avant, passe vers l'arrière ou devient nulle, mais sa longueur ne dépend pas de la vitesse.",
      },
      {
        type: "code",
        enonce: "Que se passe-t-il si le kart traverse la ligne d'arrivée alors que NextCheckpoint vaut 2, sur un circuit à 3 checkpoints ?",
        code: "else if (ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount())\n{\n\tCompleteLap();\n}",
        choix: [
          "Le tour est validé",
          "Le kart revient au checkpoint 1",
          "La course est finie",
          "Rien : 2 n'est pas plus grand que 3, le passage est ignoré",
        ],
        bonne: 3,
        explication: "Il manque les checkpoints 2 et 3 : la condition est fausse et aucune branche ne s'exécute.",
      },
      {
        type: "qcm",
        enonce: "Un circuit n'a qu'une ligne d'arrivée, aucun checkpoint. Que se passe-t-il ?",
        choix: [
          "Aucun tour n'est jamais validé",
          "Chaque passage de la ligne dans le bon sens valide un tour : les allers-retours redeviennent possibles",
          "Le jeu plante au lancement",
          "Le kart doit faire deux fois le tour",
        ],
        bonne: 1,
        explication:
          "Le nombre de checkpoints vaut 0, et NextCheckpoint (1) est toujours plus grand que 0. Le GameMode l'écrit en avertissement dans l'Output Log.",
      },
      {
        type: "vrai-faux",
        enonce: "Une fois bHasFinishedRace à vrai, les zones traversées par ce kart ne comptent plus.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "EnterLapZone et CompleteLap commencent toutes les deux par vérifier bHasFinishedRace et sortent tout de suite.",
      },
      {
        type: "qcm",
        enonce: "À quoi sert ResetRaceProgress ?",
        choix: [
          "À remettre le kart sur la ligne de départ",
          "À remettre le tour à 1, le prochain checkpoint à 1, et effacer la fin de course et le temps",
          "À recompter les checkpoints du niveau",
          "À arrêter le chrono",
        ],
        bonne: 1,
        explication:
          "Elle remet les quatre variables de course à leur valeur de départ. Elle ne déplace pas le kart. Le GameMode l'appelle au début du compte à rebours.",
      },
    ],
  },
  defi: {
    id: "mario-kart/compteur-tours/defi-mauvais-sens",
    titre: "Afficher « Mauvais sens ! »",
    consigne:
      "Quand un kart traverse une zone à contresens, affiche « Mauvais sens ! » à l'écran pendant 2 secondes. Indice : dans HandleBeginOverlap, le cas où IsGoingRightWay renvoie faux est déjà isolé ; GEngine->AddOnScreenDebugMessage suffit pour un premier essai, et les plus motivés peuvent passer par un UFUNCTION(BlueprintImplementableEvent) sur le kart. Teste en roulant en marche arrière à travers la ligne. Dépose un lien vers une capture ou une vidéo une fois fait.",
  },
};
