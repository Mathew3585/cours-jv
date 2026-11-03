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
              "Le GameMode est unique dans le niveau : un seul compte à rebours, un seul chrono. Les karts obéissent (SetCanMove) et l'interface écoute ses events. Avec un décompte par kart, ils ne partiraient pas forcément à la même image.",
          },
          {
            type: "code",
            enonce: "Que crée exactement cette ligne du header ?",
            code: "DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCountdownTick, int32, Number);",
            choix: [
              "L'event OnCountdownTick auquel le widget s'abonne",
              "Une variable int32 nommée Number dans le GameMode",
              "Un nouveau type d'event, FOnCountdownTick, qui envoie un int32 : l'event réel est la variable déclarée plus bas avec ce type",
              "Une fonction appelée automatiquement chaque seconde",
            ],
            bonne: 2,
            explication:
              "DECLARE crée un type, comme on déclare une struct : c'est le modèle de l'event (son nom et ce qu'il envoie). L'event lui-même est la variable FOnCountdownTick OnCountdownTick, déclarée dans la partie public.",
          },
          {
            type: "qcm",
            enonce: "Dans DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam, que signifie MULTICAST ?",
            choix: [
              "L'event peut être déclenché depuis plusieurs machines",
              "L'event envoie plusieurs paramètres",
              "L'event se répète automatiquement",
              "Plusieurs abonnés peuvent écouter l'event en même temps",
            ],
            bonne: 3,
            explication:
              "MULTICAST autorise plusieurs abonnés : le widget, un son, un Blueprint de décor peuvent tous écouter le même event. Le nombre de paramètres, lui, est donné par _OneParam, et DYNAMIC le rend utilisable en Blueprint.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi les trois events du GameMode sont-ils marqués UPROPERTY(BlueprintAssignable) ?",
            choix: [
              "Pour qu'un widget ou un Blueprint puisse s'y abonner",
              "Pour qu'un Blueprint puisse les déclencher à la place du GameMode",
              "Pour qu'on puisse changer leur valeur dans l'éditeur",
              "Pour qu'ils soient sauvegardés avec le niveau",
            ],
            bonne: 0,
            explication:
              "BlueprintAssignable permet de « s'assigner » à l'event, c'est-à-dire de s'y abonner depuis un Widget ou un Blueprint. C'est ce que fera le widget du compte à rebours avec OnCountdownTick.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on décoche bUseCountdown, IsRaceStarted() renvoie vrai dès le début, même si bRaceStarted n'a jamais été mis à vrai.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 0,
            explication:
              "IsRaceStarted renvoie bRaceStarted || !bUseCountdown. Si le compte à rebours est désactivé, !bUseCountdown est vrai, donc la fonction renvoie vrai quoi qu'il arrive.",
          },
          {
            type: "code",
            enonce: "Que faut-il écrire pour que GetLapCount promette de ne rien modifier dans le GameMode ?",
            code: "int32 GetLapCount() ____ { return LapCount; }",
            choix: [
              "static",
              "override",
              "const",
              "virtual",
            ],
            bonne: 2,
            explication:
              "Le mot const après les parenthèses fait une fonction const : elle peut lire les variables mais le compilateur refuse qu'elle en modifie une. static, lui, voudrait dire « sans GameMode précis », et la fonction ne pourrait plus lire LapCount.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi StartCountdown est-elle BlueprintCallable, alors que IsRaceStarted est BlueprintPure ?",
            choix: [
              "Parce que StartCountdown est plus longue à écrire",
              "Parce que BlueprintPure est réservé aux fonctions qui renvoient un bool",
              "Parce que StartCountdown n'est appelée que par le moteur",
              "Parce que StartCountdown agit (elle relance le décompte et bloque les karts), alors que IsRaceStarted ne fait que lire",
            ],
            bonne: 3,
            explication:
              "BlueprintPure est pour les fonctions qui lisent sans rien changer. StartCountdown modifie l'état de la course : elle doit être un nœud d'action, qu'un bouton « Recommencer » pourrait appeler.",
          },
          {
            type: "vrai-faux",
            enonce: "Un Blueprint peut appeler NotifyKartFinished pour déclarer qu'un kart a fini.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "NotifyKartFinished est publique mais n'a pas de UFUNCTION : Unreal ne la montre pas aux Blueprints. Seul le code C++ du kart l'appelle.",
          },
          {
            type: "qcm",
            enonce: "À quoi sert le réglage StartDelay ?",
            choix: [
              "À ralentir le compte à rebours",
              "À laisser le temps au niveau de charger et au widget de s'abonner aux events avant le premier chiffre",
              "À retarder la fin de la course",
              "À choisir combien de secondes dure le GO",
            ],
            bonne: 1,
            explication:
              "Si le « 3 » était envoyé avant que le widget soit abonné, il serait perdu. StartDelay attend un peu avant le premier chiffre. La durée du GO, c'est GoMessageDuration.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on supprimait cette ligne du constructeur du GameMode ?",
            code: "PrimaryActorTick.bCanEverTick = true;",
            choix: [
              "Le compte à rebours ne démarrerait plus",
              "Les karts ne seraient jamais débloqués",
              "Le Tick du GameMode ne serait jamais appelé : le chrono de debug ne s'afficherait plus, mais la course marcherait",
              "BeginPlay ne serait plus appelé",
            ],
            bonne: 2,
            explication:
              "Sans bCanEverTick, Unreal n'appelle jamais le Tick. Or ce Tick ne sert qu'à ShowRaceDebugText : le compte à rebours passe par des timers et des events, pas par le Tick.",
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
              "Parce que les timers sont plus précis que l'horloge",
              "Parce qu'une fonction qui attend bloquerait tout le jeu pendant l'attente",
              "Parce que le GameMode n'a pas de Tick",
              "Parce qu'un timer s'arrête tout seul au GO",
            ],
            bonne: 1,
            explication:
              "Une fonction C++ qui attend fige tout le jeu : plus d'image, plus de son. Le timer, c'est un minuteur : on le règle, le jeu continue, et Unreal appelle la fonction quand il sonne.",
          },
          {
            type: "qcm",
            enonce: "Dans quel ordre les fonctions du compte à rebours s'enchaînent-elles ?",
            choix: [
              "StartCountdown, BeginCountdown, CountdownStep (plusieurs fois), StartRace",
              "BeginCountdown, StartCountdown, StartRace, CountdownStep",
              "StartCountdown, CountdownStep (plusieurs fois), BeginCountdown, StartRace",
              "BeginCountdown, CountdownStep, StartCountdown, StartRace",
            ],
            bonne: 0,
            explication:
              "StartCountdown prépare la grille et règle le timer de StartDelay, BeginCountdown affiche le premier chiffre et lance le timer en boucle, CountdownStep décompte chaque seconde, et StartRace donne le GO.",
          },
          {
            type: "code",
            enonce: "Dans cette ligne de StartCountdown, que représente &AKartGameMode::BeginCountdown ?",
            code: "GetWorldTimerManager().SetTimer(CountdownTimer, this, &AKartGameMode::BeginCountdown, StartDelay, false);",
            choix: [
              "Un appel immédiat à BeginCountdown, dont le résultat est donné au timer",
              "Une copie de la fonction BeginCountdown",
              "La variable qui retient le chiffre du compte à rebours",
              "La fonction que le timer devra appeler plus tard, désignée sans l'appeler maintenant",
            ],
            bonne: 3,
            explication:
              "Il n'y a pas de parenthèses après BeginCountdown : on ne l'appelle pas, on donne son adresse au timer. Unreal l'appellera sur this quand les StartDelay secondes seront passées, une seule fois (false).",
          },
          {
            type: "qcm",
            enonce: "Un designer règle StartDelay à 0. Que fait StartCountdown ?",
            choix: [
              "Elle règle un timer de 0 seconde qui ne sonne jamais",
              "Elle appelle BeginCountdown tout de suite, sans timer",
              "Elle saute le compte à rebours et lance la course",
              "Le moteur refuse la valeur 0 grâce à ClampMin",
            ],
            bonne: 1,
            explication:
              "Le test if (StartDelay > 0.f) est faux, donc la branche else appelle BeginCountdown directement : le « 3 » s'affiche dès le lancement. ClampMin = \"0\" autorise bien la valeur 0.",
          },
          {
            type: "code",
            enonce: "Quelle valeur faut-il pour que CountdownStep soit rappelée toutes les secondes ?",
            code: "GetWorldTimerManager().SetTimer(CountdownTimer, this, &AKartGameMode::CountdownStep, 1.f, ____);",
            choix: [
              "false",
              "0",
              "1.f",
              "true",
            ],
            bonne: 3,
            explication:
              "Le dernier paramètre dit si le timer tourne en boucle. true : CountdownStep est appelée chaque seconde jusqu'au ClearTimer. Avec false, on n'aurait que le « 2 ».",
          },
          {
            type: "vrai-faux",
            enonce: "Quand BeginCountdown règle son timer en boucle, deux timers tournent en même temps sur CountdownTimer : celui de StartDelay et le nouveau.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Régler un timer avec un handle déjà utilisé remplace l'ancien. Le même ticket CountdownTimer sert aux deux : il n'y a jamais qu'un seul timer de compte à rebours.",
          },
          {
            type: "qcm",
            enonce: "Avec CountdownSeconds = 3, quelles valeurs un abonné à OnCountdownTick reçoit-il, dans l'ordre ?",
            choix: [
              "3, 2, 1",
              "2, 1, 0",
              "3, 2, 1, 0",
              "0, 1, 2, 3",
            ],
            bonne: 2,
            explication:
              "BeginCountdown envoie 3, CountdownStep envoie 2 puis 1, et quand le chiffre arrive à 0, CountdownStep appelle StartRace, qui fait OnCountdownTick.Broadcast(0) pour le GO.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si on supprimait GetWorldTimerManager().ClearTimer(CountdownTimer) dans StartRace ?",
            choix: [
              "Rien, le timer s'arrête tout seul quand CountdownNumber vaut 0",
              "CountdownStep continuerait chaque seconde et relancerait StartRace à chaque fois",
              "Le compte à rebours ne démarrerait jamais",
              "Les karts ne seraient jamais débloqués",
            ],
            bonne: 1,
            explication:
              "Un timer en boucle ne s'arrête jamais seul. CountdownNumber passerait à -1, la condition <= 0 rappellerait StartRace chaque seconde : nouveau « GO! » et chrono remis à zéro.",
          },
          {
            type: "qcm",
            enonce: "Avec StartDelay = 0.5 et CountdownSeconds = 3, combien de temps après le début du niveau arrive le GO ?",
            choix: [
              "3 secondes",
              "3,5 secondes",
              "4 secondes",
              "0,5 seconde",
            ],
            bonne: 1,
            explication:
              "0,5 s d'attente, puis « 3 » à 0,5 s, « 2 » à 1,5 s, « 1 » à 2,5 s, et le GO à 3,5 s, quand CountdownStep fait passer le chiffre à 0. Le GO arrive après StartDelay plus les trois chiffres.",
          },
          {
            type: "vrai-faux",
            enonce: "Appeler StartCountdown pendant une course replace les karts sur la ligne de départ.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "StartCountdown bloque les karts et appelle ResetRaceProgress, qui remet seulement les compteurs de tours à zéro. Aucune ligne ne déplace les karts.",
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
              "En soustrayant l'heure du GO à l'heure actuelle du jeu",
              "En comptant les appels de CountdownStep",
              "En demandant le temps à chaque kart",
            ],
            bonne: 1,
            explication:
              "GetWorld()->GetTimeSeconds() - RaceStartTime : une seule soustraction, sans erreur d'arrondi qui s'accumule, et rien à mettre à jour à chaque image.",
          },
          {
            type: "code",
            enonce: "Dans le .cpp, que faut-il écrire après les parenthèses de GetRaceTime ?",
            code: "float AKartGameMode::GetRaceTime() ____\n{",
            choix: [
              "Rien : const n'est écrit que dans le header",
              "static",
              "const",
              "override",
            ],
            bonne: 2,
            explication:
              "Le const fait partie de la signature : il faut le recopier dans le .cpp, sinon le compilateur ne reconnaît pas la fonction déclarée. C'est l'inverse de static, qui ne se répète pas dans le .cpp (FormatRaceTime).",
          },
          {
            type: "vrai-faux",
            enonce: "Quand le jeu est en pause, le chrono de la course continue d'avancer.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "GetTimeSeconds est du temps de jeu : il s'arrête pendant la pause. GetRealTimeSeconds, lui, continuerait de compter.",
          },
          {
            type: "qcm",
            enonce: "Que fait le GameMode quand un kart l'appelle avec NotifyKartFinished ?",
            choix: [
              "Il arrête le chrono pour tout le monde",
              "Il relance un compte à rebours",
              "Il bloque ce kart avec SetCanMove(false) et diffuse OnKartFinished",
              "Il remet le kart au tour 1",
            ],
            bonne: 2,
            explication:
              "Le kart qui a fini ne répond plus aux touches et ralentit jusqu'à l'arrêt, et les abonnés sont prévenus. Le chrono général n'est pas touché.",
          },
          {
            type: "qcm",
            enonce: "Deux karts sont en course. Le premier passe la ligne de son dernier tour. Où est retenu son temps ?",
            choix: [
              "Dans RaceStartTime, que le GameMode met à jour",
              "Nulle part : il faut le lire tout de suite avec GetRaceTime",
              "Dans le chrono général, qui s'arrête",
              "Dans FinishTime, la variable du kart, pendant que le chrono général continue pour l'autre kart",
            ],
            bonne: 3,
            explication:
              "Le GameMode n'arrête pas le chrono : le second kart roule encore. Chaque kart garde son propre temps d'arrivée dans FinishTime, noté au passage de la ligne.",
          },
          {
            type: "vrai-faux",
            enonce: "NotifyKartFinished vérifie que Kart n'est pas nullptr avant d'appeler SetCanMove.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Il n'y a aucun test : la fonction appelle directement Kart->SetCanMove(false). C'est sans risque ici car c'est toujours le kart qui s'envoie lui-même (this), mais un test serait plus prudent si une autre classe l'appelait.",
          },
          {
            type: "code",
            enonce: "Que renvoie FormatRaceTime(-2.f) ?",
            code: "Seconds = FMath::Max(Seconds, 0.f);",
            choix: [
              "\"-00:02.000\"",
              "\"00:00.000\"",
              "\"00:02.000\"",
              "Une erreur",
            ],
            bonne: 1,
            explication:
              "FMath::Max garde la plus grande des deux valeurs : entre -2 et 0, c'est 0. Un temps négatif n'a pas de sens, il est ramené à 0 avant tout calcul.",
          },
          {
            type: "code",
            enonce: "On remplace FloorToInt par RoundToInt (arrondi au plus proche). Que deviendrait l'affichage de 100 secondes ?",
            code: "const int32 Minutes = FMath::FloorToInt(Seconds / 60.f);",
            choix: [
              "\"01:40.000\"",
              "\"02:00.000\"",
              "\"02:40.000\"",
              "\"01:67.000\"",
            ],
            bonne: 2,
            explication:
              "100 / 60 = 1.67 : RoundToInt donnerait 2 minutes, alors que la 2e n'est pas finie. Les secondes (Fmod donne 40) ne changent pas, d'où un faux « 02:40.000 ». FloorToInt donne bien 1 minute : « 01:40.000 ».",
          },
          {
            type: "qcm",
            enonce: "Pourquoi FormatRaceTime utilise-t-il FMath::Fmod et pas l'opérateur % ?",
            choix: [
              "Parce que Fmod est plus rapide",
              "Parce que % arrondit au plus proche",
              "Parce que % n'existe pas en C++",
              "Parce que % ne marche qu'avec des entiers et ferait perdre les millisecondes",
            ],
            bonne: 3,
            explication:
              "Fmod donne le reste d'une division de nombres à virgule : 83.5 Fmod 60 = 23.5. Avec des entiers, le 0.5 serait perdu.",
          },
          {
            type: "qcm",
            enonce: "Que renvoie FormatRaceTime(65.25f) ?",
            choix: [
              "\"1:5.25\"",
              "\"01:65.250\"",
              "\"65.250\"",
              "\"01:05.250\"",
            ],
            bonne: 3,
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
              "Elle visite un par un tous les AKartPawn présents dans le niveau",
              "Elle crée un nouveau kart à chaque tour de boucle",
              "Elle visite seulement le kart du joueur",
              "Elle compte les images depuis le début du niveau",
            ],
            bonne: 0,
            explication:
              "TActorIterator fait l'appel de tous les acteurs du type donné dans le monde. La condition It reste vraie tant qu'il reste un acteur, ++It passe au suivant, et It-> s'utilise comme un pointeur.",
          },
          {
            type: "code",
            enonce: "Il y a 4 karts dans le niveau. Combien de fois SetCanMove est-elle appelée par cette boucle ?",
            code: "for (TActorIterator<AKartPawn> It(GetWorld()); It; ++It)\n{\n\tIt->SetCanMove(bCanMove);\n}",
            choix: [
              "1 fois, pour le kart du joueur",
              "3 fois",
              "4 fois, une par kart",
              "Autant de fois qu'il y a d'images",
            ],
            bonne: 2,
            explication:
              "La boucle passe une fois sur chaque AKartPawn du monde. C'est pour ça qu'un seul SetAllKartsCanMove(true) dans StartRace débloque tous les karts à la même image, qu'il y en ait un ou huit.",
          },
          {
            type: "vrai-faux",
            enonce: "SetAllKartsCanMove est const, donc elle n'a pas le droit d'appeler SetCanMove sur les karts.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "const promet de ne pas modifier le GameMode lui-même. Les karts sont d'autres objets : on peut appeler leurs fonctions.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi CountCheckpoints n'est-elle pas const, contrairement à SetAllKartsCanMove ?",
            choix: [
              "Parce qu'elle utilise TActorIterator",
              "Parce qu'elle écrit dans UE_LOG",
              "Parce qu'elle est appelée dans BeginPlay",
              "Parce qu'elle modifie CheckpointCount, une variable du GameMode",
            ],
            bonne: 3,
            explication:
              "Une fonction const n'a pas le droit de changer les variables de son propre objet. CountCheckpoints remplit CheckpointCount : le compilateur refuserait le const. SetAllKartsCanMove, elle, ne change que les karts.",
          },
          {
            type: "code",
            enonce: "La boucle rencontre les zones dans cet ordre : 2, 0, 3, 1. Que vaut CheckpointCount à la fin ?",
            code: "CheckpointCount = FMath::Max(CheckpointCount, ZoneIndex);",
            choix: [
              "1, le numéro de la dernière zone vue",
              "3",
              "4, le nombre de zones",
              "0, car la ligne d'arrivée remet à zéro",
            ],
            bonne: 1,
            explication:
              "Max garde le plus grand numéro vu jusqu'ici : 2, puis 2, puis 3, puis 3. L'ordre de visite n'a pas d'importance, pas besoin de trier. La ligne d'arrivée (0) n'est pas comptée comme checkpoint.",
          },
          {
            type: "qcm",
            enonce: "Un level designer pose une ligne d'arrivée (0) et des checkpoints numérotés 1, 2 et 5. Que se passe-t-il ?",
            choix: [
              "Le GameMode compte 3 checkpoints et tout marche",
              "Le GameMode compte 5 checkpoints : le kart attendra un checkpoint 3 qui n'existe pas",
              "Le GameMode affiche une erreur et arrête le jeu",
              "Le GameMode renumérote les zones automatiquement",
            ],
            bonne: 1,
            explication:
              "CountCheckpoints garde le plus grand numéro (FMath::Max). Avec un trou dans la numérotation, le kart attend un checkpoint absent et le tour n'est jamais validé. Aucun avertissement ne le signale.",
          },
          {
            type: "vrai-faux",
            enonce: "Si le niveau ne contient aucune ALapZone, les deux avertissements de CountCheckpoints s'affichent dans l'Output Log.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Le second test est un else if : il n'est vérifié que s'il y a une ligne d'arrivée. Sans aucune zone, bHasFinishLine est faux, et seul le premier avertissement (pas de ligne d'arrivée) s'écrit.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi compter les checkpoints une seule fois, dans BeginPlay ?",
            choix: [
              "Parce que TActorIterator ne marche que dans BeginPlay",
              "Parce que les karts n'existent pas encore après BeginPlay",
              "Parce que les zones sont posées dans le niveau et ne changent pas pendant la course",
              "Parce qu'UE_LOG ne peut écrire qu'au démarrage",
            ],
            bonne: 2,
            explication:
              "Les zones ne bougent pas : refaire l'appel à chaque passage de ligne donnerait toujours le même résultat. On compte une fois, avant le compte à rebours, et on garde le nombre dans CheckpointCount.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi évite-t-on d'utiliser TActorIterator (ou Get All Actors Of Class) à chaque image ?",
            choix: [
              "Parce qu'il parcourt tout le niveau à chaque fois : c'est du travail répété pour rien",
              "Parce qu'il crée une copie de chaque acteur",
              "Parce qu'il ne trouve pas les acteurs qui bougent",
              "Parce qu'il est interdit dans un Tick",
            ],
            bonne: 0,
            explication:
              "C'est rapide pour quelques dizaines d'acteurs, mais refaire tout l'appel à chaque image gaspille du temps. Ici on ne l'utilise qu'au démarrage, au GO et quand un compte à rebours commence.",
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
            enonce: "Pendant le « 3, 2, 1 », qu'affiche ShowRaceDebugText ?",
            choix: [
              "Le chrono bloqué à 00:00.000",
              "« Tour 1/3 » sans chrono",
              "Rien : elle sort tout de suite tant que la course n'est pas lancée",
              "Le chiffre du compte à rebours",
            ],
            bonne: 2,
            explication:
              "Le premier test est if (GEngine == nullptr || !IsRaceStarted()) return; : avant le GO, il n'y a pas de chrono à afficher. Les chiffres, eux, passent par ShowDebugText.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi utiliser Cast<AKartPawn> sur le résultat de GetPlayerPawn ?",
            choix: [
              "Pour copier le kart",
              "GetPlayerPawn renvoie un APawn quelconque : Cast vérifie que c'est bien un kart",
              "Pour rendre le kart const",
              "Pour créer le kart s'il n'existe pas",
            ],
            bonne: 1,
            explication:
              "Sans Cast, on ne pourrait pas appeler GetCurrentLap ou HasFinishedRace. Si le Pawn n'est pas un kart, Cast renvoie nullptr et la fonction s'arrête.",
          },
          {
            type: "vrai-faux",
            enonce: "Quand le kart a fini, le texte de debug affiche le chrono général du GameMode, qui continue d'avancer.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "Après l'arrivée, le texte affiche « FINI ! » avec GetFinishTime, le temps retenu par le kart au passage de la ligne. Le chrono général n'est affiché que tant que le kart roule.",
          },
          {
            type: "code",
            enonce: "À quoi sert l'étoile * devant FormatRaceTime(...).ToString() ?",
            code: "Text = FString::Printf(TEXT(\"FINI !   %s\"), *FormatRaceTime(Kart->GetFinishTime()).ToString());",
            choix: [
              "Elle donne le texte brut que %s attend dans Printf",
              "Elle multiplie le temps",
              "Elle copie le FText dans un nouveau FText",
              "Elle vérifie que le texte n'est pas vide",
            ],
            bonne: 0,
            explication:
              "FormatRaceTime renvoie un FText, ToString() le transforme en FString, et l'étoile devant un FString donne le texte brut que %s attend. Sans elle, Printf ne saurait pas lire le FString.",
          },
          {
            type: "code",
            enonce: "Le kart est au tour 2, LapCount vaut 3 et GetRaceTime() renvoie 65.25. Quel texte est construit ?",
            code: "Text = FString::Printf(TEXT(\"Tour %d/%d   %s\"), Kart->GetCurrentLap(), LapCount, *FormatRaceTime(GetRaceTime()).ToString());",
            choix: [
              "\"Tour 3/2   01:05.250\"",
              "\"Tour 2/3   65.25\"",
              "\"Tour 2/3   01:05.250\"",
              "\"Tour %d/%d   01:05.250\"",
            ],
            bonne: 2,
            explication:
              "Printf remplace chaque %d puis %s dans l'ordre des paramètres : d'abord le tour du kart (2), puis le total du GameMode (3), puis le temps formaté par FormatRaceTime.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le chrono de debug est-il affiché avec une durée de 0 ?",
            choix: [
              "Pour qu'il soit invisible",
              "Parce qu'une durée de 0 veut dire « pour toujours »",
              "Pour économiser de la mémoire",
              "Parce qu'il est réécrit à chaque Tick : il ne doit durer qu'une image pour que le temps se mette à jour",
            ],
            bonne: 3,
            explication:
              "ShowRaceDebugText est appelée à chaque Tick. Chaque message ne dure qu'une image et est aussitôt remplacé par le suivant, avec le temps à jour.",
          },
          {
            type: "qcm",
            enonce: "Que se passerait-il si ShowRaceDebugText utilisait la clé 100, comme le compte à rebours ?",
            choix: [
              "Rien, les deux messages s'afficheraient l'un sous l'autre",
              "Le chrono et le « GO! » se remplaceraient l'un l'autre au même emplacement",
              "Le jeu planterait",
              "Le chrono s'afficherait en rouge",
            ],
            bonne: 1,
            explication:
              "Un message avec la même clé remplace le précédent. Le chrono, réécrit à chaque image, effacerait le « GO! » tout de suite. Avec 100 et 101, les deux s'affichent ensemble.",
          },
          {
            type: "vrai-faux",
            enonce: "Si on décoche bShowDebugText, le compte à rebours ne marche plus : le widget ne reçoit plus les chiffres.",
            choix: [
              "Vrai",
              "Faux",
            ],
            bonne: 1,
            explication:
              "ShowDebugText sort tout de suite si la case est décochée, mais seulement l'affichage de debug disparaît. Les timers et les Broadcast de OnCountdownTick continuent : le widget reçoit toujours 3, 2, 1, 0.",
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
          "OnCountdownTick est BlueprintAssignable : le widget s'y abonne et reçoit 3, 2, 1 puis 0 pour le GO, à chaque Broadcast du GameMode. Appeler StartCountdown relancerait la course.",
      },
      {
        type: "vrai-faux",
        enonce: "Si personne n'est abonné à OnRaceStarted, Broadcast provoque une erreur.",
        choix: [
          "Vrai",
          "Faux",
        ],
        bonne: 1,
        explication:
          "Un Broadcast sans abonné ne fait simplement rien. C'est ce qui permet au GameMode de marcher avec ou sans widget.",
      },
      {
        type: "qcm",
        enonce: "Au lancement du niveau, avec les réglages par défaut, dans quel ordre ces fonctions sont-elles appelées ?",
        choix: [
          "StartCountdown, CountCheckpoints, BeginCountdown, CountdownStep, StartRace",
          "BeginCountdown, CountCheckpoints, StartCountdown, StartRace, CountdownStep",
          "CountCheckpoints, BeginCountdown, StartCountdown, CountdownStep, StartRace",
          "CountCheckpoints, StartCountdown, BeginCountdown, CountdownStep, StartRace",
        ],
        bonne: 3,
        explication:
          "BeginPlay compte d'abord les checkpoints, puis appelle StartCountdown, qui règle le timer de StartDelay vers BeginCountdown. Le timer en boucle appelle ensuite CountdownStep, qui donne le GO avec StartRace.",
      },
      {
        type: "code",
        enonce: "Quelle ligne arrête le timer en boucle au GO ?",
        code: "void AKartGameMode::StartRace()\n{\n\t____\n\n\tCountdownNumber = 0;\n\tbRaceStarted = true;\n\tSetAllKartsCanMove(true);",
        choix: [
          "CountdownTimer = 0;",
          "SetAllKartsCanMove(false);",
          "GetWorldTimerManager().ClearTimer(CountdownTimer);",
          "OnRaceStarted.Broadcast();",
        ],
        bonne: 2,
        explication:
          "ClearTimer avec le handle du timer l'arrête. Sans lui, CountdownStep continuerait chaque seconde et redonnerait le GO à chaque fois.",
      },
      {
        type: "code",
        enonce: "Avec CountdownSeconds = 1, que se passe-t-il ?",
        code: "--CountdownNumber;\n\nif (CountdownNumber <= 0)\n{\n\tStartRace();\n\treturn;\n}",
        choix: [
          "Le « 1 » s'affiche, puis au premier CountdownStep le chiffre passe à 0 et StartRace donne le GO",
          "Le GO est donné immédiatement, sans afficher de chiffre",
          "Le compte à rebours affiche 1 puis 0 puis -1",
          "Le jeu refuse cette valeur",
        ],
        bonne: 0,
        explication:
          "BeginCountdown affiche et diffuse 1. Une seconde plus tard, CountdownStep fait passer le chiffre à 0 : la condition <= 0 est vraie, StartRace donne le GO, et return évite d'afficher 0.",
      },
      {
        type: "code",
        enonce: "Pendant le « 3, 2, 1 », que renvoie GetRaceTime() ?",
        code: "if (!IsRaceStarted())\n{\n\treturn 0.f;\n}",
        choix: [
          "Le temps écoulé depuis le lancement du niveau",
          "0, car la course n'est pas lancée",
          "Un temps négatif, qui devient positif au GO",
          "Le chiffre du compte à rebours",
        ],
        bonne: 1,
        explication:
          "bUseCountdown est coché et bRaceStarted est encore faux : IsRaceStarted renvoie faux, donc GetRaceTime renvoie 0. RaceStartTime ne sera noté qu'au GO, dans StartRace.",
      },
      {
        type: "code",
        enonce: "bUseCountdown est décoché. Lequel de ces effets est vrai ?",
        code: "else\n{\n\t// Pas de compte à rebours : la course (et le chrono) commence tout de suite\n\tbRaceStarted = true;\n\tRaceStartTime = GetWorld()->GetTimeSeconds();\n}",
        choix: [
          "Le chrono reste à 0, car RaceStartTime n'est jamais réglé",
          "OnRaceStarted est diffusé tout de suite",
          "Les karts restent bloqués, car SetAllKartsCanMove(true) n'est jamais appelé",
          "OnRaceStarted n'est jamais diffusé : un widget qui l'attend pour afficher le chrono ne le recevra pas",
        ],
        bonne: 3,
        explication:
          "Cette branche ne fait que mettre bRaceStarted à vrai et noter l'heure : aucun Broadcast. Les karts ne sont pas bloqués, puisque StartCountdown n'a pas été appelée, et le chrono part bien de cette heure.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi RaceStartTime utilise GetTimeSeconds et pas GetRealTimeSeconds ?",
        choix: [
          "Parce que GetRealTimeSeconds n'existe qu'en Blueprint",
          "Parce que GetTimeSeconds est en millisecondes",
          "Parce que le temps de jeu s'arrête pendant la pause, le chrono aussi",
          "Parce que GetRealTimeSeconds est plus lent",
        ],
        bonne: 2,
        explication:
          "GetTimeSeconds est le temps de jeu : il s'arrête en pause et suit les ralentis. Un chrono de course ne doit pas avancer quand le jeu est en pause.",
      },
      {
        type: "qcm",
        enonce: "Laquelle de ces fonctions du GameMode ne peut PAS être const ?",
        choix: [
          "GetRaceTime",
          "SetAllKartsCanMove",
          "ShowRaceDebugText",
          "CountCheckpoints",
        ],
        bonne: 3,
        explication:
          "CountCheckpoints écrit dans CheckpointCount, une variable du GameMode. Les trois autres ne font que lire le GameMode : SetAllKartsCanMove modifie les karts, mais pas le GameMode lui-même.",
      },
      {
        type: "qcm",
        enonce: "Comment le GameMode trouve-t-il tous les karts pour les débloquer au GO ?",
        choix: [
          "Chaque kart s'inscrit dans un tableau du GameMode",
          "Avec GetPlayerPawn pour chaque joueur",
          "Avec TActorIterator<AKartPawn>, qui parcourt les karts présents dans le niveau",
          "Les karts lisent IsRaceStarted à chaque image",
        ],
        bonne: 2,
        explication:
          "SetAllKartsCanMove fait l'appel de tous les AKartPawn du monde avec TActorIterator et appelle SetCanMove sur chacun. GetPlayerPawn ne donne que le kart d'un joueur, il sert au texte de debug.",
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
          "Elle n'utilise que son paramètre Seconds. Le widget du chrono peut donc l'appeler sans avoir de GameMode sous la main, et le texte de debug s'en sert aussi.",
      },
      {
        type: "code",
        enonce: "Que renvoie FormatRaceTime(130.75f) ?",
        code: "return FText::FromString(FString::Printf(TEXT(\"%02d:%02d.%03d\"), Minutes, WholeSeconds, Milliseconds));",
        choix: [
          "\"2:10.75\"",
          "\"02:10.750\"",
          "\"130.750\"",
          "\"02:50.750\"",
        ],
        bonne: 1,
        explication:
          "130.75 / 60 = 2.18, arrondi vers le bas : 2 minutes. Fmod(130.75, 60) = 10.75 : 10 secondes et 750 millisecondes. %02d et %03d complètent avec des zéros.",
      },
      {
        type: "qcm",
        enonce: "Que se passe-t-il pour le chrono quand le premier kart passe la ligne de son dernier tour ?",
        choix: [
          "Le chrono général s'arrête pour tous les karts",
          "Le chrono repart de zéro",
          "Le GameMode relance le compte à rebours",
          "Le chrono général continue ; le kart garde son temps d'arrivée dans FinishTime",
        ],
        bonne: 3,
        explication:
          "NotifyKartFinished bloque ce kart et diffuse OnKartFinished, mais ne touche pas au chrono. Le texte de debug affiche alors « FINI ! » avec GetFinishTime.",
      },
      {
        type: "vrai-faux",
        enonce: "Après un appel à StartCountdown, un kart qui avait fini la course pourra de nouveau valider des tours après le GO, mais il repartira de l'endroit où il s'était arrêté.",
        choix: [
          "Vrai",
          "Faux",
        ],
        bonne: 0,
        explication:
          "ResetRaceProgress remet le tour à 1 et bHasFinishedRace à faux, et le GO le débloque. Mais rien ne le téléporte : StartCountdown ne replace pas les karts sur la ligne de départ.",
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
