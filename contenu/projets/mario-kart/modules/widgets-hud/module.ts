import type { Module } from "@/contenu/types";

export const widgetsHud: Module = {
  slug: "widgets-hud",
  titre: "Widgets HUD",
  resume: "Le compte à rebours et l'affichage de la course",
  intro:
    "L'interface de la course tient en deux widgets : le « 3, 2, 1, GO! » du départ et le HUD qui affiche le chrono et le tour en cours. Chacun est une classe C++ pour la logique et un Widget Blueprint pour l'apparence. Ce module explique qui les crée, comment brancher le C++ au Blueprint dans l'éditeur, et comment ils écoutent le GameMode sans jamais décider à sa place.",
  fichiers: [
    "KartPlayerController.h",
    "KartPlayerController.cpp",
    "KartCountdownWidget.h",
    "KartCountdownWidget.cpp",
    "KartRaceHudWidget.h",
    "KartRaceHudWidget.cpp",
  ],
  lecons: [
    {
      slug: "header-playercontroller",
      titre: "Le header KartPlayerController.h",
      resume: "Les classes de widget à choisir (TSubclassOf) et les widgets créés (TObjectPtr)",
      dureeMin: 10,
      fichiers: ["KartPlayerController.h"],
      charger: () => import("./header-playercontroller.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/header-playercontroller",
        questions: [
          {
            type: "qcm",
            enonce: "Que contient la variable CountdownWidgetClass ?",
            choix: [
              "Le widget du compte à rebours, déjà affiché à l'écran",
              "Le texte « 3, 2, 1, GO »",
              "Une classe de widget : le modèle à fabriquer avec CreateWidget",
              "Un pointeur vers le GameMode",
            ],
            bonne: 2,
            explication:
              "C'est un TSubclassOf : il range une classe, pas un objet. Le widget lui-même est fabriqué plus tard par CreateWidget et rangé dans CountdownWidget.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le header peut-il se contenter de « class UKartCountdownWidget; » au lieu d'inclure KartCountdownWidget.h ?",
            choix: [
              "Parce qu'il n'utilise que des pointeurs et des TSubclassOf vers cette classe : savoir qu'elle existe suffit",
              "Parce qu'Unreal inclut tous les headers automatiquement",
              "Parce que les widgets n'ont pas de header",
              "Parce que la classe est déclarée dans le .generated.h",
            ],
            bonne: 0,
            explication:
              "C'est une déclaration anticipée. Le header ne manipule pas l'intérieur de la classe ; le .cpp, qui crée les widgets, inclut le vrai header.",
          },
          {
            type: "vrai-faux",
            enonce: "Le UPROPERTY() vide au-dessus de CountdownWidget ne sert à rien puisqu'il n'a ni EditAnywhere ni BlueprintReadOnly.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Il dit au moteur que ce pointeur garde le widget en vie : sans lui, le ramasse-miettes d'Unreal pourrait détruire le widget.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/header-playercontroller/pourquoi-tsubclassof",
          enonce:
            "Pourquoi le PlayerController utilise-t-il des variables TSubclassOf réglées dans l'éditeur, au lieu de créer directement UKartCountdownWidget dans le code ?",
          attendus:
            "La classe C++ ne contient que la logique ; l'apparence est dans le Widget Blueprint (WBP_Countdown) qui en hérite, et le C++ ne connaît pas ce Blueprint. TSubclassOf permet de choisir le WBP dans l'éditeur, sans écrire de chemin d'asset dans le code, et le menu ne propose que les classes compatibles. Bonus : on peut changer de WBP sans recompiler.",
        },
      ],
    },
    {
      slug: "cpp-playercontroller",
      titre: "KartPlayerController.cpp : créer l'interface",
      resume: "IsLocalController, CreateWidget, AddToViewport et les réglages de BP_KartPlayerController",
      dureeMin: 15,
      fichiers: ["KartPlayerController.cpp"],
      charger: () => import("./cpp-playercontroller.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/cpp-playercontroller",
        questions: [
          {
            type: "qcm",
            enonce: "Que se passe-t-il si on oublie d'appeler AddToViewport après CreateWidget ?",
            choix: [
              "Le widget existe en mémoire mais ne s'affiche pas",
              "Le jeu plante au lancement",
              "Unreal l'ajoute à l'écran automatiquement",
              "Le Widget Blueprint ne compile plus",
            ],
            bonne: 0,
            explication:
              "CreateWidget fabrique le widget, AddToViewport le pose à l'écran. Sans la seconde étape, le widget est bien créé mais personne ne le voit.",
          },
          {
            type: "vrai-faux",
            enonce: "Si la case Countdown Widget Class est vide dans BP_KartPlayerController, le jeu affiche un message d'erreur au lancement.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "La classe vaut nullptr, le if de la ligne 17 est faux et le code saute simplement ce widget. Le jeu tourne sans compte à rebours, sans aucun message : c'est pour ça que l'oubli est difficile à repérer.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay s'arrête-t-il tout de suite si IsLocalController() est faux ?",
            choix: [
              "Parce que le kart n'est pas encore créé",
              "Parce que ce PlayerController représente un joueur qui ne joue pas sur cette machine : il n'a pas d'écran ici",
              "Parce que les widgets ne marchent pas en solo",
              "Pour gagner du temps de compilation",
            ],
            bonne: 1,
            explication:
              "En réseau, le serveur a aussi les PlayerControllers des joueurs distants. Leur créer une interface ne servirait à rien : leur écran est sur une autre machine.",
          },
          {
            type: "qcm",
            enonce: "Le constructeur de AKartGameMode choisit AKartPlayerController::StaticClass(). Que faut-il faire pour que les widgets choisis dans BP_KartPlayerController soient utilisés ?",
            choix: [
              "Rien, Unreal prend automatiquement le Blueprint enfant",
              "Supprimer la classe C++ AKartPlayerController",
              "Appeler CreateWidget dans le GameMode",
              "Choisir BP_KartPlayerController dans le champ Player Controller Class du GameMode utilisé par le niveau",
            ],
            bonne: 3,
            explication:
              "StaticClass() désigne la classe C++, dont les deux cases sont vides. Il faut indiquer au GameMode (son Blueprint ou le GameMode Override du niveau) d'utiliser le Blueprint, où les cases sont remplies.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/cpp-playercontroller/rien-ne-s-affiche",
          enonce:
            "Tu lances le jeu : ni le compte à rebours ni le chrono ne s'affichent, et aucune erreur n'apparaît. En t'appuyant sur le code de BeginPlay, explique pourquoi rien ne te prévient et liste ce que tu vérifies dans l'éditeur.",
          attendus:
            "BeginPlay vérifie que chaque classe n'est pas nullptr avant CreateWidget : une case vide fait simplement sauter le widget, sans message. À vérifier : le GameMode du niveau utilise BP_KartPlayerController (Player Controller Class ou GameMode Override) et pas la classe C++ dont les cases sont vides ; les cases Countdown Widget Class et Race Hud Widget Class (catégorie Kart > UI) sont remplies avec WBP_Countdown et WBP_RaceHud ; ces WBP ont la bonne classe parente.",
        },
      ],
    },
    {
      slug: "header-countdown",
      titre: "Le header KartCountdownWidget.h et WBP_Countdown",
      resume: "UUserWidget, BindWidget, réglages et event Blueprint, puis créer le Widget Blueprint sans erreur",
      dureeMin: 20,
      fichiers: ["KartCountdownWidget.h"],
      charger: () => import("./header-countdown.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/header-countdown",
        questions: [
          {
            type: "qcm",
            enonce: "Dans WBP_Countdown, le widget Text s'appelle TextBlock_0. Que se passe-t-il quand on compile le WBP ?",
            choix: [
              "Le WBP compile, mais le chiffre ne s'affichera jamais",
              "Unreal renomme le texte automatiquement",
              "Le WBP refuse de compiler : un widget requis par BindWidget (CountdownText) est introuvable",
              "Le jeu plante au moment du « 3 »",
            ],
            bonne: 2,
            explication:
              "BindWidget rend l'élément obligatoire : le compilateur du Blueprint cherche un Text nommé CountdownText et signale une erreur s'il ne le trouve pas. Il suffit de renommer le texte.",
          },
          {
            type: "code",
            enonce: "Quel mot manque pour que Unreal remplisse ce pointeur avec le texte du Widget Blueprint ?",
            code: "UPROPERTY(meta = (____))\nTObjectPtr<UTextBlock> CountdownText;",
            choix: ["EditAnywhere", "BindWidget", "BlueprintReadOnly", "Transient"],
            bonne: 1,
            explication:
              "BindWidget dit à Unreal de chercher dans le WBP l'élément de même nom et de même type, et d'y faire pointer la variable.",
          },
          {
            type: "vrai-faux",
            enonce: "OnCountdownNumberShown n'a pas de code en C++ : c'est le Widget Blueprint qui peut lui en donner, par exemple pour jouer un son.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "C'est le rôle de BlueprintImplementableEvent. Le C++ l'appelle à chaque chiffre ; si le WBP ne l'implémente pas, l'appel ne fait rien.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi GoText est-il un FText créé avec NSLOCTEXT plutôt qu'un FString ?",
            choix: [
              "Parce qu'un FString ne peut pas contenir de point d'exclamation",
              "Parce que FText est plus rapide à afficher",
              "Parce que les variables EditAnywhere doivent être des FText",
              "Parce que c'est un texte montré au joueur : FText avec NSLOCTEXT peut être traduit",
            ],
            bonne: 3,
            explication:
              "FText est le type des textes destinés au joueur. NSLOCTEXT lui donne un espace de noms et une clé pour que les outils de traduction le retrouvent.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/header-countdown/deux-sens",
          enonce:
            "CountdownText et GoText sont deux variables du même header, mais le lien entre C++ et Blueprint ne va pas dans le même sens. Explique la différence et ce que tu fais dans l'éditeur pour chacune.",
          attendus:
            "CountdownText (BindWidget) va du Blueprint vers le C++ : le C++ s'attend à trouver dans WBP_Countdown un Text nommé exactement CountdownText ; il faut le créer et le nommer dans le Designer, sinon le WBP ne compile pas. GoText (EditAnywhere) va du C++ vers le Blueprint : le C++ propose une valeur par défaut (« GO! »), qu'on peut changer dans les Class Defaults du WBP, catégorie Kart > Countdown, sans recompiler.",
        },
      ],
    },
    {
      slug: "cpp-countdown",
      titre: "KartCountdownWidget.cpp : 3, 2, 1, GO",
      resume: "Écouter le GameMode, afficher le chiffre ou GO, puis disparaître avec un timer",
      dureeMin: 20,
      fichiers: ["KartCountdownWidget.cpp"],
      charger: () => import("./cpp-countdown.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/cpp-countdown",
        questions: [
          {
            type: "qcm",
            enonce: "Comment le widget sait-il qu'il faut passer de « 3 » à « 2 » ?",
            choix: [
              "Il compte les secondes lui-même dans NativeTick",
              "Le GameMode déclenche OnCountdownTick, auquel le widget s'est abonné dans NativeConstruct",
              "Le PlayerController appelle SetText sur le widget",
              "Le kart envoie son état au widget",
            ],
            bonne: 1,
            explication:
              "Le widget ne compte rien : il s'abonne à l'event OnCountdownTick du GameMode, qui appelle HandleCountdownTick avec le bon chiffre.",
          },
          {
            type: "qcm",
            enonce: "Que fait HandleCountdownTick quand il reçoit Number = 0 ?",
            choix: [
              "Il cache immédiatement le widget",
              "Il affiche « 0 »",
              "Il affiche GoText puis lance un timer qui cachera le widget après GoDisplayTime secondes",
              "Il se désabonne du GameMode",
            ],
            bonne: 2,
            explication:
              "0 veut dire GO. Le widget affiche GoText, puis HideTimer appelle HideCountdown après le délai pour le remettre en Collapsed.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi NativeDestruct appelle-t-il RemoveDynamic ?",
            choix: [
              "Pour que le GameMode n'appelle pas un widget qui n'existe plus",
              "Pour remettre le compte à rebours à 3",
              "Parce que sinon le widget ne s'affiche pas la fois suivante",
              "Pour libérer le texte CountdownText",
            ],
            bonne: 0,
            explication:
              "Chaque abonnement doit être défait quand le widget disparaît. On arrête aussi le timer pour qu'il ne rappelle pas HideCountdown plus tard.",
          },
          {
            type: "vrai-faux",
            enonce: "Si le widget est créé alors que le GameMode affiche déjà « 2 », il reste caché jusqu'au « 1 ».",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Les lignes 18 à 22 rattrapent ce cas : si la course n'a pas commencé et que GetCountdownNumber() est plus grand que 0, le widget affiche tout de suite le chiffre en cours.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le widget utilise-t-il HitTestInvisible plutôt que Visible ?",
            choix: [
              "Pour que le texte soit transparent",
              "Parce que Visible ne marche pas en C++",
              "Pour que le widget ne reçoive pas de NativeTick",
              "Le texte s'affiche, mais la souris passe au travers sans être bloquée",
            ],
            bonne: 3,
            explication:
              "HitTestInvisible affiche le widget sans qu'il intercepte les clics. Un texte décoratif n'a pas besoin de réagir à la souris.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/cpp-countdown/se-desabonner",
          enonce:
            "Le widget aurait pu lire GetCountdownNumber() à chaque image dans un NativeTick. Explique pourquoi le projet utilise plutôt un event (delegate), et ce que le widget doit faire dans NativeDestruct en échange.",
          attendus:
            "Le chiffre change une fois par seconde : le relire à chaque image est du travail inutile. Avec un event, le widget n'est appelé que quand il se passe quelque chose, et le GameMode n'a pas besoin de connaître le widget (d'autres abonnés possibles). En échange, il faut se désabonner (RemoveDynamic) dans NativeDestruct pour que le GameMode n'appelle pas un widget détruit, et arrêter le timer HideTimer.",
        },
      ],
    },
    {
      slug: "header-racehud",
      titre: "Le header KartRaceHudWidget.h et WBP_RaceHud",
      resume: "NativeTick, deux BindWidget et FinishedText, puis créer le Widget Blueprint du HUD",
      dureeMin: 15,
      fichiers: ["KartRaceHudWidget.h"],
      charger: () => import("./header-racehud.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/header-racehud",
        questions: [
          {
            type: "qcm",
            enonce: "Tu as créé WBP_RaceHud avec UserWidget comme parent. Il n'apparaît pas dans la case Race Hud Widget Class du PlayerController. Pourquoi ?",
            choix: [
              "Parce que la case est un TSubclassOf<UKartRaceHudWidget> : seuls les Blueprints qui héritent de cette classe sont proposés",
              "Parce qu'il faut redémarrer l'éditeur",
              "Parce que le nom doit commencer par BP_",
              "Parce qu'un widget ne peut pas être choisi dans un PlayerController",
            ],
            bonne: 0,
            explication:
              "Il faut changer la classe parente du WBP (Class Settings > Parent Class) pour KartRaceHudWidget. Ensuite il apparaît dans la liste.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi ce widget déclare-t-il NativeTick, alors que le compte à rebours n'en a pas ?",
            choix: [
              "Parce que NativeTick est obligatoire pour s'afficher",
              "Parce que le chrono change à chaque image : il faut le réécrire en continu",
              "Parce que NativeTick remplace NativeConstruct",
              "Pour pouvoir s'abonner à OnRaceStarted",
            ],
            bonne: 1,
            explication:
              "Le compte à rebours ne change qu'une fois par seconde et attend les events du GameMode. Le chrono, lui, avance en continu.",
          },
          {
            type: "vrai-faux",
            enonce: "WBP_RaceHud contient un Text nommé TimerText mais pas de LapText : il compile, et seul le tour ne s'affiche pas.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "LapText est aussi en BindWidget, donc obligatoire : sans lui, le WBP refuse de compiler.",
          },
          {
            type: "qcm",
            enonce: "Tu veux afficher « TERMINÉ » au lieu de « FINI ! » à l'arrivée. Que fais-tu ?",
            choix: [
              "Tu changes Finished Text dans les Class Defaults de WBP_RaceHud, sans recompiler",
              "Tu renommes le texte LapText en FinishedText",
              "Tu ajoutes un troisième BindWidget",
              "C'est impossible sans modifier le GameMode",
            ],
            bonne: 0,
            explication:
              "FinishedText est en EditAnywhere : sa valeur par défaut se change dans le WBP, catégorie Kart > Race.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/header-racehud/repartition",
          enonce:
            "Un collègue veut changer la couleur du chrono et ajouter une petite animation à chaque chiffre du compte à rebours. Doit-il modifier le C++ ou le Widget Blueprint ? Explique ce qu'il fait concrètement dans l'éditeur.",
          attendus:
            "Tout se fait dans les WBP, sans toucher au C++. Couleur : dans le Designer de WBP_RaceHud, sélectionner TimerText et changer sa couleur. Animation : dans WBP_Countdown, créer une animation puis implémenter l'event On Countdown Number Shown dans le Graph pour la jouer. Il ne doit pas renommer les textes CountdownText, TimerText, LapText (BindWidget).",
        },
      ],
    },
    {
      slug: "cpp-racehud",
      titre: "KartRaceHudWidget.cpp : tour et chrono",
      resume: "Apparaître au GO, relire le chrono à chaque image, afficher « Tour 2/3 » avec FText::Format",
      dureeMin: 20,
      fichiers: ["KartRaceHudWidget.cpp"],
      charger: () => import("./cpp-racehud.mdx"),
      quiz: {
        id: "mario-kart/widgets-hud/cpp-racehud",
        questions: [
          {
            type: "qcm",
            enonce: "Pourquoi le chrono est-il mis à jour dans NativeTick et pas avec un event du GameMode ?",
            choix: [
              "Parce que le temps change à chaque image : il n'y a pas de moment précis à annoncer",
              "Parce que les widgets ne peuvent pas s'abonner aux events",
              "Parce que NativeTick est plus rapide qu'un event",
              "Parce que le GameMode n'a pas de chrono",
            ],
            bonne: 0,
            explication:
              "Un event sert à annoncer un moment précis (le GO). Le chrono, lui, avance en continu : on le relit à chaque image.",
          },
          {
            type: "code",
            enonce: "Que s'affiche-t-il pendant le deuxième tour d'une course de 3 tours ?",
            code: 'FText::Format(NSLOCTEXT("Kart", "LapFormat", "Tour {0}/{1}"),\n    FText::AsNumber(2), FText::AsNumber(3))',
            choix: ["Tour {0}/{1}", "Tour 3/2", "Tour 2/3", "LapFormat 2/3"],
            bonne: 2,
            explication:
              "FText::Format remplace {0} par le premier argument (le tour actuel, 2) et {1} par le second (le nombre de tours, 3). LapFormat est seulement la clé de traduction.",
          },
          {
            type: "qcm",
            enonce: "Le joueur vient de finir la course. Qu'affiche le HUD ?",
            choix: [
              "Le chrono continue de tourner et le tour reste à 3/3",
              "Le temps d'arrivée du kart, figé, et FinishedText à la place du tour",
              "Le widget se cache",
              "Le meilleur tour du joueur",
            ],
            bonne: 1,
            explication:
              "Quand HasFinishedRace() est vrai, le chrono affiche GetFinishTime() du kart (qui ne bouge plus) et le texte du tour devient FinishedText.",
          },
          {
            type: "vrai-faux",
            enonce: "Si le compte à rebours est désactivé dans le GameMode, le HUD de course reste caché toute la partie car OnRaceStarted n'est jamais envoyé.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Dans NativeConstruct, le widget vérifie IsRaceStarted(), qui est vrai tout de suite sans compte à rebours. Il appelle alors HandleRaceStarted lui-même et s'affiche.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le code utilise-t-il TimerText et LapText sans vérifier qu'ils ne valent pas nullptr ?",
            choix: [
              "Parce que les pointeurs TObjectPtr ne peuvent jamais être nuls",
              "Parce que NativeTick vérifie les pointeurs tout seul",
              "C'est un oubli qui fera planter le jeu",
              "Parce que BindWidget empêche le WBP de compiler si ces textes manquent",
            ],
            bonne: 3,
            explication:
              "Avec BindWidget, un WBP_RaceHud sans TimerText ou LapText ne compile pas. Le code peut donc compter sur leur présence.",
          },
        ],
      },
      questionsLibres: [
        {
          id: "mario-kart/widgets-hud/cpp-racehud/tick-ou-event",
          enonce:
            "Le HUD de course apparaît grâce à un event, mais se cache tout seul dans NativeTick quand la course est relancée. Explique pourquoi les deux mécanismes sont utilisés ici.",
          attendus:
            "Le GO est un moment précis annoncé par le GameMode (OnRaceStarted) : le widget s'y abonne pour apparaître. En revanche, aucun event ne signale qu'une course est relancée (StartCountdown) : le widget le détecte lui-même dans NativeTick avec IsRaceStarted() faux, et se met en Collapsed. NativeTick tourne de toute façon pour le chrono, la vérification ne coûte presque rien.",
        },
      ],
    },
  ],
  quizFinal: {
    id: "mario-kart/widgets-hud/final",
    questions: [
      {
        type: "qcm",
        enonce: "Quel objet crée les deux widgets de la course ?",
        choix: ["Le GameMode", "Le kart (AKartPawn)", "Le PlayerController du joueur local", "Le niveau"],
        bonne: 2,
        explication:
          "AKartPlayerController::BeginPlay crée et affiche les deux widgets, seulement si IsLocalController() est vrai.",
      },
      {
        type: "qcm",
        enonce: "Dans quel ordre faut-il appeler ces deux fonctions pour voir un widget à l'écran ?",
        choix: [
          "AddToViewport puis CreateWidget",
          "CreateWidget puis AddToViewport",
          "Seulement CreateWidget",
          "Seulement AddToViewport",
        ],
        bonne: 1,
        explication: "CreateWidget fabrique le widget et renvoie un pointeur ; AddToViewport l'ajoute ensuite à l'écran.",
      },
      {
        type: "qcm",
        enonce: "Le compte à rebours n'apparaît pas, aucune erreur n'est affichée. Quelle cause est la plus probable ?",
        choix: [
          "Le texte du WBP ne s'appelle pas CountdownText",
          "Le GameMode utilise la classe C++ AKartPlayerController au lieu de BP_KartPlayerController, dont la case est vide",
          "Le header n'a pas de #pragma once",
          "La variable GoText est vide",
        ],
        bonne: 1,
        explication:
          "Un mauvais nom de texte provoque une erreur de compilation du WBP, donc visible. Une case vide (ou un PlayerController C++ dont les cases sont vides) est silencieuse : le if saute la création.",
      },
      {
        type: "vrai-faux",
        enonce: "Un pointeur marqué BindWidget doit être rempli dans NativeConstruct avec une ligne de code.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication:
          "Unreal le remplit tout seul avec l'élément du WBP qui porte le même nom et le même type. Aucun code n'est nécessaire.",
      },
      {
        type: "qcm",
        enonce: "Comment faire hériter un Widget Blueprint existant de UKartCountdownWidget ?",
        choix: [
          "Le renommer en WBP_Countdown",
          "Ajouter un #include dans le WBP",
          "Glisser le fichier .h dans le Designer",
          "Dans le Graph, Class Settings > Parent Class, choisir KartCountdownWidget",
        ],
        bonne: 3,
        explication: "La classe parente se change dans Class Settings. Le nom de l'asset n'a aucun effet sur l'héritage.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi les widgets se mettent-ils en Collapsed dans NativeConstruct ?",
        choix: [
          "Pour ne rien montrer tant que le GameMode n'a pas annoncé un chiffre ou le GO",
          "Pour économiser la mémoire",
          "Parce que AddToViewport les rend toujours visibles en double",
          "Pour que le PlayerController puisse les détruire",
        ],
        bonne: 0,
        explication:
          "Les widgets sont créés dès le début de la partie. Ils restent invisibles jusqu'à ce que l'event du GameMode leur dise de s'afficher.",
      },
      {
        type: "code",
        enonce: "Quelle macro complète l'abonnement du HUD à l'event du GO ?",
        code: "GameMode->OnRaceStarted.____(this, &UKartRaceHudWidget::HandleRaceStarted);",
        choix: ["RemoveDynamic", "Broadcast", "AddUniqueDynamic", "SetTimer"],
        bonne: 2,
        explication:
          "AddUniqueDynamic abonne la fonction sans risque de doublon. RemoveDynamic fait l'inverse, Broadcast est appelé par le GameMode pour déclencher l'event.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi HandleCountdownTick et HandleRaceStarted ont-elles un UFUNCTION() alors qu'elles sont privées ?",
        choix: [
          "Pour qu'on puisse les appeler depuis un Blueprint",
          "Parce qu'une fonction abonnée à un delegate dynamique doit être une UFUNCTION",
          "Pour les afficher dans le panneau Details",
          "Parce que toutes les fonctions d'un widget doivent l'avoir",
        ],
        bonne: 1,
        explication:
          "Les delegates dynamiques retrouvent la fonction par son nom grâce au système de réflexion d'Unreal : elle doit donc être déclarée avec UFUNCTION.",
      },
      {
        type: "vrai-faux",
        enonce: "Le HUD de course calcule lui-même le temps écoulé en additionnant les DeltaTime.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication:
          "Il lit GameMode->GetRaceTime() et le met en forme avec FormatRaceTime. Le widget affiche, il ne calcule pas.",
      },
      {
        type: "qcm",
        enonce: "Que renvoie GetOwningPlayerPawn<AKartPawn>() dans le HUD ?",
        choix: [
          "Le kart du joueur qui possède le widget, ou nullptr si son Pawn n'est pas un kart",
          "Le premier kart trouvé dans le niveau",
          "Le kart en tête de la course",
          "Le PlayerController du joueur",
        ],
        bonne: 0,
        explication:
          "Le propriétaire du widget est le PlayerController passé à CreateWidget. La fonction renvoie le Pawn qu'il contrôle, converti en AKartPawn.",
      },
    ],
  },
  defi: {
    id: "mario-kart/widgets-hud/defi-message-arrivee",
    titre: "Afficher un message à l'arrivée",
    consigne:
      "Ajoute à UKartRaceHudWidget un troisième texte en BindWidget, FinishMessageText, caché pendant la course. Quand le joueur a fini, affiche-le avec son temps d'arrivée, par exemple « Arrivée en 01:23.500 ». Indices : FText::Format et AKartGameMode::FormatRaceTime, comme pour LapText ; n'oublie pas d'ajouter le Text du même nom dans WBP_RaceHud, sinon il ne compilera plus. Dépose une capture une fois fait.",
  },
};
