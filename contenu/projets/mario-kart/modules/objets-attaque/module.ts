import type { Module } from "@/contenu/types";

export const objetsAttaque: Module = {
  slug: "objets-attaque",
  titre: "Pièges, projectiles et HUD",
  resume: "Tête-à-queue, piège, projectile qui rebondit et case d'objet du HUD",
  intro:
    "Après les objets qui aident, voici ceux qui gênent : un piège posé derrière soi et un projectile qui rebondit sur les murs. Le kart apprend d'abord à partir en tête-à-queue, puis une classe « danger » sert de parent au piège et au projectile. On termine par la case d'objet du HUD et sa roulette d'icônes.",
  fichiers: [
    "KartPawn.h",
    "KartPawn.cpp",
    "KartItemData_SpawnActor.h",
    "KartItemData_SpawnActor.cpp",
    "KartItemHazard.h",
    "KartItemHazard.cpp",
    "KartItemProjectile.h",
    "KartItemProjectile.cpp",
    "KartItemWidget.h",
    "KartItemWidget.cpp",
    "KartPlayerController.h",
    "KartPlayerController.cpp",
  ],
  lecons: [
    {
      slug: "tete-a-queue",
      titre: "Le kart évolue : le tête-à-queue",
      resume: "Les lignes ajoutées à KartPawn pour être touché : SpinOut, UpdateSpinOut, et UpdateVisuals retouchée",
      dureeMin: 20,
      fichiers: ["KartPawn.h", "KartPawn.cpp"],
      charger: () => import("./tete-a-queue.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/tete-a-queue",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi UpdateSpinOut est-elle appelée avant UpdateSpeed dans le Tick ?",
            choix: [
              "Parce qu'elle efface les touches et freine : après UpdateSpeed, le kart aurait accéléré une image de plus",
              "Parce que les fonctions doivent être appelées dans l'ordre alphabétique",
              "Parce que UpdateSpeed remet SpinOutYaw à 0",
              "Pour que la caméra tourne avec le châssis",
            ],
            bonne: 0,
            explication:
              "UpdateSpeed utilise ThrottleInput. Si les touches étaient effacées après, le joueur garderait le contrôle pendant une image à chaque frame du tête-à-queue.",
          },
          {
            type: "vrai-faux",
            enonce: "Pendant un tête-à-queue, l'écran tourne avec le châssis.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La caméra suit seulement BodySlideYaw (le drift). SpinOutYaw n'est ajouté qu'à la rotation du châssis.",
          },
          {
            type: "code",
            enonce: "Un kart déjà en tête-à-queue roule sur un deuxième piège. Que se passe-t-il ?",
            code: "if (Duration <= 0.f || IsSpinningOut())\n{\n\treturn;\n}",
            choix: [
              "Le tête-à-queue recommence depuis le début",
              "La durée s'ajoute à celle qui reste",
              "Rien : le deuxième choc est ignoré (le piège disparaît quand même)",
              "Le kart s'arrête net",
            ],
            bonne: 2,
            explication:
              "SpinOut sort tout de suite si le kart tourne déjà. Le piège, lui, appelle Destroy après SpinOut : il est consommé.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi SpinOut remet-elle bIsDrifting à faux au lieu d'appeler EndDrift ?",
            choix: [
              "Parce que EndDrift est private",
              "Parce que EndDrift donnerait le turbo de la charge accumulée, et se faire toucher ne doit pas récompenser",
              "Parce que EndDrift ne marche qu'en l'air",
              "Pour aller plus vite",
            ],
            bonne: 1,
            explication:
              "EndDrift lance un mini-turbo ou un super-turbo selon DriftChargeTime. SpinOut remet directement l'état du drift à zéro, sans boost.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le châssis ne fait-il pas de saut visible à la fin du tête-à-queue ?",
            choix: [
              "Parce que la caméra cache le châssis",
              "Parce que SetRelativeRotation ignore les grands angles",
              "Parce que UpdateVisuals n'est plus appelée",
              "Parce que SpinOutYaw finit à 720 degrés (2 tours complets), la même position que 0",
            ],
            bonne: 3,
            explication:
              "La courbe EaseOut vaut 1 à la fin : 360 × 2 × 1 = 720 degrés. Repasser à 0 à l'image suivante ne change pas l'orientation.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-attaque/tete-a-queue/body-slide-yaw",
          enonce:
            "Avant ce module, UpdateVisuals relisait l'angle du drift sur le mesh du châssis. Explique pourquoi ça ne marche plus avec le tête-à-queue, et ce que fait la variable BodySlideYaw à la place.",
          attendus:
            "Pendant un tête-à-queue, le mesh tourne en plus de SpinOutYaw. Relire son angle donnerait drift + tête-à-queue mélangés : FInterpTo partirait d'une mauvaise valeur et le châssis se mettrait de travers n'importe comment (et l'angle relu est ramené entre -180 et 180). BodySlideYaw garde l'angle du drift seul, d'une image à l'autre, sans dépendre du mesh ; on lui ajoute SpinOutYaw seulement au moment d'appliquer la rotation.",
        },
      ],
    },
    {
      slug: "spawn-actor",
      titre: "Faire apparaître un acteur : UKartItemData_SpawnActor",
      resume: "Un seul Data Asset pour le piège et le projectile : TransformPosition, Owner et SpawnActor",
      dureeMin: 15,
      fichiers: ["KartItemData_SpawnActor.h", "KartItemData_SpawnActor.cpp"],
      charger: () => import("./spawn-actor.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/spawn-actor",
        questions: [
          {
            type: "qcm",
            enonce: "Le kart regarde vers la droite de l'écran. SpawnOffset vaut (-150, 0, 0). Où apparaît le piège ?",
            choix: [
              "150 cm vers le bas du monde",
              "Toujours 150 cm à l'ouest du niveau",
              "150 cm vers la gauche de l'écran, derrière le kart",
              "Au centre du niveau",
            ],
            bonne: 2,
            explication:
              "TransformPosition applique la rotation du kart : X négatif veut dire « derrière le kart », quelle que soit sa direction.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi garde-t-on seulement le Yaw du kart pour la rotation de l'acteur créé ?",
            choix: [
              "Pour que l'acteur parte à l'horizontale, même si le kart est penché dans une pente",
              "Parce que FRotator n'a qu'un seul angle",
              "Pour que l'acteur tourne sur lui-même",
              "Parce que SpawnActor refuse les autres angles",
            ],
            bonne: 0,
            explication:
              "Dans une montée, le Pitch du kart est non nul. Un projectile qui le copierait partirait vers le ciel.",
          },
          {
            type: "vrai-faux",
            enonce: "Si ActorClass n'est pas rempli dans l'asset, l'objet est quand même consommé.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Activate renvoie false quand ActorClass vaut nullptr : le composant d'objet ne retire pas d'utilisation.",
          },
          {
            type: "code",
            enonce: "À quoi sert cette ligne ?",
            code: "SpawnParams.Owner = Kart;",
            choix: [
              "À faire suivre le kart par l'acteur",
              "À attacher l'acteur au kart comme un composant",
              "À donner l'objet à un autre kart",
              "À retenir quel kart a lancé l'objet, pour que le piège puisse l'ignorer un instant",
            ],
            bonne: 3,
            explication:
              "Owner ne déplace rien : c'est une information. AKartItemHazard la relit avec GetOwner() pour protéger le lanceur.",
          },
        ],
      },
    },
    {
      slug: "danger-piege",
      titre: "Le danger et le piège : AKartItemHazard",
      resume: "Collision réglée canal par canal, pose au sol, lanceur protégé, tête-à-queue et disparition",
      dureeMin: 25,
      fichiers: ["KartItemHazard.h", "KartItemHazard.cpp"],
      charger: () => import("./danger-piege.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/danger-piege",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi la sphère du danger répond Overlap (et pas Block) au canal Pawn ?",
            choix: [
              "Pour que le kart rebondisse dessus",
              "Pour que le kart passe au travers et déclenche l'event OnComponentBeginOverlap",
              "Pour que le danger soit invisible",
              "Parce que Block ne marche pas sur une sphère",
            ],
            bonne: 1,
            explication:
              "Avec Block, le kart taperait dedans comme dans un mur. Overlap le laisse passer et prévient le danger, qui lance le tête-à-queue.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si le danger répondait Block au canal Visibility ?",
            choix: [
              "Les rayons des roues du kart prendraient le piège pour du sol : le kart monterait dessus",
              "Rien de différent",
              "Le piège ne détecterait plus les karts",
              "La caméra traverserait les murs",
            ],
            bonne: 0,
            explication:
              "Le kart cherche le sol avec des rayons sur le canal Visibility. Le danger l'ignore justement pour ne pas devenir une bosse.",
          },
          {
            type: "vrai-faux",
            enonce: "Le kart qui pose un piège ne peut jamais se faire toucher par ce piège.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Il n'est protégé que pendant OwnerSafeTime (0,5 seconde). S'il recule dessus plus tard, il part en tête-à-queue.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi FindGround et les réglages sont-ils protected et pas private ?",
            choix: [
              "Pour que les Blueprints puissent les appeler",
              "Parce que private n'existe pas dans un Actor",
              "Pour que la classe enfant AKartItemProjectile puisse s'en servir",
              "Pour qu'ils soient visibles dans l'éditeur",
            ],
            bonne: 2,
            explication:
              "private est réservé à la classe elle-même. protected ouvre l'accès aux classes enfants : le projectile appelle FindGround à chaque image.",
          },
          {
            type: "code",
            enonce: "Pourquoi n'écrit-on rien après cette ligne dans HandleBeginOverlap ?",
            code: "Kart->SpinOut(SpinOutDuration);\nOnHitKart(Kart);\n\nDestroy();",
            choix: [
              "Parce que Destroy arrête le programme",
              "Parce que l'acteur est en train d'être détruit : il ne faut plus s'en servir",
              "Parce que le compilateur l'interdit",
              "Parce que Destroy relance BeginPlay",
            ],
            bonne: 1,
            explication:
              "Après Destroy, l'acteur est retiré du niveau. On évite de lire ses composants ou d'appeler ses fonctions ensuite.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-attaque/danger-piege/collision",
          enonce:
            "Explique, canal par canal, ce que fait la collision de la sphère du danger avec : un mur, un kart, les rayons des roues du kart. Pour chacun, dis ce qui se passerait avec un autre réglage.",
          attendus:
            "Mur (WorldStatic) : Block, le projectile s'arrête et peut rebondir ; avec Overlap, il traverserait les murs. Kart (Pawn) : Overlap, le kart passe au travers et l'event déclenche le tête-à-queue ; avec Block, le kart taperait dedans, avec Ignore rien ne se passerait. Rayons des roues (Visibility) : Ignore, le kart ne prend pas le piège pour du sol ; avec Block, le kart monterait dessus comme sur une bosse. Bonus : la réponse la plus faible des deux objets l'emporte.",
        },
      ],
    },
    {
      slug: "projectile",
      titre: "Le projectile : hériter du danger et rebondir",
      resume: "Un enfant de AKartItemHazard qui colle au sol, avance avec un sweep et rebondit avec MirrorByVector",
      dureeMin: 20,
      fichiers: ["KartItemProjectile.h", "KartItemProjectile.cpp"],
      charger: () => import("./projectile.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/projectile",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi le constructeur du projectile remet-il bCanEverTick à vrai ?",
            choix: [
              "Parce que bCanEverTick est faux pour tous les acteurs",
              "Pour que BeginPlay soit appelé",
              "Pour pouvoir rebondir sur les karts",
              "Parce que le constructeur du parent, appelé avant, l'a mis à faux",
            ],
            bonne: 3,
            explication:
              "Un piège ne bouge pas, donc AKartItemHazard coupe le Tick. Le constructeur de l'enfant passe après et le rallume.",
          },
          {
            type: "qcm",
            enonce: "Le projectile va vers (1, 0, 0) et touche un mur de normale (-1, 0, 0). Quelle est sa nouvelle direction ?",
            choix: ["(1, 0, 0)", "(0, 1, 0)", "(-1, 0, 0)", "(0, 0, 1)"],
            bonne: 2,
            explication: "Il arrive de face : la partie qui rentre dans le mur est inversée, il repart en sens inverse.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on supprime Super::BeginPlay() dans le projectile, il touche quand même les karts.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "C'est le BeginPlay du parent qui abonne HandleBeginOverlap à l'event de la sphère. Sans lui, aucun kart ne serait jamais touché.",
          },
          {
            type: "code",
            enonce: "MaxBounces vaut 3. Au combientième mur le projectile disparaît-il ?",
            code: "if (BouncesLeft <= 0)\n{\n\tDestroy();\n\treturn;\n}\n--BouncesLeft;",
            choix: ["Au 4e", "Au 1er", "Au 3e", "Jamais"],
            bonne: 0,
            explication: "Les 3 premiers murs font passer BouncesLeft de 3 à 0. Au 4e, BouncesLeft vaut 0 : Destroy.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le projectile a-t-il un InitialLifeSpan de 10 secondes ?",
            choix: [
              "Pour qu'il accélère pendant 10 secondes",
              "Pour qu'il ne touche pas son lanceur",
              "Pour limiter le nombre de rebonds",
              "Pour qu'un projectile qui ne touche personne finisse par disparaître tout seul",
            ],
            bonne: 3,
            explication:
              "Sur un circuit sans murs devant lui, il pourrait rouler très longtemps. La durée de vie le détruit automatiquement.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-attaque/projectile/heritage",
          enonce:
            "Liste ce que AKartItemProjectile reçoit de AKartItemHazard sans rien réécrire, puis ce qu'il ajoute. Explique ce que l'héritage évite ici.",
          attendus:
            "Hérité : la sphère de collision et ses réglages canal par canal, le mesh, SpinOutDuration, HoverHeight, OwnerSafeTime, OnHitKart, FindGround, la pose au sol au BeginPlay, HandleBeginOverlap (tête-à-queue du kart touché, protection du lanceur, Destroy). Ajouté : le Tick rallumé, InitialLifeSpan, Speed, MaxBounces, la gravité, la direction, le collage au sol à chaque image et le rebond. L'héritage évite de copier le code de collision et de toucher : une correction dans le parent profite au piège et au projectile.",
        },
      ],
    },
    {
      slug: "widget-objet",
      titre: "La case d'objet : le header et le PlayerController",
      resume: "KartItemWidget.h (BindWidget, TWeakObjectPtr) et les lignes ajoutées au PlayerController pour le créer",
      dureeMin: 15,
      fichiers: ["KartItemWidget.h", "KartPlayerController.h", "KartPlayerController.cpp"],
      charger: () => import("./widget-objet.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/widget-objet",
        questions: [
          {
            type: "qcm",
            enonce: "Dans WBP_ItemSlot, l'image s'appelle « Icon » au lieu de « ItemIcon ». Que se passe-t-il ?",
            choix: [
              "Rien, Unreal trouve l'image tout seul",
              "Le WBP refuse de compiler : BindWidget exige un widget nommé ItemIcon",
              "L'icône s'affiche en double",
              "Le jeu plante au lancement seulement",
            ],
            bonne: 1,
            explication: "BindWidget relie la variable C++ au widget du même nom. S'il manque, le Widget Blueprint signale une erreur de compilation.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ItemComponent est-il un TWeakObjectPtr ?",
            choix: [
              "Pour que le widget ne garde pas en vie un kart détruit : le pointeur devient nul tout seul",
              "Parce qu'il est plus rapide",
              "Parce que UPROPERTY est interdit dans un widget",
              "Pour pouvoir le modifier depuis le Blueprint",
            ],
            bonne: 0,
            explication: "Un pointeur faible observe l'objet sans le retenir. On vérifie IsValid() avant de s'en servir.",
          },
          {
            type: "vrai-faux",
            enonce: "Si ItemWidgetClass est vide dans BP_KartPlayerController, le jeu plante.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Le bloc commence par if (ItemWidgetClass != nullptr) : sans classe choisie, il est simplement sauté.",
          },
        ],
      },
    },
    {
      slug: "widget-roulette",
      titre: "La case d'objet : s'abonner et faire tourner la roulette",
      resume: "KartItemWidget.cpp : suivre le pawn du joueur, réagir aux delegates du composant, animer les icônes",
      dureeMin: 20,
      fichiers: ["KartItemWidget.cpp"],
      charger: () => import("./widget-roulette.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/widget-roulette",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi NativeConstruct appelle-t-il BindToPawn tout de suite, en plus de s'abonner à OnPossessedPawnChanged ?",
            choix: [
              "Pour s'abonner deux fois",
              "Parce que OnPossessedPawnChanged n'existe pas sur un PlayerController",
              "Parce que l'event ne prévient que des PROCHAINS changements : si le kart existe déjà, il faut s'y brancher maintenant",
              "Pour lancer la roulette",
            ],
            bonne: 2,
            explication: "Un delegate ne rejoue pas le passé. Le pawn actuel est donc traité à la main, les suivants par l'event.",
          },
          {
            type: "code",
            enonce: "La table contient 3 objets et RouletteIndex vaut 2. Que vaut-il après cette ligne ?",
            code: "RouletteIndex = (RouletteIndex + 1) % RoulettePool->Entries.Num();",
            choix: ["3", "0", "1", "2"],
            bonne: 1,
            explication: "(2 + 1) % 3 = 0 : le modulo fait revenir au début de la liste.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi fait-on RouletteTimer -= RouletteIconInterval au lieu de RouletteTimer = 0 ?",
            choix: [
              "Pour que la roulette accélère",
              "Parce que 0 n'est pas un float",
              "Pour arrêter la roulette",
              "Pour garder le temps en trop et avoir un rythme régulier, même si les images n'ont pas toutes la même durée",
            ],
            bonne: 3,
            explication: "Si une image dépasse de 0,02 seconde, ce temps compte pour l'icône suivante au lieu d'être perdu.",
          },
          {
            type: "vrai-faux",
            enonce: "C'est le widget qui choisit l'objet que le joueur va recevoir.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le composant d'objet tire l'objet au début de la roulette. Le widget fait seulement défiler des icônes, puis affiche ce que OnItemChanged lui envoie.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-attaque/widget-roulette/abonnement",
          enonce:
            "Décris tout ce qui se passe, dans l'ordre, entre le moment où le joueur roule dans une boîte à bonus et le moment où l'icône de l'objet s'affiche dans la case. Cite les fonctions et les delegates.",
          attendus:
            "La boîte appelle TryGiveRandomItem sur le composant d'objet, qui tire l'objet et diffuse OnRouletteStarted (table, durée). HandleRouletteStarted retient la table et remet la roulette à zéro. À chaque image, NativeTick fait défiler les icônes de la table toutes les 0,08 s (modulo). À la fin du timer, le composant appelle SetItem et diffuse OnItemChanged : HandleItemChanged arrête la roulette (RoulettePool = nullptr), affiche l'icône avec ShowIcon et le texte x3 si besoin. Le widget avait été abonné à ces delegates par BindToPawn.",
        },
      ],
    },
  ],
  quizFinal: {
    id: "mario-kart/objets-attaque/final",
    questions: [
      {
        type: "qcm",
        enonce: "Le piège et le projectile utilisent la même classe de Data Asset. Qu'est-ce qui les différencie ?",
        choix: [
          "Rien, ce sont les mêmes objets",
          "Le nombre de lignes de code de leur Data Asset",
          "Leur ActorClass (BP_ItemTrap ou BP_ItemProjectile) et leur SpawnOffset (derrière ou devant)",
          "Leur fonction Activate, réécrite pour chacun",
        ],
        bonne: 2,
        explication: "UKartItemData_SpawnActor fait toujours la même chose. Seules les données de chaque asset changent.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre se passent les choses quand un projectile touche un kart ?",
        choix: [
          "La sphère du projectile déclenche HandleBeginOverlap (hérité du danger), qui appelle SpinOut, OnHitKart puis Destroy",
          "Le kart détecte le projectile dans son Tick et appelle Destroy",
          "Le composant d'objet du kart touché retire un objet",
          "Le GameMode compte le choc",
        ],
        bonne: 0,
        explication: "Tout part de l'overlap de la sphère. Le code est dans AKartItemHazard, le projectile en hérite.",
      },
      {
        type: "vrai-faux",
        enonce: "Pour que le projectile rebondisse sur les murs, il faut que sa sphère réponde Block aux objets du décor.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "Le sweep de AddActorWorldOffset ne s'arrête que sur ce qui bloque. Sans Block, le projectile traverserait les murs.",
      },
      {
        type: "qcm",
        enonce: "Quelle variable du kart dit s'il est en train de faire un tête-à-queue ?",
        choix: ["bIsSpinning", "SpinOutYaw", "bCanMove", "SpinOutTimeRemaining, lue par IsSpinningOut"],
        bonne: 3,
        explication: "IsSpinningOut renvoie SpinOutTimeRemaining > 0. Une seule variable à tenir à jour.",
      },
      {
        type: "qcm",
        enonce: "Pendant un tête-à-queue, que se passe-t-il si le joueur appuie sur la touche d'objet ?",
        choix: [
          "L'objet est utilisé normalement",
          "Rien : OnUseItemPressed vérifie que le kart ne tourne pas",
          "L'objet est perdu",
          "Le tête-à-queue s'arrête",
        ],
        bonne: 1,
        explication: "Comme le saut et le drift, l'utilisation d'objet est bloquée tant que IsSpinningOut renvoie vrai.",
      },
      {
        type: "code",
        enonce: "Que fait cette ligne du projectile ?",
        code: "Direction = FVector::VectorPlaneProject(MoveDirection, GroundHit.ImpactNormal).GetSafeNormal();",
        choix: [
          "Elle aplatit la direction sur le sol pour suivre la pente, puis remet sa longueur à 1",
          "Elle fait rebondir le projectile",
          "Elle fait tomber le projectile",
          "Elle tourne le mesh",
        ],
        bonne: 0,
        explication: "C'est la même technique que dans MoveKart : avancer le long de la pente plutôt que de rentrer dedans.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi le widget d'objet s'abonne-t-il à OnPossessedPawnChanged du PlayerController ?",
        choix: [
          "Pour savoir quand la course commence",
          "Pour afficher le nom du joueur",
          "Parce que le widget peut être créé avant que le joueur ait son kart, ou le joueur peut changer de pawn",
          "Pour détruire le kart",
        ],
        bonne: 2,
        explication: "Le PlayerController prévient le widget à chaque nouveau pawn : il se rebranche sur le bon composant d'objet.",
      },
      {
        type: "vrai-faux",
        enonce: "Si on retire WBP_ItemSlot du PlayerController, les objets bonus ne marchent plus.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication: "Le widget ne fait qu'afficher. Le tirage, l'utilisation et les effets sont gérés par le composant et les Data Assets.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi UpdateVisuals n'utilise-t-elle plus l'angle du mesh pour le drift ?",
        choix: [
          "Parce que lire le mesh est interdit en C++",
          "Parce que pendant un tête-à-queue le mesh tourne aussi : son angle mélangerait drift et tête-à-queue",
          "Pour que la caméra tourne plus vite",
          "Parce que le mesh n'existe plus",
        ],
        bonne: 1,
        explication: "BodySlideYaw garde l'angle du drift seul. SpinOutYaw est ajouté seulement au moment d'appliquer la rotation.",
      },
    ],
  },
  defi: {
    id: "mario-kart/objets-attaque/defi-nouveau-danger",
    titre: "Un nouvel objet en ne créant que des assets",
    consigne:
      "Crée un objet « Mur de pneus » sans écrire une ligne de C++ : un Blueprint qui hérite de AKartItemHazard avec un gros mesh, un SpinOutDuration de 2,5 secondes et un HoverHeight adapté, puis un Data Asset KartItemData_SpawnActor qui le pose derrière le kart, ajouté dans DA_ItemPool_Default. Ensuite, pour les plus motivés : crée un projectile « double » : un Blueprint enfant de BP_ItemProjectile avec MaxBounces = 0, et un Data Asset qui le lance avec Uses = 2. Dépose une capture ou une vidéo du piège en action.",
  },
};
