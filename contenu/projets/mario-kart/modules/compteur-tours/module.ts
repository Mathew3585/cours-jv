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
              "0, 1, 2, 3, avec 0 pour la ligne d'arrivée",
              "1, 2, 3, 4",
              "0, 2, 4, 6",
              "N'importe quels numéros, du moment qu'ils sont différents",
            ],
            bonne: 0,
            explication:
              "0 est réservé à la ligne d'arrivée, et les checkpoints se suivent sans trou à partir de 1, dans l'ordre où on les rencontre sur le circuit.",
          },
          {
            type: "code",
            enonce: "Pourquoi ces lignes suffisent-elles dans LapZone.h, sans #include pour ces types ?",
            code: "class UBoxComponent;\nclass UArrowComponent;\nclass UPrimitiveComponent;\nstruct FHitResult;",
            choix: [
              "Parce qu'elles créent les composants de la zone",
              "Parce que CoreMinimal.h contient déjà tout le code de ces classes",
              "Parce qu'Unreal ajoute les includes manquants à la compilation",
              "Parce que le header n'utilise que des pointeurs ou des références vers ces types : il lui suffit de savoir qu'ils existent",
            ],
            bonne: 3,
            explication:
              "Ce sont des déclarations anticipées : elles annoncent un nom de type. Pour un pointeur ou une référence, c'est assez. Les vrais includes sont dans le .cpp, là où on appelle les fonctions de la boîte et de la flèche.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ALapZone hérite-t-elle d'AActor et pas d'APawn ?",
            choix: [
              "Parce qu'un Pawn ne peut pas avoir de boîte de collision",
              "Parce qu'AActor est le seul parent qui accepte une UCLASS",
              "Parce qu'une zone est un simple objet posé dans le niveau, que personne ne contrôle",
              "Parce qu'un Pawn n'a pas de BeginPlay",
            ],
            bonne: 2,
            explication:
              "Un Pawn est fait pour être contrôlé par un joueur ou une IA. Une zone ne bouge pas et n'obéit à personne : un Actor suffit, et on peut en poser plusieurs copies sur le circuit.",
          },
          {
            type: "qcm",
            enonce: "Dans le projet, qui appelle GetZoneIndex ?",
            choix: [
              "Le kart, à chaque image, pour savoir quel checkpoint il attend",
              "Le GameMode, pour compter les checkpoints du circuit au démarrage",
              "Le widget du chrono",
              "La flèche, pour savoir dans quel sens pointer",
            ],
            bonne: 1,
            explication:
              "CountCheckpoints parcourt les ALapZone et lit leur numéro avec GetZoneIndex. Le kart, lui, reçoit le numéro en paramètre de EnterLapZone : il n'a pas besoin de le demander.",
          },
          {
            type: "code",
            enonce: "Que garantit le paramètre const FVector& de cette fonction ?",
            code: "bool IsGoingRightWay(const FVector& MoveDirection) const;",
            choix: [
              "Le vecteur est copié, pour que l'original soit protégé",
              "Le vecteur doit rester le même pendant tout le jeu",
              "Le vecteur est prêté sans copie (&), et la fonction n'a pas le droit de le modifier (const)",
              "La fonction ne peut être appelée qu'une fois par image",
            ],
            bonne: 2,
            explication:
              "C'est une référence const : pas de copie, et pas de modification possible. Le const à la toute fin est différent : il promet que la fonction ne modifie pas la zone elle-même.",
          },
          {
            type: "vrai-faux",
            enonce: "Pour inverser le sens dans lequel une zone doit être traversée, il faut modifier le code de LapZone.cpp.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "La flèche pointe vers l'avant de l'acteur. Il suffit de tourner l'acteur dans le niveau, sans toucher au code.",
          },
          {
            type: "vrai-faux",
            enonce: "Box et Arrow sont VisibleAnywhere : dans le Blueprint, on peut régler leurs propriétés (comme Box Extent), mais pas les remplacer par d'autres composants.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 0,
            explication:
              "VisibleAnywhere montre le composant dans l'éditeur et laisse régler ses propriétés, mais la variable elle-même ne peut pas être changée. C'est ce qu'on veut pour des composants créés dans le constructeur.",
          },
          {
            type: "qcm",
            enonce: "Tu numérotes tes checkpoints 1, 3 et 7. Que se passe-t-il ?",
            choix: [
              "Tout marche : seul l'ordre des numéros compte",
              "Le GameMode écrit un avertissement dans l'Output Log",
              "Le kart passe directement du 1 au 3",
              "Le GameMode croit qu'il y a 7 checkpoints, le kart attend le 2, et aucun tour n'est validé",
            ],
            bonne: 3,
            explication:
              "Le nombre de checkpoints est le plus grand ZoneIndex : 7. Le kart attend le 2, qui n'existe pas. Aucun message ne prévient : le GameMode n'avertit que s'il n'y a pas de ligne d'arrivée ou aucun checkpoint.",
          },
          {
            type: "code",
            enonce: "Quelle macro manque pour qu'Unreal puisse brancher cette fonction sur l'event de la boîte ?",
            code: "____\nvoid HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,\n\tint32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);",
            choix: [
              "UPROPERTY()",
              "UFUNCTION()",
              "GENERATED_BODY()",
              "UCLASS()",
            ],
            bonne: 1,
            explication:
              "Une fonction branchée sur un event dynamique doit être une UFUNCTION. Sans elle, ça compile, mais Unreal ne trouve pas la fonction et rien ne se passe en jeu. UPROPERTY est pour les variables.",
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
            enonce: "Pourquoi LapZone.cpp inclut-il Components/BoxComponent.h, alors que le header se contentait de class UBoxComponent; ?",
            choix: [
              "Parce que le .cpp appelle des fonctions de la boîte (SetBoxExtent…) : il doit connaître toute la classe",
              "Parce que la déclaration anticipée du header est effacée à la compilation",
              "Parce qu'un .cpp doit toujours répéter les includes de son header",
              "Pour que la boîte soit visible dans l'éditeur",
            ],
            bonne: 0,
            explication:
              "Une déclaration anticipée suffit pour un pointeur, pas pour appeler une fonction. Dans le .cpp, on appelle SetBoxExtent, SetCollisionProfileName… : il faut le vrai fichier de la classe.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi la zone désactive-t-elle son Tick ?",
            choix: [
              "Parce que le Tick empêche les overlaps",
              "Parce qu'un Actor ne peut pas avoir de Tick",
              "Parce qu'elle n'a rien à faire à chaque image : c'est le moteur qui la prévient quand un objet entre",
              "Pour que la flèche reste immobile",
            ],
            bonne: 2,
            explication:
              "La zone réagit à l'event OnComponentBeginOverlap. Un Tick vide serait appelé pour rien sur chaque zone, à chaque image.",
          },
          {
            type: "qcm",
            enonce: "La boîte est le composant racine (RootComponent = Box). Que se passe-t-il quand on tourne l'acteur dans le niveau ?",
            choix: [
              "Seule la flèche tourne, la boîte reste alignée sur le monde",
              "La boîte tourne, et la flèche attachée à elle tourne avec : le sens attendu change",
              "Rien : il faut tourner chaque composant séparément",
              "La zone change de numéro",
            ],
            bonne: 1,
            explication:
              "Déplacer ou tourner l'acteur, c'est déplacer ou tourner sa racine. La flèche est attachée à la boîte avec SetupAttachment : elle suit, et c'est elle qui donne le sens.",
          },
          {
            type: "code",
            enonce: "Avec cette taille par défaut, quelle largeur de piste la boîte couvre-t-elle ?",
            code: "Box->SetBoxExtent(FVector(50.f, 500.f, 200.f));",
            choix: [
              "5 m",
              "50 cm",
              "4 m",
              "10 m",
            ],
            bonne: 3,
            explication:
              "Box Extent est une demi-taille en cm, et Y est la largeur : 500 cm de chaque côté du centre, soit 10 m. De même, X = 50 donne 1 m d'épaisseur.",
          },
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
            type: "vrai-faux",
            enonce: "Les rayons du kart qui cherchent le sol risquent de prendre la boîte de la zone pour le sol.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Ces rayons ne gardent que ce qui bloque. Le profil Trigger ne bloque rien : les rayons traversent la boîte comme si elle n'existait pas.",
          },
          {
            type: "code",
            enonce: "Que se passe-t-il si on oublie cette ligne dans le constructeur ?",
            code: "Box->SetGenerateOverlapEvents(true);",
            choix: [
              "La boîte bloque les karts",
              "La boîte devient invisible en jeu",
              "Le jeu ne compile plus",
              "La boîte ne déclenche jamais OnComponentBeginOverlap : aucun passage n'est détecté",
            ],
            bonne: 3,
            explication:
              "Sans les events d'overlap, la boîte ne prévient personne : HandleBeginOverlap n'est jamais appelée, même si l'abonnement est bien fait dans BeginPlay.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay commence-t-il par Super::BeginPlay() ?",
            choix: [
              "Pour laisser d'abord AActor faire son propre travail de démarrage",
              "Pour appeler BeginPlay une deuxième fois",
              "Pour créer la boîte et la flèche",
              "Parce que sinon la fonction n'est pas virtual",
            ],
            bonne: 0,
            explication:
              "Notre BeginPlay remplace celui d'AActor (override). Super:: appelle la version du parent, pour ne pas sauter son travail. On l'appelle toujours en premier.",
          },
          {
            type: "code",
            enonce: "bShowInGame est décoché dans le Blueprint. Que se passe-t-il ?",
            code: "Box->SetHiddenInGame(!bShowInGame);\nArrow->SetHiddenInGame(!bShowInGame);",
            choix: [
              "La boîte et la flèche disparaissent aussi dans l'éditeur",
              "La boîte et la flèche sont cachées pendant le jeu, mais restent visibles dans l'éditeur",
              "La zone ne détecte plus les karts",
              "La boîte et la flèche sont visibles en jeu",
            ],
            bonne: 1,
            explication:
              "!bShowInGame vaut vrai, donc SetHiddenInGame(true) cache les composants pendant le jeu seulement. La détection ne dépend pas de la visibilité.",
          },
          {
            type: "code",
            enonce: "Que faut-il écrire pour abonner HandleBeginOverlap à l'event de la boîte ?",
            code: "Box->OnComponentBeginOverlap.____(this, &ALapZone::HandleBeginOverlap);",
            choix: [
              "Broadcast",
              "AddDynamic",
              "SetTimer",
              "Cast",
            ],
            bonne: 1,
            explication:
              "AddDynamic ajoute une fonction à la liste du délégué : Unreal l'appellera à chaque entrée dans la boîte. Broadcast, c'est déclencher l'event, ce que fait la boîte elle-même.",
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
            choix: [
              "1",
              "0",
              "-1",
              "2",
            ],
            bonne: 2,
            explication:
              "-1 × 1 + 0 × 0 + 0 × 0 = -1 : les deux directions sont opposées, le passage est ignoré.",
          },
          {
            type: "qcm",
            enonce: "La flèche pointe vers (0, 1, 0). Le kart roule vers (0.6, 0.8, 0). Que vaut le produit scalaire ?",
            choix: [
              "0.6",
              "0.8",
              "1.4",
              "0",
            ],
            bonne: 1,
            explication:
              "0.6 × 0 + 0.8 × 1 + 0 × 0 = 0.8. On multiplie X avec X, Y avec Y, Z avec Z, puis on additionne : seul Y compte ici. Positif, le kart va plutôt dans le sens de la flèche.",
          },
          {
            type: "qcm",
            enonce: "Un kart longe la ligne d'arrivée sans la traverser. Que vaut à peu près le produit scalaire avec la flèche ?",
            choix: [
              "Environ 1",
              "Environ -1",
              "Il est impossible à calculer",
              "Environ 0",
            ],
            bonne: 3,
            explication:
              "Les deux directions sont à angle droit : le produit scalaire vaut 0. Comme le test demande > 0, ce passage ne compte pas.",
          },
          {
            type: "code",
            enonce: "Le kart regarde vers (1, 0, 0) mais recule : CurrentSpeed vaut -300. Que renvoie GetMoveDirection ?",
            code: "return GetActorForwardVector() * FMath::Sign(CurrentSpeed);",
            choix: [
              "(1, 0, 0)",
              "(-300, 0, 0)",
              "(-1, 0, 0)",
              "(0, 0, 0)",
            ],
            bonne: 2,
            explication:
              "FMath::Sign(-300) vaut -1 : la direction avant est retournée vers l'arrière. La valeur 300 disparaît, seul le signe compte.",
          },
          {
            type: "qcm",
            enonce: "Que renvoie GetMoveDirection quand le kart est à l'arrêt ?",
            choix: [
              "La direction avant du kart",
              "(0, 0, 0), car Sign(0) vaut 0",
              "La direction arrière du kart",
              "La direction de la dernière zone traversée",
            ],
            bonne: 1,
            explication:
              "FMath::Sign(0) vaut 0, et une direction multipliée par 0 donne (0, 0, 0). Le produit scalaire vaut alors 0 : un kart arrêté ne valide aucune zone.",
          },
          {
            type: "vrai-faux",
            enonce: "Un kart qui roule deux fois plus vite obtient un produit scalaire deux fois plus grand avec la flèche.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "GetMoveDirection multiplie par Sign, qui vaut 1, -1 ou 0 : la direction garde une longueur de 1, quelle que soit la vitesse. Seul le sens compte.",
          },
          {
            type: "vrai-faux",
            enonce: "Un kart qui traverse la ligne en biais, mais vers l'avant de la flèche, est compté.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 0,
            explication:
              "Le produit scalaire est positif dès que les deux directions vont plutôt dans le même sens, même avec un angle. (0.7, 0.7, 0) avec (1, 0, 0) donne 0.7.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi utiliser le produit scalaire plutôt que calculer l'angle entre le kart et la flèche ?",
            choix: [
              "Parce qu'Unreal ne sait pas calculer d'angle",
              "Parce que l'angle ne marche pas en marche arrière",
              "Parce que le produit scalaire donne directement des degrés",
              "Parce qu'il suffit de regarder son signe : pas besoin de calculer un angle, ce qui serait plus long",
            ],
            bonne: 3,
            explication:
              "On veut juste savoir « même sens ou pas ». Le signe du produit scalaire répond à cette question en trois multiplications et deux additions.",
          },
          {
            type: "code",
            enonce: "Quelle comparaison faut-il pour accepter seulement les karts qui vont dans le sens de la flèche ?",
            code: "return FVector::DotProduct(MoveDirection, Arrow->GetForwardVector()) ____;",
            choix: [
              "< 0.f",
              "== 0.f",
              "!= 0.f",
              "> 0.f",
            ],
            bonne: 3,
            explication:
              "Positif = même sens. < 0.f accepterait seulement la marche arrière, et != 0.f accepterait les deux sens.",
          },
          {
            type: "qcm",
            enonce: "Si on écrivait >= 0.f au lieu de > 0.f, quel passage serait accepté en plus ?",
            choix: [
              "Un kart en marche arrière",
              "Un kart qui longe la zone ou un kart arrêté, pour qui le résultat vaut 0",
              "Aucun, ça revient au même",
              "Seulement les karts très rapides",
            ],
            bonne: 1,
            explication:
              "La seule valeur ajoutée par >= est 0 : les directions à angle droit et la direction nulle d'un kart arrêté. La marche arrière donne un résultat négatif, toujours refusé.",
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
            choix: [
              "Un pointeur vers le rocher",
              "Le kart le plus proche",
              "nullptr",
              "Le jeu plante",
            ],
            bonne: 2,
            explication:
              "Cast renvoie nullptr quand l'objet n'est pas du type demandé. C'est pour ça qu'on teste Kart == nullptr juste après, avant de s'en servir.",
          },
          {
            type: "qcm",
            enonce: "Un kart traverse un checkpoint en marche arrière. Où s'arrête HandleBeginOverlap ?",
            choix: [
              "Au premier return, car Cast échoue",
              "Au second return, car IsGoingRightWay renvoie faux : EnterLapZone n'est pas appelée",
              "Elle va jusqu'au bout et appelle EnterLapZone, qui refuse le passage",
              "Elle n'est pas appelée du tout",
            ],
            bonne: 1,
            explication:
              "Le Cast réussit (c'est un kart), mais le test du sens échoue : on sort avec return. Le kart n'est même pas prévenu. C'est le style « if (problème) return; » : on élimine les mauvais cas d'abord.",
          },
          {
            type: "vrai-faux",
            enonce: "C'est la zone qui retient combien de checkpoints chaque kart a passés.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "La zone ne retient rien : elle appelle EnterLapZone avec son numéro, et c'est le kart qui tient ses propres comptes. Plusieurs karts peuvent donc utiliser les mêmes zones.",
          },
          {
            type: "vrai-faux",
            enonce: "Un kart entre dans la boîte en marche arrière, puis repart en avant sans en être sorti : le passage est compté quand il repart en avant.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Le sens n'est testé qu'au moment de l'entrée. L'event ne se redéclenche que si le kart sort de la boîte et y entre à nouveau.",
          },
          {
            type: "qcm",
            enonce: "Avant de regarder le numéro de la zone, EnterLapZone vérifie trois choses. Lesquelles ?",
            choix: [
              "Qu'il y a un GameMode de kart, que la course est lancée, et que le kart n'a pas déjà fini",
              "Que le kart roule dans le bon sens, qu'il va assez vite, et qu'il est au sol",
              "Que la zone existe, qu'elle est visible, et qu'elle a une flèche",
              "Que le chrono tourne, que le joueur appuie sur l'accélérateur, et que le tour est inférieur à 3",
            ],
            bonne: 0,
            explication:
              "if (GameMode == nullptr || !GameMode->IsRaceStarted() || bHasFinishedRace) return; : pas de comptage pendant le compte à rebours, ni après l'arrivée. Le sens a déjà été vérifié par la zone.",
          },
          {
            type: "code",
            enonce: "Le circuit a 3 checkpoints. La grille est derrière la ligne : juste après le GO, le kart traverse la ligne (zone 0) avec NextCheckpoint = 1. Que se passe-t-il ?",
            code: "if (ZoneIndex == NextCheckpoint)\n{\n\t++NextCheckpoint;\n}\nelse if (ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount())\n{\n\tCompleteLap();\n}",
            choix: [
              "Un tour est validé tout de suite",
              "NextCheckpoint passe à 2",
              "La course se termine",
              "Rien : 0 n'est pas le checkpoint attendu, et 1 n'est pas plus grand que 3",
            ],
            bonne: 3,
            explication:
              "Aucune des deux conditions n'est vraie, le passage est ignoré. Le kart devra passer les checkpoints 1, 2 et 3 (NextCheckpoint arrive à 4) avant que la ligne valide son premier tour.",
          },
          {
            type: "qcm",
            enonce: "Le circuit a 3 checkpoints. NextCheckpoint vaut 2 et le kart traverse le checkpoint 3 dans le bon sens. Que se passe-t-il ?",
            choix: [
              "NextCheckpoint passe à 4",
              "Le tour est validé",
              "Rien : le kart attend le checkpoint 2",
              "NextCheckpoint revient à 1",
            ],
            bonne: 2,
            explication:
              "3 n'est pas égal à NextCheckpoint (2), et ce n'est pas la ligne d'arrivée : le passage est ignoré. C'est ce qui empêche de couper par un raccourci.",
          },
          {
            type: "vrai-faux",
            enonce: "Juste après un tour validé, repasser la ligne d'arrivée dans le bon sens ajoute un tour.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "CompleteLap remet NextCheckpoint à 1. Tant que les checkpoints du nouveau tour ne sont pas passés, la ligne est ignorée.",
          },
          {
            type: "qcm",
            enonce: "Un circuit n'a qu'une ligne d'arrivée, aucun checkpoint. Que se passe-t-il ?",
            choix: [
              "Aucun tour n'est jamais validé",
              "Le jeu plante au lancement",
              "Chaque passage de la ligne dans le bon sens valide un tour : les allers-retours redeviennent possibles",
              "Le kart doit faire deux fois le tour",
            ],
            bonne: 2,
            explication:
              "Le nombre de checkpoints vaut 0, et NextCheckpoint (1) est toujours plus grand que 0. Le GameMode l'écrit en avertissement dans l'Output Log.",
          },
          {
            type: "code",
            enonce: "Course en 3 tours. Le kart termine son 3e tour. Que se passe-t-il dans CompleteLap ?",
            code: "if (CurrentLap >= GameMode->GetLapCount())\n{\n\tbHasFinishedRace = true;\n\tFinishTime = GameMode->GetRaceTime();\n\tGameMode->NotifyKartFinished(this);\n\treturn;\n}\n\n++CurrentLap;",
            choix: [
              "CurrentLap passe à 4, puis la course se termine",
              "La course est finie pour ce kart et CurrentLap reste à 3",
              "Le GameMode remet le kart au tour 1",
              "Rien, il faut un 4e passage sur la ligne",
            ],
            bonne: 1,
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
          "Le GameMode vérifie à chaque Tick quelles zones chaque kart a traversées",
          "La boîte déclenche HandleBeginOverlap, la zone vérifie que c'est un kart et le sens, puis appelle EnterLapZone",
          "La zone appelle directement CompleteLap",
        ],
        bonne: 2,
        explication:
          "Tout part de l'event d'overlap de la boîte. La zone filtre (Cast, puis le sens), et c'est le kart qui décide dans EnterLapZone.",
      },
      {
        type: "qcm",
        enonce: "Qui retient quoi ?",
        choix: [
          "La zone retient les passages de chaque kart, le GameMode retient le tour de chaque kart",
          "Le kart retient tout, y compris le nombre de checkpoints du circuit",
          "Le GameMode retient le prochain checkpoint de chaque kart",
          "La zone retient son numéro, le GameMode le nombre de checkpoints du circuit, et chaque kart son tour et son prochain checkpoint",
        ],
        bonne: 3,
        explication:
          "ZoneIndex est dans la zone, CheckpointCount dans le GameMode (compté au démarrage), CurrentLap et NextCheckpoint dans le kart. Chaque kart a ses propres comptes, les zones n'ont rien à mémoriser.",
      },
      {
        type: "vrai-faux",
        enonce: "Si on oublie Box->SetGenerateOverlapEvents(true), la zone ne détecte plus les karts.",
        choix: [
          "Vrai",
          "Faux",
        ],
        bonne: 0,
        explication:
          "Sans cette option, la boîte ne déclenche pas OnComponentBeginOverlap, et HandleBeginOverlap n'est jamais appelée.",
      },
      {
        type: "qcm",
        enonce: "Un élève a oublié UFUNCTION() au-dessus de HandleBeginOverlap dans le header. Que se passe-t-il ?",
        choix: [
          "Le code compile, mais AddDynamic ne peut pas brancher la fonction : aucun passage n'est jamais détecté",
          "La zone bloque les karts comme un mur",
          "Les passages sont comptés deux fois",
          "Rien : UFUNCTION ne sert qu'aux Blueprints",
        ],
        bonne: 0,
        explication:
          "AddDynamic, dans BeginPlay, a besoin d'une fonction connue d'Unreal, donc marquée UFUNCTION. Sans elle, l'abonnement ne se fait pas et l'overlap ne déclenche rien.",
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
        type: "code",
        enonce: "Par erreur, la ligne d'arrivée a été tournée de 180° dans le niveau. Le kart fait le circuit dans le bon sens. Que se passe-t-il ?",
        code: "return FVector::DotProduct(MoveDirection, Arrow->GetForwardVector()) > 0.f;",
        choix: [
          "Rien de différent : la flèche est seulement décorative",
          "Le kart valide un tour à chaque checkpoint",
          "La ligne valide les tours deux fois",
          "La ligne refuse le kart (produit scalaire négatif) : aucun tour n'est jamais validé",
        ],
        bonne: 3,
        explication:
          "La flèche suit la rotation de l'acteur : elle pointe maintenant contre la course. Le produit scalaire est négatif, IsGoingRightWay renvoie faux et EnterLapZone(0) n'est jamais appelée.",
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
        enonce: "Un kart traverse le checkpoint 1 en marche arrière. Que se passe-t-il ?",
        code: "if (!IsGoingRightWay(Kart->GetMoveDirection()))\n{\n\treturn;\n}\n\nKart->EnterLapZone(ZoneIndex);",
        choix: [
          "EnterLapZone(1) est appelée et NextCheckpoint augmente",
          "GetMoveDirection renvoie l'arrière du kart, le produit scalaire est négatif, et la fonction sort sans prévenir le kart",
          "EnterLapZone(1) est appelée, puis le kart annule le passage",
          "Le kart perd un tour",
        ],
        bonne: 1,
        explication:
          "En marche arrière, Sign(CurrentSpeed) vaut -1 : la direction est retournée. IsGoingRightWay renvoie faux, le ! le rend vrai, et return arrête tout avant EnterLapZone.",
      },
      {
        type: "code",
        enonce: "Que se passe-t-il si le kart traverse la ligne d'arrivée alors que NextCheckpoint vaut 2, sur un circuit à 3 checkpoints ?",
        code: "else if (ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount())\n{\n\tCompleteLap();\n}",
        choix: [
          "Le tour est validé",
          "Le kart revient au checkpoint 1",
          "Rien : 2 n'est pas plus grand que 3, le passage est ignoré",
          "La course est finie",
        ],
        bonne: 2,
        explication:
          "Il manque les checkpoints 2 et 3 : la condition est fausse et aucune branche ne s'exécute.",
      },
      {
        type: "code",
        enonce: "Circuit à 2 checkpoints, NextCheckpoint vaut 1. Le kart traverse dans l'ordre les zones 1, 0, 2, 0. Quel passage valide le tour ?",
        code: "if (ZoneIndex == NextCheckpoint)\n{\n\t++NextCheckpoint;\n}\nelse if (ZoneIndex == 0 && NextCheckpoint > GameMode->GetCheckpointCount())\n{\n\tCompleteLap();\n}",
        choix: [
          "Le premier passage sur la ligne (2e zone)",
          "Le checkpoint 2 (3e zone)",
          "Aucun",
          "Le second passage sur la ligne (4e zone)",
        ],
        bonne: 3,
        explication:
          "Zone 1 : NextCheckpoint passe à 2. Zone 0 : 2 n'est pas plus grand que 2, ignoré. Zone 2 : NextCheckpoint passe à 3. Zone 0 : 3 > 2, CompleteLap.",
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
        type: "qcm",
        enonce: "Un level designer pose les zones 0, 1, 2, et un checkpoint dupliqué qu'il a oublié de renuméroter : il porte aussi le 2 au lieu du 3. Que se passe-t-il ?",
        choix: [
          "Aucun tour n'est jamais validé",
          "Le GameMode compte 3 checkpoints",
          "Le GameMode compte 2 checkpoints : le tour est validé après 1 puis le premier 2 rencontré, la zone en double ne sert à rien",
          "Le GameMode écrit un avertissement dans l'Output Log",
        ],
        bonne: 2,
        explication:
          "Le plus grand numéro est 2. Après le premier 2, NextCheckpoint vaut 3 : le second 2 est ignoré, et la ligne valide le tour (3 > 2). Le joueur peut couper la partie du circuit que cette zone devait surveiller.",
      },
      {
        type: "vrai-faux",
        enonce: "Une fois bHasFinishedRace à vrai, les zones traversées par ce kart ne comptent plus.",
        choix: [
          "Vrai",
          "Faux",
        ],
        bonne: 0,
        explication:
          "EnterLapZone et CompleteLap commencent toutes les deux par vérifier bHasFinishedRace et sortent tout de suite.",
      },
      {
        type: "qcm",
        enonce: "À quoi sert ResetRaceProgress ?",
        choix: [
          "À remettre le kart sur la ligne de départ",
          "À recompter les checkpoints du niveau",
          "À arrêter le chrono",
          "À remettre le tour à 1, le prochain checkpoint à 1, et effacer la fin de course et le temps",
        ],
        bonne: 3,
        explication:
          "Elle remet les quatre variables de course à leur valeur de départ. Elle ne déplace pas le kart. Le GameMode l'appelle sur tous les karts au début du compte à rebours.",
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
