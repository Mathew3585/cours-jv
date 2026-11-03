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
            enonce: "Pourquoi SpinOut est-elle public alors que UpdateSpinOut est private ?",
            choix: [
              "Parce qu'une fonction UFUNCTION doit toujours être public",
              "Parce que SpinOut est appelée par d'autres classes (le piège, le projectile), alors que UpdateSpinOut est une étape du Tick que seul le kart appelle",
              "Parce que UpdateSpinOut est appelée par le Blueprint",
              "Parce que private rend la fonction plus rapide",
            ],
            bonne: 1,
            explication:
              "Le danger qui touche le kart doit pouvoir appeler SpinOut, donc elle est public. UpdateSpinOut fait partie du Tick du kart : personne d'autre ne doit l'appeler.",
          },
          {
            type: "qcm",
            enonce: "IsSpinningOut renvoie SpinOutTimeRemaining > 0. Pourquoi ne pas stocker plutôt un booléen bIsSpinningOut ?",
            choix: [
              "Parce qu'un booléen ne peut pas être affiché dans les Details",
              "Parce qu'une fonction const ne peut pas lire un booléen",
              "Parce qu'on n'aurait qu'une seule variable à tenir à jour : impossible d'avoir un booléen vrai avec un temps restant à 0",
              "Parce que les booléens sont interdits dans un Pawn",
            ],
            bonne: 2,
            explication:
              "Avec deux variables, il faudrait penser à les changer ensemble, et un oubli les ferait se contredire. En déduisant l'état du temps restant, la question ne se pose pas.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi SpinOutTurns est-il un int32 et pas un float ?",
            choix: [
              "Pour que le châssis fasse des tours complets et retombe droit à la fin, sans saut quand SpinOutYaw repasse à 0",
              "Parce qu'un float ne peut pas être réglé dans l'éditeur",
              "Parce que les int32 se calculent plus vite",
              "Parce que SpinOutYaw est aussi un entier",
            ],
            bonne: 0,
            explication:
              "Avec 2 tours, SpinOutYaw finit à 720 degrés, la même position que 0. Avec 1,5 tour, le châssis finirait de travers puis sauterait d'un coup à 0 à l'image suivante.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi UpdateSpinOut est-elle appelée avant UpdateSpeed dans le Tick ?",
            choix: [
              "Parce que les fonctions doivent être appelées dans l'ordre alphabétique",
              "Parce que UpdateSpeed remet SpinOutYaw à 0",
              "Pour que la caméra tourne avec le châssis",
              "Parce qu'elle efface les touches : après UpdateSpeed, le kart aurait accéléré une image de plus",
            ],
            bonne: 3,
            explication:
              "UpdateSpeed utilise ThrottleInput. Si les touches étaient effacées après, le joueur garderait le contrôle pendant une image à chaque frame du tête-à-queue.",
          },
          {
            type: "vrai-faux",
            enonce: "Pendant un tête-à-queue, l'écran tourne avec le châssis.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La caméra suit seulement BodySlideYaw (le drift). SpinOutYaw n'est ajouté qu'à la rotation du châssis, sinon tout l'écran ferait deux tours.",
          },
          {
            type: "code",
            enonce: "Cette garde a été ajoutée dans Jump et dans StartDrift. Que faut-il écrire à la place du trou ?",
            code: "// Pas de saut pendant un tête-à-queue\nif (____)\n{\n\treturn;\n}",
            choix: ["!IsSpinningOut()", "bIsDrifting", "IsSpinningOut()", "SpinOutYaw == 0.f"],
            bonne: 2,
            explication:
              "On sort de la fonction quand le kart tourne. Avec !IsSpinningOut(), ce serait l'inverse : on ne pourrait sauter QUE pendant un tête-à-queue.",
          },
          {
            type: "code",
            enonce: "Un kart déjà en tête-à-queue roule sur un deuxième piège. Que se passe-t-il ?",
            code: "if (Duration <= 0.f || IsSpinningOut())\n{\n\treturn;\n}",
            choix: [
              "Le tête-à-queue recommence depuis le début",
              "La durée s'ajoute à celle qui reste",
              "Le kart s'arrête net",
              "Rien : le deuxième choc est ignoré (le piège disparaît quand même)",
            ],
            bonne: 3,
            explication:
              "SpinOut sort tout de suite si le kart tourne déjà. Sans ce test, deux pièges collés relanceraient le chrono et bloqueraient le kart deux fois plus longtemps.",
          },
          {
            type: "code",
            enonce: "SpinOutSpeedFactor vaut 0,6. Le kart roule à 2000 cm/s quand il est touché. Que vaut CurrentSpeed juste après cette ligne de SpinOut ?",
            code: "CurrentSpeed *= SpinOutSpeedFactor;",
            choix: ["800 cm/s", "1200 cm/s", "0 cm/s", "1999,4 cm/s"],
            bonne: 1,
            explication:
              "2000 × 0,6 = 1200 : le kart garde 60 % de sa vitesse. 800 serait la vitesse perdue, pas celle qui reste.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi SpinOut remet-elle bIsDrifting à faux au lieu d'appeler EndDrift ?",
            choix: [
              "Parce que EndDrift donnerait le turbo de la charge accumulée, et se faire toucher ne doit pas récompenser",
              "Parce que EndDrift est private",
              "Parce que EndDrift ne marche qu'en l'air",
              "Parce que EndDrift relancerait le tête-à-queue",
            ],
            bonne: 0,
            explication:
              "EndDrift lance un mini-turbo ou un super-turbo selon DriftChargeTime. SpinOut remet directement l'état du drift à zéro (bIsDrifting, DriftDirection, DriftChargeTime), sans boost.",
          },
          {
            type: "code",
            enonce: "SpinOutTurns vaut 2. À mi-chemin du tête-à-queue, Progress vaut 0,5. Que vaut SpinOutYaw ?",
            code: "const float EaseOut = 1.f - FMath::Square(1.f - Progress);\nSpinOutYaw = 360.f * SpinOutTurns * EaseOut;",
            choix: ["360 degrés", "180 degrés", "720 degrés", "540 degrés"],
            bonne: 3,
            explication:
              "EaseOut = 1 - 0,5² = 0,75, donc 360 × 2 × 0,75 = 540. Le châssis a déjà fait les trois quarts de sa rotation à mi-temps : la courbe monte vite puis ralentit.",
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
            enonce: "Pourquoi une seule classe UKartItemData_SpawnActor suffit-elle pour le piège ET le projectile ?",
            choix: [
              "Parce que le piège et le projectile sont le même acteur",
              "Parce que leur travail est le même (faire apparaître un acteur près du kart) : seules les données changent, donc ce sont deux assets de la même classe",
              "Parce qu'Unreal interdit d'avoir deux classes de Data Asset",
              "Parce que la classe choisit au hasard entre piège et projectile",
            ],
            bonne: 1,
            explication:
              "Ce qui change d'un objet à l'autre est une donnée (quel acteur, où), pas du code. Un nouvel objet de ce genre ne demande qu'un nouvel asset.",
          },
          {
            type: "qcm",
            enonce: "Que contient ActorClass, déclarée en TSubclassOf<AActor> ?",
            choix: [
              "Un pointeur vers un acteur déjà posé dans le niveau",
              "N'importe quel objet Unreal, même un son ou une texture",
              "Une liste d'acteurs à créer l'un après l'autre",
              "Une classe qui hérite de AActor (par exemple BP_ItemTrap), choisie dans une liste de l'éditeur, dont on créera un exemplaire",
            ],
            bonne: 3,
            explication:
              "TSubclassOf désigne une classe, pas un objet existant. SpawnActor fabrique ensuite un nouvel acteur de cette classe à chaque utilisation.",
          },
          {
            type: "code",
            enonce: "Que garantit le const à la fin de cette signature ?",
            code: "bool UKartItemData_SpawnActor::Activate(AKartPawn* Kart) const",
            choix: [
              "Que la fonction ne modifie pas l'asset, qui est partagé par tous les karts",
              "Que la fonction ne modifie pas le kart",
              "Que la fonction renvoie toujours la même valeur",
              "Que la fonction ne peut pas créer d'acteur",
            ],
            bonne: 0,
            explication:
              "const porte sur l'objet de la fonction : le Data Asset. Le kart, lui, n'est pas const (on pourrait le modifier), et SpawnActor passe par le monde, pas par l'asset.",
          },
          {
            type: "vrai-faux",
            enonce: "Si ActorClass n'est pas rempli dans l'asset, l'objet est quand même consommé.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Activate renvoie false quand ActorClass vaut nullptr : le composant d'objet ne retire pas d'utilisation, le joueur garde son objet.",
          },
          {
            type: "qcm",
            enonce: "Le kart regarde vers la droite de l'écran. SpawnOffset vaut (-150, 0, 0). Où apparaît le piège ?",
            choix: [
              "150 cm vers le bas du monde",
              "150 cm vers la gauche de l'écran, derrière le kart",
              "Toujours 150 cm sur l'axe X négatif du niveau, quelle que soit la direction du kart",
              "Au centre du niveau",
            ],
            bonne: 1,
            explication:
              "TransformPosition applique la position et la rotation du kart : X négatif veut dire « derrière le kart ». Le piège ne tombe toujours du même côté du niveau que si on oublie cette conversion.",
          },
          {
            type: "code",
            enonce: "Le kart monte une pente : sa rotation est Pitch 15, Yaw 90, Roll 0. Quelle rotation reçoit l'acteur créé ?",
            code: "const FRotator SpawnRotation(0.f, Kart->GetActorRotation().Yaw, 0.f);",
            choix: [
              "Pitch 15, Yaw 90, Roll 0 : la même que le kart",
              "Pitch 0, Yaw 0, Roll 0",
              "Pitch 0, Yaw 90, Roll 0",
              "Pitch 15, Yaw 0, Roll 0",
            ],
            bonne: 2,
            explication:
              "Seul le Yaw (la direction) est gardé. L'acteur part à l'horizontale : un projectile qui copierait le Pitch de la pente partirait vers le ciel.",
          },
          {
            type: "code",
            enonce: "À quoi sert cette ligne ?",
            code: "SpawnParams.Owner = Kart;",
            choix: [
              "À faire suivre le kart par l'acteur",
              "À attacher l'acteur au kart comme un composant",
              "À retenir quel kart a lancé l'objet, pour que le danger puisse l'ignorer un instant",
              "À donner l'objet à un autre kart",
            ],
            bonne: 2,
            explication:
              "Owner ne déplace rien : c'est une information. AKartItemHazard la relit avec GetOwner() pour protéger le lanceur.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi choisir AlwaysSpawn comme SpawnCollisionHandlingOverride ?",
            choix: [
              "Pour que l'acteur soit créé même s'il touche déjà quelque chose (un mur, le kart) : sinon Unreal pourrait le déplacer ou refuser de le créer",
              "Pour que l'acteur apparaisse dans tous les niveaux",
              "Pour créer l'acteur à chaque image",
              "Pour que l'acteur ne puisse jamais être détruit",
            ],
            bonne: 0,
            explication:
              "Un piège posé contre un mur ou un projectile qui apparaît contre le kart touchent déjà quelque chose. AlwaysSpawn demande de le créer quand même, à la position demandée.",
          },
          {
            type: "code",
            enonce: "La création de l'acteur échoue et SpawnActor renvoie nullptr. Que devient l'objet du joueur ?",
            code: "const AActor* SpawnedActor = Kart->GetWorld()->SpawnActor<AActor>(ActorClass, SpawnLocation, SpawnRotation, SpawnParams);\nreturn SpawnedActor != nullptr;",
            choix: [
              "Il est consommé quand même",
              "Le jeu plante",
              "Il est remplacé par un autre objet tiré au hasard",
              "Il reste dans la poche : Activate renvoie false, donc aucune utilisation n'est retirée",
            ],
            bonne: 3,
            explication:
              "nullptr != nullptr est faux : Activate renvoie false. Le composant d'objet ne retire une utilisation que si Activate renvoie true.",
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
            enonce: "Pourquoi FindGround et les réglages sont-ils protected et pas private ?",
            choix: [
              "Pour que les Blueprints puissent les appeler",
              "Pour que la classe enfant AKartItemProjectile puisse s'en servir",
              "Parce que private n'existe pas dans un Actor",
              "Pour qu'ils soient visibles dans l'éditeur",
            ],
            bonne: 1,
            explication:
              "private est réservé à la classe elle-même. protected ouvre l'accès aux classes enfants : le projectile appelle FindGround à chaque image.",
          },
          {
            type: "qcm",
            enonce: "OnHitKart est un BlueprintImplementableEvent. Où est écrit ce qu'il fait (un son, une explosion) ?",
            choix: [
              "Dans KartItemHazard.cpp, juste après HandleBeginOverlap",
              "Dans KartPawn.cpp, avec SpinOut",
              "Dans le Blueprint (BP_ItemTrap par exemple) : le C++ se contente de l'appeler",
              "Nulle part : la fonction ne fait jamais rien",
            ],
            bonne: 2,
            explication:
              "Le C++ déclare l'event et l'appelle au bon moment. Le Blueprint écrit l'effet : le code n'a pas besoin de savoir à quoi il ressemble.",
          },
          {
            type: "vrai-faux",
            enonce: "Le piège vérifie à chaque image, dans son Tick, si un kart roule dessus.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le constructeur met bCanEverTick à false : le piège ne fait rien à chaque image. C'est l'event OnComponentBeginOverlap qui le prévient quand un kart entre dans la sphère.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on inversait l'ordre de ces deux lignes du constructeur ?",
            code: "CollisionSphere->SetCollisionResponseToAllChannels(ECR_Block);\nCollisionSphere->SetCollisionResponseToChannel(ECC_Pawn, ECR_Overlap);",
            choix: [
              "Rien : l'ordre ne compte pas",
              "Les murs ne bloqueraient plus le danger",
              "Le danger ne serait plus visible",
              "Le Block sur tous les canaux écraserait l'exception : les karts taperaient dans le danger comme dans un mur",
            ],
            bonne: 3,
            explication:
              "La dernière ligne exécutée l'emporte. On règle d'abord tout à Block, puis on fait l'exception Overlap pour les Pawns ; dans l'autre sens, l'exception serait effacée.",
          },
          {
            type: "qcm",
            enonce: "Le kart bloque les WorldDynamic, mais le danger répond Overlap au canal Pawn. Que se passe-t-il quand ils se rencontrent ?",
            choix: [
              "Un overlap : c'est la réponse la plus faible des deux qui gagne, le kart passe au travers et l'event se déclenche",
              "Un Block : c'est la réponse la plus forte qui gagne",
              "Ça dépend de qui roule le plus vite",
              "Rien du tout : les deux réponses s'annulent",
            ],
            bonne: 0,
            explication:
              "Entre deux objets, la réponse la plus faible l'emporte (Ignore < Overlap < Block). Overlap gagne sur Block : pas de choc, mais un event.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si le danger répondait Block au canal Visibility ?",
            choix: [
              "Rien de différent",
              "Le piège ne détecterait plus les karts",
              "Les rayons des roues du kart prendraient le piège pour du sol : le kart monterait dessus",
              "La caméra traverserait les murs",
            ],
            bonne: 2,
            explication:
              "Le kart cherche le sol avec des rayons sur le canal Visibility. Le danger l'ignore justement pour ne pas devenir une bosse.",
          },
          {
            type: "code",
            enonce: "Le piège est posé au-dessus du vide : il n'y a aucun sol dans les 10 mètres sous lui. Que se passe-t-il dans BeginPlay ?",
            code: "FHitResult GroundHit;\nif (FindGround(1000.f, GroundHit))\n{\n\tSetActorLocation(GroundHit.ImpactPoint + FVector::UpVector * HoverHeight);\n}",
            choix: [
              "Il reste là où il a été créé",
              "Il tombe avec la gravité",
              "Il est placé à HoverHeight au-dessus du point (0, 0, 0)",
              "Il est détruit",
            ],
            bonne: 0,
            explication:
              "FindGround renvoie false, donc SetActorLocation n'est pas appelée. Le danger n'a pas de gravité : il reste en l'air, à sa position de départ.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi FindGround ajoute-t-elle GetOwner() aux acteurs ignorés par le rayon ?",
            choix: [
              "Pour que le lanceur ne voie pas le piège",
              "Pour que le rayon ne touche pas le kart qui a lancé l'objet : sinon un piège posé juste derrière lui pourrait se poser sur le kart",
              "Pour que le lanceur ne puisse jamais être touché",
              "Parce que GetOwner() renvoie toujours le sol",
            ],
            bonne: 1,
            explication:
              "Le rayon descend depuis le danger. Si le kart lanceur est juste en dessous ou à côté, le rayon pourrait le prendre pour le sol. Ça ne protège pas le kart du tête-à-queue : c'est le rôle de OwnerSafeTime.",
          },
          {
            type: "vrai-faux",
            enonce: "Le kart qui pose un piège ne peut jamais se faire toucher par ce piège.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Il n'est protégé que tant que GetGameTimeSinceCreation() est inférieur à OwnerSafeTime (0,5 seconde). S'il recule dessus plus tard, il part en tête-à-queue.",
          },
          {
            type: "code",
            enonce: "Pourquoi n'écrit-on rien après Destroy dans HandleBeginOverlap ?",
            code: "Kart->SpinOut(SpinOutDuration);\nOnHitKart(Kart);\n\n// Le danger a servi : il disparaît\nDestroy();",
            choix: [
              "Parce que Destroy arrête le programme",
              "Parce que le compilateur l'interdit",
              "Parce que Destroy relance BeginPlay",
              "Parce que l'acteur est en train d'être détruit : il ne faut plus s'en servir",
            ],
            bonne: 3,
            explication:
              "Après Destroy, l'acteur est retiré du niveau. On évite de lire ses composants ou d'appeler ses fonctions ensuite. C'est aussi pour ça que OnHitKart est appelé avant.",
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
            type: "vrai-faux",
            enonce: "Un pointeur AKartItemHazard* peut pointer vers un AKartItemProjectile.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "AKartItemProjectile hérite publiquement de AKartItemHazard : un projectile EST un danger. Partout où le code attend un danger, on peut lui donner un projectile.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le constructeur du projectile remet-il bCanEverTick à vrai ?",
            choix: [
              "Parce que bCanEverTick est faux pour tous les acteurs",
              "Pour que BeginPlay soit appelé",
              "Parce que le constructeur du parent, appelé avant, l'a mis à faux",
              "Pour pouvoir rebondir sur les karts",
            ],
            bonne: 2,
            explication:
              "Un piège ne bouge pas, donc AKartItemHazard coupe le Tick. Le constructeur de l'enfant passe après et le rallume.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le projectile a-t-il un InitialLifeSpan de 10 secondes ?",
            choix: [
              "Pour qu'un projectile qui ne touche personne finisse par disparaître tout seul",
              "Pour qu'il accélère pendant 10 secondes",
              "Pour qu'il ne touche pas son lanceur",
              "Pour limiter le nombre de rebonds",
            ],
            bonne: 0,
            explication:
              "InitialLifeSpan est une variable de AActor : au bout de ce temps, l'acteur se détruit. Sans elle, un projectile perdu resterait dans le niveau jusqu'à la fin de la course.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on supprime Super::BeginPlay() dans le projectile, il touche quand même les karts.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "C'est le BeginPlay du parent qui abonne HandleBeginOverlap à l'event de la sphère (et pose le projectile au sol). Sans lui, aucun kart ne serait jamais touché.",
          },
          {
            type: "code",
            enonce: "Le projectile quitte un tremplin : FindGround ne trouve plus de sol. Que se passe-t-il sur les images suivantes ?",
            code: "if (FindGround(HoverHeight + GroundStickDistance, GroundHit))\n{\n\tVerticalSpeed = 0.f;\n\tSetActorLocation(GroundHit.ImpactPoint + FVector::UpVector * HoverHeight);\n\n\t// Dans une pente, on avance le long du sol (comme le kart dans MoveKart)\n\tDirection = FVector::VectorPlaneProject(MoveDirection, GroundHit.ImpactNormal).GetSafeNormal();\n}\nelse\n{\n\tVerticalSpeed -= GravityStrength * DeltaTime;\n}",
            choix: [
              "Il reste à la même hauteur et continue tout droit",
              "Il se détruit",
              "Il est replacé à HoverHeight au-dessus du sol le plus proche",
              "VerticalSpeed devient de plus en plus négative : il tombe de plus en plus vite, jusqu'à retrouver le sol",
            ],
            bonne: 3,
            explication:
              "Dans le else, la gravité retire GravityStrength × DeltaTime à chaque image. Dès que FindGround retrouve le sol, VerticalSpeed repasse à 0.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on remplaçait le true par false dans cette ligne ?",
            code: "AddActorWorldOffset(Delta, true, &Hit);",
            choix: [
              "Le projectile rebondirait deux fois plus",
              "Le projectile ne toucherait plus les karts",
              "Sans sweep, le projectile ne s'arrêterait plus contre ce qui le bloque : il traverserait les murs et ne rebondirait jamais",
              "Rien ne changerait",
            ],
            bonne: 2,
            explication:
              "Le true active le sweep : la sphère s'arrête au premier obstacle bloquant et remplit Hit. Sans lui, l'acteur est téléporté et Hit.bBlockingHit reste faux.",
          },
          {
            type: "code",
            enonce: "Le projectile touche une petite rampe dont la normale a un Z de 0,8. Que se passe-t-il ?",
            code: "static constexpr float ProjectileFloorZ = 0.7f;\n// ...\nif (Hit.Normal.Z >= ProjectileFloorZ)\n{\n\tAddActorWorldOffset(Delta * (1.f - Hit.Time), false);\n\treturn;\n}",
            choix: [
              "C'est un mur : il rebondit",
              "C'est un sol : il finit le trajet qui restait sans collision, sans perdre de rebond",
              "Il se détruit",
              "Il s'arrête contre la rampe jusqu'à l'image suivante",
            ],
            bonne: 1,
            explication:
              "0,8 ≥ 0,7 : la surface monte assez pour être un sol, comme avec WalkableFloorZ pour le kart. Le rebond ne concerne que les surfaces sous 0,7.",
          },
          {
            type: "code",
            enonce: "MaxBounces vaut 3. Au combientième mur le projectile disparaît-il ?",
            code: "if (BouncesLeft <= 0)\n{\n\tDestroy();\n\treturn;\n}\n--BouncesLeft;",
            choix: ["Au 3e", "Au 1er", "Jamais", "Au 4e"],
            bonne: 3,
            explication: "BouncesLeft part de MaxBounces. Les 3 premiers murs le font passer de 3 à 0. Au 4e, BouncesLeft vaut 0 : Destroy.",
          },
          {
            type: "qcm",
            enonce: "Le projectile va vers (0,7 ; 0,7 ; 0) et touche un mur de normale (-1 ; 0 ; 0). Quelle est sa nouvelle direction après MirrorByVector ?",
            choix: ["(-0,7 ; -0,7 ; 0)", "(-0,7 ; 0,7 ; 0)", "(0,7 ; -0,7 ; 0)", "(-1 ; 0 ; 0)"],
            bonne: 1,
            explication:
              "Seule la partie qui rentre dans le mur (le X) est inversée. La partie qui longe le mur (le Y) est gardée, comme une balle de billard.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi applique-t-on GetSafeNormal2D au résultat de MirrorByVector ?",
            choix: [
              "Pour retirer la hauteur et remettre la longueur à 1 : un mur un peu penché ne doit pas envoyer le projectile vers le ciel",
              "Pour inverser la direction",
              "Pour ralentir le projectile après le rebond",
              "Pour tourner le mesh dans la bonne direction",
            ],
            bonne: 0,
            explication:
              "Si la normale du mur a un peu de Z, le miroir donnerait une direction qui monte ou descend. MoveDirection doit rester horizontale ; c'est SetActorRotation, juste après, qui tourne l'acteur.",
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
            enonce: "Comment se partagent le travail UKartItemWidget (C++) et WBP_ItemSlot ?",
            choix: [
              "Le C++ dessine la case, le WBP contient la logique",
              "Ce sont deux widgets indépendants, affichés l'un sur l'autre",
              "Le WBP hérite de la classe C++ : le C++ contient la logique, le WBP l'apparence (où est l'image, quelle police)",
              "Le WBP remplace entièrement la classe C++",
            ],
            bonne: 2,
            explication:
              "Comme les autres widgets du module 4 : UKartItemWidget hérite de UUserWidget et gère les delegates, WBP_ItemSlot a pour classe parente KartItemWidget et s'occupe du visuel.",
          },
          {
            type: "qcm",
            enonce: "Dans quelle fonction le widget se désabonne-t-il des delegates avant de disparaître ?",
            choix: ["NativeConstruct", "NativeDestruct", "NativeTick", "Le destructeur C++ ~UKartItemWidget"],
            bonne: 1,
            explication:
              "NativeConstruct s'abonne, NativeDestruct se désabonne, NativeTick fait défiler la roulette. Le header déclare les trois.",
          },
          {
            type: "qcm",
            enonce: "Dans WBP_ItemSlot, l'image s'appelle « Icon » au lieu de « ItemIcon ». Que se passe-t-il ?",
            choix: [
              "Rien, Unreal trouve l'image tout seul",
              "L'icône s'affiche en double",
              "Le jeu plante au lancement seulement",
              "Le WBP refuse de compiler : BindWidget exige un widget nommé ItemIcon",
            ],
            bonne: 3,
            explication: "BindWidget relie la variable C++ au widget du même nom. S'il manque, le Widget Blueprint signale une erreur de compilation.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on retirait UFUNCTION() au-dessus de cette fonction ?",
            code: "UFUNCTION()\nvoid HandlePossessedPawnChanged(APawn* OldPawn, APawn* NewPawn);",
            choix: [
              "On ne pourrait plus la brancher sur le delegate dynamique OnPossessedPawnChanged avec AddDynamic",
              "Rien : UFUNCTION() sans paramètre ne sert à rien",
              "Elle deviendrait public",
              "Elle serait appelée à chaque image",
            ],
            bonne: 0,
            explication:
              "Un delegate dynamique retrouve la fonction par son nom grâce au système de réflexion d'Unreal. Sans UFUNCTION(), Unreal ne la connaît pas et le branchement échoue.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ItemComponent est-il un TWeakObjectPtr ?",
            choix: [
              "Parce qu'il est plus rapide",
              "Pour que le widget ne garde pas en vie un kart détruit : le pointeur devient nul tout seul",
              "Parce que UPROPERTY est interdit dans un widget",
              "Pour pouvoir le modifier depuis le Blueprint",
            ],
            bonne: 1,
            explication: "Un pointeur faible observe l'objet sans le retenir. On vérifie IsValid() avant de s'en servir.",
          },
          {
            type: "code",
            enonce: "Le widget lit cette variable pour savoir s'il doit animer quelque chose. Que veut dire RoulettePool == nullptr ?",
            code: "UPROPERTY()\nTObjectPtr<UKartItemPoolData> RoulettePool;",
            choix: [
              "Que la table d'objets du jeu est vide",
              "Qu'il y a une erreur dans le WBP",
              "Que le joueur n'a pas d'objet en main",
              "Qu'aucune roulette n'est en cours",
            ],
            bonne: 3,
            explication:
              "Tant que RoulettePool pointe sur une table, la roulette tourne. Le joueur peut très bien avoir un objet en main avec RoulettePool à nullptr : c'est le cas normal après la roulette.",
          },
          {
            type: "code",
            enonce: "Que faut-il écrire à la place du trou pour que la case apparaisse à l'écran ?",
            code: "if (ItemWidgetClass != nullptr)\n{\n\tItemWidget = CreateWidget<UKartItemWidget>(this, ItemWidgetClass);\n\tif (ItemWidget != nullptr)\n\t{\n\t\tItemWidget->____();\n\t}\n}",
            choix: ["NativeConstruct", "SetVisibility", "AddToViewport", "BeginPlay"],
            bonne: 2,
            explication:
              "CreateWidget fabrique le widget, AddToViewport le pose à l'écran. NativeConstruct est appelé par Unreal à ce moment-là : on ne l'appelle pas soi-même.",
          },
          {
            type: "vrai-faux",
            enonce: "Si ItemWidgetClass est vide dans BP_KartPlayerController, le jeu plante.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication: "Le bloc commence par if (ItemWidgetClass != nullptr) : sans classe choisie, il est simplement sauté et le jeu marche sans case d'objet.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le PlayerController garde-t-il le widget créé dans un UPROPERTY() ItemWidget ?",
            choix: [
              "Pour qu'il soit visible dans l'éditeur",
              "Pour que le ramasse-miettes d'Unreal ne l'efface pas",
              "Pour que le Blueprint puisse le remplacer",
              "Pour pouvoir en créer plusieurs",
            ],
            bonne: 1,
            explication:
              "Un pointeur marqué UPROPERTY() est connu du ramasse-miettes : tant que le PlayerController existe, le widget est gardé en vie.",
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
              "Parce que l'event ne prévient que des PROCHAINS changements : si le kart existe déjà, il faut s'y brancher maintenant",
              "Parce que OnPossessedPawnChanged n'existe pas sur un PlayerController",
              "Pour lancer la roulette",
            ],
            bonne: 1,
            explication:
              "Un delegate ne rejoue pas le passé. Le pawn actuel est donc traité à la main, les suivants par l'event. S'il n'y a pas encore de pawn, BindToPawn(nullptr) ne fait rien.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi NativeDestruct retire-t-il le widget de OnPossessedPawnChanged ?",
            choix: [
              "Parce que le PlayerController vit plus longtemps que le widget : sinon il appellerait un widget détruit",
              "Pour que le kart soit détruit en même temps",
              "Pour libérer de la mémoire dans le PlayerController",
              "Ce n'est pas utile, c'est juste une habitude",
            ],
            bonne: 0,
            explication:
              "Le delegate garde la liste des fonctions à appeler. Si le widget disparaît sans se retirer, le prochain changement de pawn viserait un objet qui n'existe plus.",
          },
          {
            type: "code",
            enonce: "Que fait cette ligne de NativeDestruct ?",
            code: "BindToPawn(nullptr);",
            choix: [
              "Elle détruit le kart du joueur",
              "Elle s'abonne au composant d'objet de nullptr",
              "Elle cache l'icône",
              "Elle se désabonne de l'ancien composant d'objet et ne s'abonne à rien",
            ],
            bonne: 3,
            explication:
              "BindToPawn commence toujours par se désabonner de l'ancien composant. Avec nullptr, ItemComponent devient nul et la fonction s'arrête : on réutilise son code au lieu de le recopier.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BindToPawn utilise-t-il FindComponentByClass<UKartItemComponent>() plutôt qu'un Cast vers AKartPawn ?",
            choix: [
              "Parce que Cast ne marche pas sur un pawn",
              "Parce que FindComponentByClass est plus rapide",
              "Parce que le widget n'a besoin que de la poche à objets : il marche avec n'importe quel pawn qui en a une, sans connaître le kart",
              "Parce que le kart n'a pas de composant d'objet",
            ],
            bonne: 2,
            explication:
              "Comme la boîte à bonus, le widget ne dépend que du composant. Un pawn sans composant d'objet donne nullptr, et BindToPawn s'arrête.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on retirait cette ligne, à la fin de BindToPawn ?",
            code: "HandleItemChanged(ItemComponent->GetCurrentItem(), ItemComponent->GetUsesLeft());",
            choix: [
              "La roulette ne tournerait plus",
              "Si le kart avait déjà un objet, la case resterait vide jusqu'au prochain changement d'objet",
              "Le widget ne serait plus abonné au composant",
              "Rien du tout",
            ],
            bonne: 1,
            explication:
              "Les delegates ne préviennent que des changements à venir. Appeler HandleItemChanged à la main affiche tout de suite l'état actuel.",
          },
          {
            type: "code",
            enonce: "Le joueur a un objet dont il reste 1 utilisation. Qu'affiche UsesText ?",
            code: "if (Item != nullptr && UsesLeft > 1)\n{\n\tUsesText->SetText(FText::Format(NSLOCTEXT(\"Kart\", \"ItemUses\", \"x{0}\"), FText::AsNumber(UsesLeft)));\n}\nelse\n{\n\tUsesText->SetText(FText::GetEmpty());\n}",
            choix: ["« x1 »", "« 1 »", "Rien : le texte est vide", "« x0 »"],
            bonne: 2,
            explication: "1 > 1 est faux : on passe dans le else. Le « x » ne s'affiche que pour un objet à plusieurs utilisations restantes.",
          },
          {
            type: "vrai-faux",
            enonce: "C'est le widget qui choisit l'objet que le joueur va recevoir.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le composant d'objet tire l'objet au début de la roulette. Le widget fait seulement défiler des icônes, puis affiche ce que OnItemChanged lui envoie.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi fait-on RouletteTimer -= RouletteIconInterval au lieu de RouletteTimer = 0 ?",
            choix: [
              "Pour que la roulette accélère",
              "Parce que 0 n'est pas un float",
              "Pour garder le temps en trop et avoir un rythme régulier, même si les images n'ont pas toutes la même durée",
              "Pour arrêter la roulette",
            ],
            bonne: 2,
            explication: "Si une image dépasse de 0,02 seconde, ce temps compte pour l'icône suivante au lieu d'être perdu.",
          },
          {
            type: "code",
            enonce: "La table contient 3 objets et RouletteIndex vaut 2. Que vaut-il après cette ligne ?",
            code: "RouletteIndex = (RouletteIndex + 1) % RoulettePool->Entries.Num();",
            choix: ["3", "1", "2", "0"],
            bonne: 3,
            explication:
              "(2 + 1) % 3 = 0 : le modulo fait revenir au début de la liste. C'est aussi pour ça que NativeTick sort quand la table est vide : un modulo par 0 serait une division par 0.",
          },
          {
            type: "qcm",
            enonce: "Quand il n'y a pas d'icône, ShowIcon met l'image en Hidden et pas en Collapsed. Pourquoi ?",
            choix: [
              "Hidden rend l'image invisible mais lui garde sa place : le cadre de la case ne bouge pas dans le HUD",
              "Collapsed détruit l'image",
              "Hidden laisse passer les clics de souris",
              "Collapsed n'existe pas pour une Image",
            ],
            bonne: 0,
            explication:
              "Collapsed retire aussi la place occupée, ce qui pourrait décaler la mise en page. Hidden cache seulement le dessin.",
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
    {
      slug: "mise-en-place",
      titre: "Mise en place dans l'éditeur",
      resume: "BP_ItemTrap, BP_ItemProjectile, leurs Data Assets SpawnActor, WBP_ItemSlot et le PlayerController, avec des captures",
      dureeMin: 20,
      fichiers: [],
      charger: () => import("./mise-en-place.mdx"),
      quiz: {
        id: "mario-kart/objets-attaque/mise-en-place",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi le disque du piège est-il descendu de 40 cm (Location Z = -40) ?",
            choix: [
              "Pour qu'il soit plus difficile à voir",
              "Parce que la sphère de collision flotte à 45 cm au-dessus du sol (HoverHeight) : le visuel doit descendre pour toucher la route",
              "Pour que le kart ne le touche pas",
              "Parce que le cylindre de base est trop haut",
            ],
            bonne: 1,
            explication: "Le C++ place le centre de l'acteur à HoverHeight au-dessus du sol. Le mesh, lui, est réglé dans le Blueprint pour être posé sur la route.",
          },
          {
            type: "vrai-faux",
            enonce: "DA_Item_Trap et DA_Item_Projectile utilisent la même classe C++.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication: "Les deux sont des KartItemData_SpawnActor. Seuls Actor Class et Spawn Offset changent.",
          },
          {
            type: "qcm",
            enonce: "Dans WBP_ItemSlot, tu as nommé l'image « Icon ». Que se passe-t-il ?",
            choix: [
              "Le jeu crée une image à la bonne place tout seul",
              "Rien, Unreal trouve l'image par son type",
              "Le Widget Blueprint refuse de compiler : BindWidget exige un élément nommé ItemIcon",
              "L'icône s'affiche, mais pas le texte",
            ],
            bonne: 2,
            explication: "BindWidget relie la variable C++ ItemIcon à l'élément du même nom. Sans lui, la compilation échoue.",
          },
          {
            type: "qcm",
            enonce: "Où règle-t-on la position de la case d'objet à l'écran ?",
            choix: [
              "Dans KartItemWidget.cpp",
              "Dans le Designer de WBP_ItemSlot",
              "Dans BP_Kart",
              "Dans DA_ItemPool_Default",
            ],
            bonne: 1,
            explication: "Le C++ décide de ce qui est affiché, le Widget Blueprint décide de la mise en page. Un graphiste peut tout déplacer sans recompiler.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/objets-attaque/mise-en-place/nouvel-objet",
          enonce:
            "Tu veux ajouter un « gros piège » : deux fois plus large et qui fait tourner le kart 3 secondes. Liste tout ce que tu crées ou modifies dans l'éditeur, dans l'ordre. As-tu besoin d'écrire du C++ ?",
          attendus:
            "Pas de C++. Un Blueprint BP_ItemBigTrap enfant de KartItemHazard (ou une copie de BP_ItemTrap) avec un mesh plus large, une sphère de collision plus grande (Sphere Radius) et SpinOutDuration = 3. Un Data Asset DA_Item_BigTrap de classe KartItemData_SpawnActor : nom, icône, Actor Class = BP_ItemBigTrap, Spawn Offset derrière le kart. Une ligne dans DA_ItemPool_Default avec un poids.",
        },
      ],
    },
  ],
  quizFinal: {
    id: "mario-kart/objets-attaque/final",
    questions: [
      {
        type: "qcm",
        enonce: "Quelle variable du kart dit s'il est en train de faire un tête-à-queue ?",
        choix: ["bIsSpinning", "SpinOutYaw", "SpinOutTimeRemaining, lue par IsSpinningOut", "bCanMove"],
        bonne: 2,
        explication: "IsSpinningOut renvoie SpinOutTimeRemaining > 0. Une seule variable à tenir à jour.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi UpdateVisuals n'utilise-t-elle plus l'angle du mesh pour le drift ?",
        choix: [
          "Parce que lire le mesh est interdit en C++",
          "Pour que la caméra tourne plus vite",
          "Parce que le mesh n'existe plus",
          "Parce que pendant un tête-à-queue le mesh tourne aussi : son angle mélangerait drift et tête-à-queue",
        ],
        bonne: 3,
        explication: "BodySlideYaw garde l'angle du drift seul. SpinOutYaw est ajouté seulement au moment d'appliquer la rotation.",
      },
      {
        type: "code",
        enonce: "Pendant un tête-à-queue, le joueur appuie sur la touche d'objet. Que se passe-t-il ?",
        code: "// Pas d'objet pendant le compte à rebours ni pendant un tête-à-queue\nif (bCanMove && !IsSpinningOut())\n{\n\t// Le kart ne sait pas utiliser les objets lui-même : il passe la main à son composant\n\tItemComponent->UseItem();\n}",
        choix: [
          "Rien : UseItem n'est pas appelée, l'objet reste dans la poche",
          "L'objet est utilisé normalement",
          "L'objet est perdu",
          "Le tête-à-queue s'arrête",
        ],
        bonne: 0,
        explication: "Comme le saut et le drift, l'utilisation d'objet est bloquée tant que IsSpinningOut renvoie vrai. Le composant n'est même pas prévenu.",
      },
      {
        type: "qcm",
        enonce: "Le piège et le projectile utilisent la même classe de Data Asset. Qu'est-ce qui les différencie ?",
        choix: [
          "Rien, ce sont les mêmes objets",
          "Leur ActorClass (BP_ItemTrap ou BP_ItemProjectile) et leur SpawnOffset (derrière ou devant)",
          "Le nombre de lignes de code de leur Data Asset",
          "Leur fonction Activate, réécrite pour chacun",
        ],
        bonne: 1,
        explication: "UKartItemData_SpawnActor fait toujours la même chose. Seules les données de chaque asset changent : (-150, 0, 0) pour le piège, (150, 0, 0) pour le projectile.",
      },
      {
        type: "code",
        enonce: "Ces deux lignes viennent de deux fichiers différents. Si on supprimait la première, que se passerait-il juste après un tir de projectile ?",
        code: "// KartItemData_SpawnActor.cpp\nSpawnParams.Owner = Kart;\n\n// KartItemHazard.cpp\nif (Kart == GetOwner() && GetGameTimeSinceCreation() < OwnerSafeTime)",
        choix: [
          "Le projectile ne toucherait plus aucun kart",
          "Le projectile ne serait pas créé",
          "Rien ne changerait",
          "GetOwner() renverrait nullptr : le lanceur ne serait plus protégé et pourrait être touché par son propre projectile dès son apparition",
        ],
        bonne: 3,
        explication:
          "La protection compare le kart touché à GetOwner(). Sans Owner, la comparaison est toujours fausse : plus de délai de grâce pour le lanceur.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre se passent les choses quand un projectile touche un kart ?",
        choix: [
          "Le kart détecte le projectile dans son Tick et appelle Destroy",
          "Le composant d'objet du kart touché retire un objet",
          "La sphère du projectile déclenche HandleBeginOverlap (hérité du danger), qui appelle SpinOut, OnHitKart puis Destroy",
          "Le GameMode compte le choc",
        ],
        bonne: 2,
        explication: "Tout part de l'overlap de la sphère. Le code est dans AKartItemHazard, le projectile en hérite sans rien réécrire.",
      },
      {
        type: "qcm",
        enonce: "Un Blueprint de piège a un SpinOutDuration de 2,5 secondes. Le kart touché a SpinOutTurns = 2. Que se passe-t-il ?",
        choix: [
          "Le kart tourne 2,5 secondes et fait 2,5 tours",
          "Le kart tourne 2,5 secondes et fait 2 tours : la durée vient du danger, le nombre de tours du kart",
          "Le kart tourne 1,5 seconde, la durée par défaut du kart",
          "Le kart fait 2 tours en 2 secondes",
        ],
        bonne: 1,
        explication:
          "Le danger passe sa durée à SpinOut, qui la range dans SpinOutTotalTime. SpinOutTurns est un réglage du kart : EaseOut va toujours de 0 à 1, donc on finit toujours à 2 tours, juste plus lentement.",
      },
      {
        type: "vrai-faux",
        enonce: "Un kart déjà en tête-à-queue est touché par un projectile : le projectile disparaît, et le tête-à-queue continue sans être rallongé.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication:
          "HandleBeginOverlap appelle SpinOut, qui sort tout de suite car IsSpinningOut est vrai. Puis Destroy est appelé quand même : le projectile est consommé.",
      },
      {
        type: "code",
        enonce: "Que se passerait-il si on retirait cette ligne du constructeur de AKartItemProjectile ?",
        code: "PrimaryActorTick.bCanEverTick = true;",
        choix: [
          "Le projectile ne toucherait plus les karts",
          "Le projectile ne serait plus posé au sol",
          "Le projectile tomberait sans s'arrêter",
          "Le parent a coupé le Tick : le projectile resterait immobile, comme un piège (il toucherait quand même les karts qui roulent dessus)",
        ],
        bonne: 3,
        explication:
          "Le constructeur de AKartItemHazard met bCanEverTick à false. Sans cette ligne, le Tick du projectile n'est jamais appelé ; mais la détection des karts, branchée dans le BeginPlay du parent, marche toujours.",
      },
      {
        type: "vrai-faux",
        enonce: "Pour que le projectile rebondisse sur les murs, il faut que sa sphère réponde Block aux objets du décor.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication: "Le sweep de AddActorWorldOffset ne s'arrête que sur ce qui bloque. Le constructeur du danger met Block sur tous les canaux ; sans ça, le projectile traverserait les murs.",
      },
      {
        type: "code",
        enonce: "Que fait cette ligne du projectile ?",
        code: "Direction = FVector::VectorPlaneProject(MoveDirection, GroundHit.ImpactNormal).GetSafeNormal();",
        choix: [
          "Elle fait rebondir le projectile",
          "Elle aplatit la direction sur le sol pour suivre la pente, puis remet sa longueur à 1",
          "Elle fait tomber le projectile",
          "Elle tourne le mesh",
        ],
        bonne: 1,
        explication: "C'est la même technique que dans MoveKart : avancer le long de la pente plutôt que de rentrer dedans. GroundHit vient de FindGround, héritée du danger.",
      },
      {
        type: "qcm",
        enonce: "Le joueur utilise un projectile, mais ActorClass est vide dans DA_Item_Projectile. Qu'affiche la case d'objet ?",
        choix: [
          "Toujours l'icône du projectile : Activate renvoie false, le composant ne change pas l'objet, donc OnItemChanged n'est pas diffusé",
          "Une case vide : l'objet a été consommé",
          "La roulette repart",
          "Le jeu plante",
        ],
        bonne: 0,
        explication:
          "Le composant sort dès que Activate renvoie false, avant SetItem. Sans changement d'objet, le widget ne reçoit rien et garde son affichage.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi le widget d'objet s'abonne-t-il à OnPossessedPawnChanged du PlayerController ?",
        choix: [
          "Pour savoir quand la course commence",
          "Pour afficher le nom du joueur",
          "Pour détruire le kart",
          "Parce que le widget peut être créé avant que le joueur ait son kart, ou le joueur peut changer de pawn",
        ],
        bonne: 3,
        explication: "Le PlayerController prévient le widget à chaque nouveau pawn : il se rebranche sur le bon composant d'objet avec BindToPawn.",
      },
      {
        type: "code",
        enonce: "Le PlayerController crée la case d'objet. À quel moment le widget s'abonne-t-il au composant d'objet du kart ?",
        code: "ItemWidget = CreateWidget<UKartItemWidget>(this, ItemWidgetClass);\nif (ItemWidget != nullptr)\n{\n\tItemWidget->AddToViewport();\n}",
        choix: [
          "Dans CreateWidget, avant même d'être affiché",
          "Jamais : c'est le PlayerController qui s'abonne à sa place",
          "Quand il est ajouté à l'écran : Unreal appelle NativeConstruct, qui appelle BindToPawn",
          "À la première image de NativeTick",
        ],
        bonne: 2,
        explication:
          "AddToViewport construit le widget : NativeConstruct s'abonne à OnPossessedPawnChanged et appelle BindToPawn avec le pawn actuel, qui s'abonne aux delegates du composant.",
      },
      {
        type: "vrai-faux",
        enonce: "Si on retire WBP_ItemSlot du PlayerController, les objets bonus ne marchent plus.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication: "Le widget ne fait qu'afficher. Le tirage, l'utilisation et les effets sont gérés par le composant et les Data Assets.",
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
