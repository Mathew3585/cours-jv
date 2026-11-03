import type { Module } from "@/contenu/types";

export const gameMode: Module = {
  slug: "game-mode",
  titre: "Game Mode",
  resume: "Les règles de la course : compte à rebours, départ, fin",
  intro:
    "Le GameMode est l'arbitre de la course : il bloque les karts, fait le compte à rebours « 3, 2, 1, GO », tient le chrono et sait combien de tours il faut faire. Il ne conduit rien lui-même : il prévient les autres avec des events et répond à leurs questions.",
  fichiers: ["KartGameMode.h", "KartGameMode.cpp"],
  lecons: [
    {
      slug: "role-du-game-mode",
      titre: "Le rôle du GameMode",
      resume: "Un arbitre unique : ses events, ses réglages et son démarrage",
      dureeMin: 25,
      fichiers: ["KartGameMode.h", "KartGameMode.cpp"],
      charger: () => import("./role-du-game-mode.mdx"),
      quiz: {
        id: "mario-kart/game-mode/role-du-game-mode",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi est-ce le GameMode, et pas chaque kart, qui fait le compte à rebours ?",
            choix: [
              "Parce qu'un Pawn n'a pas le droit d'utiliser de timer",
              "Pour qu'il n'y ait qu'un seul compte à rebours, le même pour tous les karts et pour l'interface",
              "Parce que le GameMode est plus rapide à compiler",
              "Parce que le kart n'a pas de fonction Tick",
            ],
            bonne: 1,
            explication:
              "Le GameMode est unique dans le niveau : un seul compte à rebours, un seul chrono. Les karts obéissent (SetCanMove) et l'interface écoute ses events.",
          },
          {
            type: "qcm",
            enonce: "Dans DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam, que signifie MULTICAST ?",
            choix: [
              "L'event peut être déclenché depuis plusieurs machines",
              "L'event envoie plusieurs paramètres",
              "Plusieurs abonnés peuvent écouter l'event en même temps",
              "L'event se répète automatiquement",
            ],
            bonne: 2,
            explication:
              "MULTICAST autorise plusieurs abonnés : le widget, un son, un Blueprint de décor peuvent tous écouter le même event. Le nombre de paramètres, lui, est donné par _OneParam.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on décoche bUseCountdown, IsRaceStarted() renvoie vrai dès le début, même si bRaceStarted n'a jamais été mis à vrai.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "IsRaceStarted renvoie bRaceStarted || !bUseCountdown. Si le compte à rebours est désactivé, !bUseCountdown est vrai, donc la fonction renvoie vrai quoi qu'il arrive.",
          },
          {
            type: "code",
            enonce: "Que faut-il écrire pour que GetLapCount promette de ne rien modifier dans le GameMode ?",
            code: "int32 GetLapCount() ____ { return LapCount; }",
            choix: ["static", "override", "virtual", "const"],
            bonne: 3,
            explication:
              "Le mot const après les parenthèses fait une fonction const : elle peut lire les variables mais le compilateur refuse qu'elle en modifie une.",
          },
          {
            type: "qcm",
            enonce: "À quoi sert le réglage StartDelay ?",
            choix: [
              "À laisser le temps au widget de s'abonner aux events avant le premier chiffre",
              "À ralentir le compte à rebours",
              "À retarder la fin de la course",
              "À choisir combien de secondes dure le GO",
            ],
            bonne: 0,
            explication:
              "Si le « 3 » était envoyé avant que le widget soit abonné, il serait perdu. StartDelay attend un peu avant le premier chiffre.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/game-mode/role-du-game-mode/pourquoi-arbitre",
          enonce:
            "Le GameMode prévient le widget avec des events (Broadcast) au lieu d'appeler directement une fonction du widget. Explique avec tes mots ce que ça change, et donne un exemple d'abonné qu'on pourrait ajouter sans modifier le GameMode.",
          attendus:
            "Le GameMode n'a pas besoin de connaître le widget : il déclenche l'event, et ceux qui sont abonnés réagissent. On peut ajouter ou retirer des abonnés sans toucher au GameMode, et il marche même s'il n'y a aucun widget. Exemples : un son de bip à chaque chiffre, un Blueprint qui allume des feux de départ, un écran de fin abonné à OnKartFinished.",
        },
      ],
    },
    {
      slug: "compte-a-rebours",
      titre: "Le compte à rebours et le départ",
      resume: "Une chaîne de timers : 3, 2, 1, GO, puis les karts sont débloqués",
      dureeMin: 25,
      fichiers: ["KartGameMode.cpp"],
      charger: () => import("./compte-a-rebours.mdx"),
      quiz: {
        id: "mario-kart/game-mode/compte-a-rebours",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi utiliser un timer plutôt qu'attendre une seconde à l'intérieur de la fonction ?",
            choix: [
              "Parce qu'une fonction qui attend bloquerait tout le jeu pendant l'attente",
              "Parce que les timers sont plus précis que l'horloge",
              "Parce que le GameMode n'a pas de Tick",
              "Parce qu'un timer s'arrête tout seul au GO",
            ],
            bonne: 0,
            explication:
              "Une fonction C++ qui attend fige tout le jeu. Le timer, c'est un minuteur : on le règle, le jeu continue, et Unreal appelle la fonction quand il sonne.",
          },
          {
            type: "code",
            enonce: "Quelle valeur faut-il pour que CountdownStep soit rappelée toutes les secondes ?",
            code: "GetWorldTimerManager().SetTimer(CountdownTimer, this, &AKartGameMode::CountdownStep, 1.f, ____);",
            choix: ["false", "0", "true", "1.f"],
            bonne: 2,
            explication:
              "Le dernier paramètre dit si le timer tourne en boucle. true : CountdownStep est appelée chaque seconde jusqu'au ClearTimer.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si on supprimait GetWorldTimerManager().ClearTimer(CountdownTimer) dans StartRace ?",
            choix: [
              "Rien, le timer s'arrête tout seul quand CountdownNumber vaut 0",
              "Le compte à rebours ne démarrerait jamais",
              "Les karts ne seraient jamais débloqués",
              "CountdownStep continuerait chaque seconde et relancerait StartRace à chaque fois",
            ],
            bonne: 3,
            explication:
              "Un timer en boucle ne s'arrête jamais seul. CountdownNumber passerait à -1 et la condition <= 0 rappellerait StartRace chaque seconde (nouveau GO, chrono remis à zéro).",
          },
          {
            type: "vrai-faux",
            enonce: "Appeler StartCountdown pendant une course replace les karts sur la ligne de départ.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "StartCountdown bloque les karts et appelle ResetRaceProgress, qui remet seulement les compteurs de tours à zéro. Aucune ligne ne déplace les karts.",
          },
          {
            type: "qcm",
            enonce: "Avec StartDelay = 1 et CountdownSeconds = 3, combien de temps après le début du niveau arrive le GO ?",
            choix: ["3 secondes", "4 secondes", "1 seconde", "5 secondes"],
            bonne: 1,
            explication:
              "1 s d'attente, puis « 3 » à 1 s, « 2 » à 2 s, « 1 » à 3 s, et le GO à 4 s, quand CountdownStep fait passer le chiffre à 0.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/game-mode/compte-a-rebours/clear-timer",
          enonce:
            "BeginCountdown et StartCountdown utilisent le même FTimerHandle (CountdownTimer). Explique ce que ça apporte, en pensant au cas où un joueur appelle StartCountdown alors qu'un compte à rebours est déjà en cours.",
          attendus:
            "Régler un timer avec un handle déjà utilisé remplace l'ancien timer. Le timer de StartDelay est remplacé par le timer en boucle, et une relance pendant un décompte remplace le décompte en cours au lieu d'en faire tourner deux en parallèle (chiffres en double, GO donné deux fois). Le handle permet aussi d'arrêter le timer avec ClearTimer au GO.",
        },
      ],
    },
    {
      slug: "chrono-et-arrivee",
      titre: "Le chrono et l'arrivée",
      resume: "Mesurer le temps par soustraction, bloquer le kart qui a fini, formater 01:23.500",
      dureeMin: 20,
      fichiers: ["KartGameMode.cpp"],
      charger: () => import("./chrono-et-arrivee.mdx"),
      quiz: {
        id: "mario-kart/game-mode/chrono-et-arrivee",
        questions: [
          {
            type: "qcm",
            enonce: "Comment GetRaceTime calcule-t-il le temps de course ?",
            choix: [
              "En ajoutant DeltaTime à une variable dans le Tick",
              "En comptant les appels de CountdownStep",
              "En soustrayant l'heure du GO à l'heure actuelle du jeu",
              "En demandant le temps à chaque kart",
            ],
            bonne: 2,
            explication:
              "GetWorld()->GetTimeSeconds() - RaceStartTime : une seule soustraction, sans erreur d'arrondi qui s'accumule, et rien à mettre à jour à chaque image.",
          },
          {
            type: "vrai-faux",
            enonce: "Quand le jeu est en pause, le chrono de la course continue d'avancer.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "GetTimeSeconds est du temps de jeu : il s'arrête pendant la pause. GetRealTimeSeconds, lui, continuerait de compter.",
          },
          {
            type: "qcm",
            enonce: "Que fait le GameMode quand un kart l'appelle avec NotifyKartFinished ?",
            choix: [
              "Il arrête le chrono pour tout le monde",
              "Il bloque ce kart avec SetCanMove(false) et diffuse OnKartFinished",
              "Il relance un compte à rebours",
              "Il remet le kart au tour 1",
            ],
            bonne: 1,
            explication:
              "Le kart qui a fini ne répond plus aux touches, et les abonnés sont prévenus. Le chrono général continue : chaque kart garde son propre temps d'arrivée.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi FormatRaceTime utilise-t-il FMath::Fmod et pas l'opérateur % ?",
            choix: [
              "Parce que % ne marche qu'avec des entiers et ferait perdre les millisecondes",
              "Parce que Fmod est plus rapide",
              "Parce que % arrondit au plus proche",
              "Parce que % n'existe pas en C++",
            ],
            bonne: 0,
            explication:
              "Fmod donne le reste d'une division de nombres à virgule : 83.5 Fmod 60 = 23.5. Avec des entiers, le 0.5 serait perdu.",
          },
          {
            type: "qcm",
            enonce: "Que renvoie FormatRaceTime(65.25f) ?",
            choix: ["\"1:5.25\"", "\"01:05.250\"", "\"65.250\"", "\"01:65.250\""],
            bonne: 1,
            explication:
              "65.25 / 60 donne 1 minute (arrondi vers le bas), le reste est 5.25 : 5 secondes et 250 millisecondes. %02d et %03d complètent avec des zéros.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/game-mode/chrono-et-arrivee/soustraction",
          enonce:
            "Un camarade propose de remplacer GetRaceTime par une variable RaceTime à laquelle on ajoute DeltaTime dans le Tick du GameMode. Donne deux raisons de garder la soustraction.",
          attendus:
            "Chaque addition de float ajoute une petite erreur d'arrondi qui s'accumule sur des milliers d'images, alors qu'une soustraction n'en fait qu'une. Il n'y a rien à mettre à jour à chaque image (le Tick du GameMode ne sert qu'au debug). Le calcul est fait seulement quand on demande le temps. Accepter aussi : moins de risque d'oublier de remettre la variable à zéro au redémarrage.",
        },
      ],
    },
    {
      slug: "parcourir-le-niveau",
      titre: "Parcourir le niveau : karts et checkpoints",
      resume: "TActorIterator pour bloquer tous les karts et compter les zones de tour au démarrage",
      dureeMin: 20,
      fichiers: ["KartGameMode.cpp"],
      charger: () => import("./parcourir-le-niveau.mdx"),
      quiz: {
        id: "mario-kart/game-mode/parcourir-le-niveau",
        questions: [
          {
            type: "qcm",
            enonce: "Que fait la boucle for (TActorIterator<AKartPawn> It(GetWorld()); It; ++It) ?",
            choix: [
              "Elle crée un nouveau kart à chaque tour de boucle",
              "Elle visite un par un tous les AKartPawn présents dans le niveau",
              "Elle visite seulement le kart du joueur",
              "Elle compte les images depuis le début du niveau",
            ],
            bonne: 1,
            explication:
              "TActorIterator fait l'appel de tous les acteurs du type donné dans le monde. It pointe sur l'acteur en cours, ++It passe au suivant.",
          },
          {
            type: "vrai-faux",
            enonce: "SetAllKartsCanMove est const, donc elle n'a pas le droit d'appeler SetCanMove sur les karts.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "const promet de ne pas modifier le GameMode lui-même. Les karts sont d'autres objets : on peut appeler leurs fonctions.",
          },
          {
            type: "qcm",
            enonce: "Un level designer pose une ligne d'arrivée (0) et des checkpoints numérotés 1, 2 et 5. Que se passe-t-il ?",
            choix: [
              "Le GameMode compte 3 checkpoints et tout marche",
              "Le GameMode affiche une erreur et arrête le jeu",
              "Le GameMode compte 5 checkpoints : le kart attendra un checkpoint 3 qui n'existe pas",
              "Le GameMode renumérote les zones automatiquement",
            ],
            bonne: 2,
            explication:
              "CountCheckpoints garde le plus grand numéro (FMath::Max). Avec un trou dans la numérotation, le kart attend un checkpoint absent et le tour n'est jamais validé.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi compter les checkpoints une seule fois, dans BeginPlay ?",
            choix: [
              "Parce que les zones sont posées dans le niveau et ne changent pas pendant la course",
              "Parce que TActorIterator ne marche que dans BeginPlay",
              "Parce que les karts n'existent pas encore après BeginPlay",
              "Parce qu'UE_LOG ne peut écrire qu'au démarrage",
            ],
            bonne: 0,
            explication:
              "Les zones ne bougent pas : refaire l'appel à chaque passage de ligne donnerait toujours le même résultat. On compte une fois et on garde le nombre dans CheckpointCount.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/game-mode/parcourir-le-niveau/beginplay",
          enonce:
            "CountCheckpoints affiche deux avertissements différents avec UE_LOG. Décris les deux situations et ce que le joueur pourrait faire de bizarre (ou ne pas pouvoir faire) dans chacune.",
          attendus:
            "Pas de zone avec ZoneIndex = 0 : il n'y a pas de ligne d'arrivée, les tours ne seront jamais comptés, la course ne finit jamais. Ligne d'arrivée mais aucun checkpoint (CheckpointCount = 0) : on peut valider des tours en faisant des allers-retours sur la ligne, sans faire le circuit. Les messages servent au level designer, dans l'Output Log, pas au joueur.",
        },
      ],
    },
    {
      slug: "texte-de-debug",
      titre: "Le texte de debug",
      resume: "Afficher compte à rebours, tours et chrono à l'écran avant d'avoir des widgets",
      dureeMin: 15,
      fichiers: ["KartGameMode.cpp"],
      charger: () => import("./texte-de-debug.mdx"),
      quiz: {
        id: "mario-kart/game-mode/texte-de-debug",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi le chrono de debug est-il affiché avec une durée de 0 ?",
            choix: [
              "Pour qu'il soit invisible",
              "Parce qu'il est réécrit à chaque Tick : il ne doit durer qu'une image pour que le temps se mette à jour",
              "Parce qu'une durée de 0 veut dire « pour toujours »",
              "Pour économiser de la mémoire",
            ],
            bonne: 1,
            explication:
              "ShowRaceDebugText est appelée à chaque Tick. Chaque message ne dure qu'une image et est aussitôt remplacé par le suivant, avec le temps à jour.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si ShowRaceDebugText utilisait la clé 100, comme le compte à rebours ?",
            choix: [
              "Rien, les deux messages s'afficheraient l'un sous l'autre",
              "Le jeu planterait",
              "Le chrono et le « GO! » se remplaceraient l'un l'autre au même emplacement",
              "Le chrono s'afficherait en rouge",
            ],
            bonne: 2,
            explication:
              "Un message avec la même clé remplace le précédent. Le chrono, réécrit à chaque image, effacerait le « GO! » tout de suite.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi utiliser Cast<AKartPawn> sur le résultat de GetPlayerPawn ?",
            choix: [
              "GetPlayerPawn renvoie un APawn quelconque : Cast vérifie que c'est bien un kart",
              "Pour copier le kart",
              "Pour rendre le kart const",
              "Pour créer le kart s'il n'existe pas",
            ],
            bonne: 0,
            explication:
              "Sans Cast, on ne pourrait pas appeler GetCurrentLap ou HasFinishedRace. Si le Pawn n'est pas un kart, Cast renvoie nullptr et la fonction s'arrête.",
          },
          {
            type: "vrai-faux",
            enonce: "Quand le kart a fini, le texte de debug affiche le chrono général du GameMode, qui continue d'avancer.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Après l'arrivée, le texte affiche « FINI ! » avec GetFinishTime, le temps retenu par le kart au passage de la ligne. Le chrono général n'est affiché que tant que le kart roule.",
          },
        ],
      },
    },
  ],
  carte: {
    fichier: "KartGameMode.cpp",
    lignes: 234,
    tranches: [
      { lecon: "role-du-game-mode", label: "Includes, constructeur, BeginPlay et Tick", debut: 1, fin: 46 },
      { lecon: "compte-a-rebours", label: "StartCountdown, BeginCountdown, CountdownStep, StartRace", debut: 47, fin: 110 },
      { lecon: "chrono-et-arrivee", label: "GetRaceTime, NotifyKartFinished, FormatRaceTime", debut: 111, fin: 153 },
      { lecon: "parcourir-le-niveau", label: "SetAllKartsCanMove et CountCheckpoints", debut: 154, fin: 191 },
      { lecon: "texte-de-debug", label: "ShowRaceDebugText et ShowDebugText", debut: 192, fin: 234 },
    ],
  },
  quizFinal: {
    id: "mario-kart/game-mode/final",
    questions: [
      {
        type: "qcm",
        enonce: "Quel est le rôle du GameMode dans ce jeu de kart ?",
        choix: [
          "Conduire le kart du joueur",
          "Afficher le compte à rebours dans un widget",
          "Porter les règles de la course : départ, chrono, nombre de tours",
          "Lire les touches du clavier",
        ],
        bonne: 2,
        explication:
          "Le GameMode est l'arbitre : il bloque et débloque les karts, fait le compte à rebours, tient le chrono et connaît le nombre de tours. L'affichage est le travail des widgets, la conduite celui du Pawn.",
      },
      {
        type: "qcm",
        enonce: "Un widget veut afficher « 3, 2, 1, GO ». Que doit-il faire ?",
        choix: [
          "S'abonner à OnCountdownTick",
          "Appeler CountdownStep chaque seconde",
          "Lire CountdownNumber dans son Tick avec un timer",
          "Appeler StartCountdown",
        ],
        bonne: 0,
        explication:
          "OnCountdownTick est BlueprintAssignable : le widget s'y abonne et reçoit 3, 2, 1 puis 0 pour le GO, à chaque Broadcast du GameMode.",
      },
      {
        type: "vrai-faux",
        enonce: "Si personne n'est abonné à OnRaceStarted, Broadcast provoque une erreur.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication:
          "Un Broadcast sans abonné ne fait simplement rien. C'est ce qui permet au GameMode de marcher avec ou sans widget.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre les fonctions du compte à rebours s'enchaînent-elles ?",
        choix: [
          "BeginCountdown, StartCountdown, StartRace, CountdownStep",
          "StartCountdown, BeginCountdown, CountdownStep (plusieurs fois), StartRace",
          "StartRace, CountdownStep, BeginCountdown, StartCountdown",
          "CountdownStep, StartCountdown, BeginCountdown, StartRace",
        ],
        bonne: 1,
        explication:
          "StartCountdown prépare et règle le timer de StartDelay, BeginCountdown affiche le premier chiffre et lance le timer en boucle, CountdownStep décompte, et StartRace donne le GO quand on arrive à 0.",
      },
      {
        type: "code",
        enonce: "Quelle ligne arrête le timer en boucle au GO ?",
        code: "void AKartGameMode::StartRace()\n{\n\t____\n\tCountdownNumber = 0;\n\tbRaceStarted = true;\n\tSetAllKartsCanMove(true);\n}",
        choix: [
          "CountdownTimer = 0;",
          "SetAllKartsCanMove(false);",
          "OnRaceStarted.Broadcast();",
          "GetWorldTimerManager().ClearTimer(CountdownTimer);",
        ],
        bonne: 3,
        explication:
          "ClearTimer avec le handle du timer l'arrête. Sans lui, CountdownStep continuerait chaque seconde.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi RaceStartTime utilise GetTimeSeconds et pas GetRealTimeSeconds ?",
        choix: [
          "Parce que GetRealTimeSeconds n'existe qu'en Blueprint",
          "Parce que GetTimeSeconds est en millisecondes",
          "Parce que GetRealTimeSeconds est plus lent",
          "Parce que le temps de jeu s'arrête pendant la pause, le chrono aussi",
        ],
        bonne: 3,
        explication:
          "GetTimeSeconds est le temps de jeu : il s'arrête en pause et suit les ralentis. Un chrono de course ne doit pas avancer quand le jeu est en pause.",
      },
      {
        type: "qcm",
        enonce: "Comment le GameMode trouve-t-il tous les karts pour les débloquer au GO ?",
        choix: [
          "Chaque kart s'inscrit dans un tableau du GameMode",
          "Avec TActorIterator<AKartPawn>, qui parcourt les karts présents dans le niveau",
          "Avec GetPlayerPawn pour chaque joueur",
          "Les karts lisent IsRaceStarted à chaque image",
        ],
        bonne: 1,
        explication:
          "SetAllKartsCanMove fait l'appel de tous les AKartPawn du monde avec TActorIterator et appelle SetCanMove sur chacun.",
      },
      {
        type: "vrai-faux",
        enonce: "CountCheckpoints est appelée avant le compte à rebours, dans BeginPlay.",
        choix: ["Vrai", "Faux"],
        bonne: 0,
        explication:
          "C'est la première chose que fait BeginPlay après Super::BeginPlay() : le nombre de checkpoints est connu avant que la course commence.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi FormatRaceTime est-elle static ?",
        choix: [
          "Pour qu'elle soit appelée automatiquement chaque seconde",
          "Parce qu'elle ne dépend d'aucune variable du GameMode : on l'appelle avec AKartGameMode::FormatRaceTime",
          "Pour qu'elle ne puisse pas être appelée en Blueprint",
          "Parce que toutes les fonctions qui renvoient un FText doivent être static",
        ],
        bonne: 1,
        explication:
          "Elle n'utilise que son paramètre Seconds. Le widget du chrono peut donc l'appeler sans avoir de GameMode sous la main.",
      },
      {
        type: "qcm",
        enonce: "Que se passe-t-il pour le chrono quand le premier kart passe la ligne de son dernier tour ?",
        choix: [
          "Le chrono général continue ; le kart garde son temps d'arrivée dans FinishTime",
          "Le chrono général s'arrête pour tous les karts",
          "Le chrono repart de zéro",
          "Le GameMode relance le compte à rebours",
        ],
        bonne: 0,
        explication:
          "NotifyKartFinished bloque ce kart et diffuse OnKartFinished, mais ne touche pas au chrono. Chaque kart retient son propre temps d'arrivée.",
      },
    ],
  },
  defi: {
    id: "mario-kart/game-mode/defi-feux-de-depart",
    titre: "Des feux de départ et un vrai redémarrage",
    consigne:
      "1) Crée un Blueprint « feux de départ » (trois lampes) qui s'abonne à OnCountdownTick du GameMode et allume une lampe rouge à chaque chiffre, puis toutes en vert à 0. 2) Ajoute dans AKartGameMode une fonction BlueprintCallable RestartRace qui replace chaque kart à sa position de départ avant d'appeler StartCountdown (indice : retiens la position de chaque kart dans BeginPlay, par exemple dans une TMap, et utilise SetActorLocationAndRotation). Branche-la sur une touche pour tester. Dépose un lien vers une capture ou une vidéo une fois fait.",
  },
};
