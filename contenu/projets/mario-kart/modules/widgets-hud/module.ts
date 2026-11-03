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
            enonce: "Parmi les includes du header, lequel doit obligatoirement rester le dernier ?",
            choix: [
              "CoreMinimal.h",
              "GameFramework/PlayerController.h",
              "KartPlayerController.generated.h",
              "KartCountdownWidget.h",
            ],
            bonne: 2,
            explication:
              "Le .generated.h est écrit par Unreal et doit toujours être le dernier include. KartCountdownWidget.h n'est d'ailleurs pas inclus dans ce header : la classe y est seulement annoncée.",
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
            type: "code",
            enonce: "Que gagne AKartPlayerController grâce à « : public APlayerController » ?",
            code: "UCLASS()\nclass KARTGAMES_API AKartPlayerController : public APlayerController\n{\n\tGENERATED_BODY()",
            choix: [
              "Rien de concret : c'est seulement le nom de la catégorie dans l'éditeur",
              "Elle devient un widget qu'on peut afficher à l'écran",
              "Elle garde tout ce que fait déjà un PlayerController, comme posséder le kart et recevoir les touches",
              "Elle peut être posée plusieurs fois dans le niveau",
            ],
            bonne: 2,
            explication:
              "C'est l'héritage : la classe hérite de APlayerController et n'ajoute que la création de l'interface. Un PlayerController n'est pas un widget.",
          },
          {
            type: "qcm",
            enonce: "Que contient la variable CountdownWidgetClass ?",
            choix: [
              "Le widget du compte à rebours, déjà affiché à l'écran",
              "Le texte « 3, 2, 1, GO »",
              "Un pointeur vers le GameMode",
              "Une classe de widget : le modèle à fabriquer avec CreateWidget",
            ],
            bonne: 3,
            explication:
              "C'est un TSubclassOf : il range une classe, pas un objet. Le widget lui-même est fabriqué plus tard par CreateWidget et rangé dans CountdownWidget.",
          },
          {
            type: "code",
            enonce: "Quel mot manque pour que cette case se remplisse dans le panneau Details de BP_KartPlayerController ?",
            code: "UPROPERTY(____, Category = \"Kart|UI\")\nTSubclassOf<UKartCountdownWidget> CountdownWidgetClass;",
            choix: [
              "VisibleAnywhere",
              "EditAnywhere",
              "BindWidget",
              "BlueprintReadOnly",
            ],
            bonne: 1,
            explication:
              "EditAnywhere rend la variable modifiable dans l'éditeur. VisibleAnywhere l'afficherait sans permettre de la changer, et BindWidget sert aux éléments d'un Widget Blueprint.",
          },
          {
            type: "code",
            enonce: "Dans l'éditeur, que propose le menu déroulant de cette case ?",
            code: "UPROPERTY(EditAnywhere, Category = \"Kart|UI\")\nTSubclassOf<UKartRaceHudWidget> RaceHudWidgetClass;",
            choix: [
              "Tous les Widget Blueprints du projet",
              "Seulement WBP_Countdown",
              "Tous les Blueprints du projet, widgets ou non",
              "UKartRaceHudWidget et les Blueprints qui en héritent, comme WBP_RaceHud",
            ],
            bonne: 3,
            explication:
              "Le type entre chevrons limite le choix à cette classe et à ses enfants : impossible d'y mettre le compte à rebours par erreur.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le code ne crée-t-il pas directement un UKartCountdownWidget, sans passer par une case à remplir ?",
            choix: [
              "Parce que la classe C++ ne contient que la logique : l'apparence est dans WBP_Countdown, un Blueprint que le C++ ne connaît pas",
              "Parce qu'une classe C++ de widget ne peut jamais être créée",
              "Parce que CreateWidget n'accepte que des chemins d'asset écrits en dur",
              "Parce que le PlayerController n'a pas le droit d'inclure un widget",
            ],
            bonne: 0,
            explication:
              "La police, la couleur et la position sont dessinées dans le Widget Blueprint qui hérite de la classe C++. C'est l'éditeur qui donne ce Blueprint au C++ à travers CountdownWidgetClass.",
          },
          {
            type: "vrai-faux",
            enonce: "Le UPROPERTY() vide au-dessus de CountdownWidget ne sert à rien puisqu'il n'a ni EditAnywhere ni BlueprintReadOnly.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Il dit au moteur que ce pointeur garde le widget en vie : sans lui, le ramasse-miettes d'Unreal pourrait détruire le widget.",
          },
          {
            type: "qcm",
            enonce: "Laquelle de ces variables est remplie par le code pendant la partie, et non dans l'éditeur ?",
            choix: [
              "CountdownWidgetClass",
              "RaceHudWidgetClass",
              "CountdownWidget",
              "Aucune : tout se règle dans l'éditeur",
            ],
            bonne: 2,
            explication:
              "CountdownWidget est l'objet fabriqué (TObjectPtr, private, sans EditAnywhere) : BeginPlay le remplit. Les deux TSubclassOf, elles, se règlent avant de jouer.",
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
            enonce: "Le header se contentait de déclarations anticipées. Pourquoi le .cpp inclut-il KartCountdownWidget.h et KartRaceHudWidget.h ?",
            choix: [
              "Pour que les widgets s'affichent plus vite",
              "Parce que le .cpp crée les widgets : le compilateur a besoin des vraies classes",
              "Parce que les déclarations anticipées sont interdites dans un .cpp",
              "Ce n'est pas nécessaire, c'est une habitude",
            ],
            bonne: 1,
            explication:
              "Annoncer une classe suffit pour un pointeur. Pour fabriquer un objet de cette classe avec CreateWidget, il faut sa déclaration complète.",
          },
          {
            type: "qcm",
            enonce: "Que se passe-t-il si on retire la ligne Super::BeginPlay() ?",
            choix: [
              "Rien : Super est optionnel dans un PlayerController",
              "Les widgets s'affichent deux fois",
              "La compilation échoue",
              "Le PlayerController ne fait plus son propre travail de démarrage, celui de APlayerController",
            ],
            bonne: 3,
            explication:
              "Super désigne la classe parente. Sans cet appel, on remplace complètement le BeginPlay de APlayerController au lieu de le compléter.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi BeginPlay s'arrête-t-il tout de suite si IsLocalController() est faux ?",
            choix: [
              "Parce que le kart n'est pas encore créé",
              "Parce que les widgets ne marchent pas en solo",
              "Parce que ce PlayerController représente un joueur qui ne joue pas sur cette machine : il n'a pas d'écran ici",
              "Pour gagner du temps de compilation",
            ],
            bonne: 2,
            explication:
              "En réseau, le serveur a aussi les PlayerControllers des joueurs distants. Leur créer une interface ne servirait à rien : leur écran est sur une autre machine.",
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
            type: "code",
            enonce: "Dans cette ligne, que représente this ?",
            code: "CountdownWidget = CreateWidget<UKartCountdownWidget>(this, CountdownWidgetClass);",
            choix: [
              "Le PlayerController, qui devient le propriétaire du widget",
              "Le widget en train d'être créé",
              "Le GameMode de la partie",
              "Le kart du joueur",
            ],
            bonne: 0,
            explication:
              "On est dans AKartPlayerController::BeginPlay : this est le PlayerController. Il est passé comme propriétaire, ce qui permettra plus tard au widget de retrouver le kart du joueur.",
          },
          {
            type: "code",
            enonce: "Que se passe-t-il si on oublie la ligne AddToViewport ?",
            code: "if (CountdownWidget != nullptr)\n{\n\tCountdownWidget->AddToViewport();\n}",
            choix: [
              "Le jeu plante au lancement",
              "Unreal l'ajoute à l'écran automatiquement",
              "Le Widget Blueprint ne compile plus",
              "Le widget existe en mémoire mais ne s'affiche pas",
            ],
            bonne: 3,
            explication:
              "CreateWidget fabrique le widget, AddToViewport le pose à l'écran. Sans la seconde étape, le widget est bien créé mais personne ne le voit.",
          },
          {
            type: "qcm",
            enonce: "Juste après BeginPlay, les deux widgets sont dans le viewport. Pourquoi ne voit-on pas le chrono pendant le « 3, 2, 1 » ?",
            choix: [
              "Parce que BeginPlay ajoute le HUD à l'écran seulement au GO",
              "Parce que le GameMode cache le HUD lui-même",
              "Parce que c'est chaque widget qui décide quand se montrer : le HUD reste caché jusqu'au GO",
              "Parce que AddToViewport attend une seconde avant d'afficher",
            ],
            bonne: 2,
            explication:
              "Le PlayerController crée et affiche les deux widgets dès le début. Chacun se cache ensuite lui-même et se montre quand le GameMode l'annonce, comme on le voit dans leur .cpp.",
          },
          {
            type: "qcm",
            enonce: "Le constructeur de AKartGameMode choisit AKartPlayerController::StaticClass(). Que faut-il faire pour que les widgets choisis dans BP_KartPlayerController soient utilisés ?",
            choix: [
              "Rien, Unreal prend automatiquement le Blueprint enfant",
              "Choisir BP_KartPlayerController dans le champ Player Controller Class du GameMode utilisé par le niveau",
              "Supprimer la classe C++ AKartPlayerController",
              "Appeler CreateWidget dans le GameMode",
            ],
            bonne: 1,
            explication:
              "StaticClass() désigne la classe C++, dont les deux cases sont vides. Il faut indiquer au GameMode (son Blueprint ou le GameMode Override du niveau) d'utiliser le Blueprint, où les cases sont remplies.",
          },
          {
            type: "qcm",
            enonce: "Les deux cases de BP_KartPlayerController sont vides, et pourtant tu vois « 3, 2, 1 » à l'écran au départ. D'où vient ce texte ?",
            choix: [
              "Du texte de debug du GameMode (bShowDebugText), qui affiche son propre compte à rebours",
              "D'un WBP_Countdown créé automatiquement",
              "Du PlayerController C++, qui a des widgets par défaut",
              "Du kart, qui affiche le compte à rebours",
            ],
            bonne: 0,
            explication:
              "C'est le piège signalé dans la leçon : le texte de debug du GameMode peut faire croire que le widget marche. Vérifie bien les cases de la catégorie Kart > UI.",
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
            enonce: "À quoi correspond NativeConstruct pour un widget ?",
            choix: [
              "Au constructeur C++ de la classe, appelé à la compilation",
              "À l'event Tick, appelé à chaque image",
              "À l'event Construct du Blueprint : c'est le « BeginPlay » du widget",
              "À AddToViewport",
            ],
            bonne: 2,
            explication:
              "NativeConstruct est appelé quand le widget est construit, NativeDestruct quand il est retiré. Ce sont les versions C++ des events Construct et Destruct.",
          },
          {
            type: "code",
            enonce: "Quel mot manque pour que Unreal remplisse ce pointeur avec le texte du Widget Blueprint ?",
            code: "UPROPERTY(meta = (____))\nTObjectPtr<UTextBlock> CountdownText;",
            choix: [
              "EditAnywhere",
              "Transient",
              "BlueprintReadOnly",
              "BindWidget",
            ],
            bonne: 3,
            explication:
              "BindWidget dit à Unreal de chercher dans le WBP l'élément de même nom et de même type, et d'y faire pointer la variable.",
          },
          {
            type: "qcm",
            enonce: "Dans WBP_Countdown, le widget Text s'appelle TextBlock_0. Que se passe-t-il quand on compile le WBP ?",
            choix: [
              "Le WBP compile, mais le chiffre ne s'affichera jamais",
              "Le WBP refuse de compiler : un widget requis par BindWidget (CountdownText) est introuvable",
              "Unreal renomme le texte automatiquement",
              "Le jeu plante au moment du « 3 »",
            ],
            bonne: 1,
            explication:
              "BindWidget rend l'élément obligatoire : le compilateur du Blueprint cherche un Text nommé CountdownText et signale une erreur s'il ne le trouve pas. Il suffit de renommer le texte.",
          },
          {
            type: "vrai-faux",
            enonce: "Si l'élément nommé CountdownText dans le WBP est une Image au lieu d'un Text, BindWidget l'accepte puisque le nom est bon.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "Le nom et le type doivent correspondre : le pointeur attend un UTextBlock, le widget « Text » de la palette. Une Image ou un Rich Text ne conviennent pas.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi GoText est-il un FText créé avec NSLOCTEXT plutôt qu'un FString ?",
            choix: [
              "Parce qu'un FString ne peut pas contenir de point d'exclamation",
              "Parce que c'est un texte montré au joueur : FText avec NSLOCTEXT peut être traduit",
              "Parce que FText est plus rapide à afficher",
              "Parce que les variables EditAnywhere doivent être des FText",
            ],
            bonne: 1,
            explication:
              "FText est le type des textes destinés au joueur. NSLOCTEXT lui donne un espace de noms et une clé pour que les outils de traduction le retrouvent.",
          },
          {
            type: "code",
            enonce: "Dans les Class Defaults de WBP_Countdown, tu essaies de taper -2 dans Go Display Time. Que se passe-t-il ?",
            code: "UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = \"Kart|Countdown\", meta = (ClampMin = \"0\"))\nfloat GoDisplayTime = 1.f;",
            choix: [
              "La valeur est refusée et ramenée à 0 : ClampMin empêche une durée négative",
              "« GO! » reste affiché 2 secondes",
              "Le WBP ne compile plus",
              "« GO! » ne s'affiche jamais",
            ],
            bonne: 0,
            explication:
              "meta = (ClampMin = \"0\") interdit dans l'éditeur toute valeur en dessous de 0. Le C++ ajoute encore une sécurité au moment de lancer le timer, vue dans la leçon suivante.",
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
            type: "code",
            enonce: "HandleCountdownTick est private et ne sera jamais appelée depuis un Blueprint. Pourquoi a-t-elle quand même un UFUNCTION() ?",
            code: "private:\n\tUFUNCTION()\n\tvoid HandleCountdownTick(int32 Number);\n\n\tvoid HideCountdown();",
            choix: [
              "Pour l'afficher dans le panneau Details",
              "Parce que toutes les fonctions d'un widget doivent l'avoir",
              "Pour qu'elle soit appelée à chaque image",
              "Parce qu'elle sera abonnée à un event du GameMode, qui retrouve la fonction par son nom grâce à la réflexion",
            ],
            bonne: 3,
            explication:
              "Les events dynamiques comme OnCountdownTick passent par la réflexion d'Unreal : la fonction abonnée doit être une UFUNCTION, même privée. HideCountdown, appelée par un simple timer, n'en a pas besoin.",
          },
          {
            type: "qcm",
            enonce: "Tu viens d'ajouter une variable EditAnywhere dans KartCountdownWidget.h, puis tu ouvres WBP_Countdown : elle n'apparaît pas dans les Class Defaults. Que s'est-il passé ?",
            choix: [
              "La variable doit aussi être en BindWidget",
              "Tu as oublié de recompiler le C++ : l'éditeur ne connaît pas encore la nouvelle variable",
              "Les Class Defaults n'affichent que les variables Blueprint",
              "Il faut recréer le WBP de zéro",
            ],
            bonne: 1,
            explication:
              "C'est l'une des trois erreurs classiques de la leçon : tant que le C++ n'est pas recompilé, l'éditeur travaille avec l'ancienne version de la classe.",
          },
          {
            type: "qcm",
            enonce: "Quelle différence entre BindWidget et BindWidgetOptional ?",
            choix: [
              "Aucune, ce sont deux noms pour la même chose",
              "BindWidgetOptional remplit le pointeur à chaque image",
              "Avec BindWidgetOptional, un élément manquant laisse le pointeur à nullptr sans erreur : il faut le vérifier avant chaque usage",
              "BindWidgetOptional ne marche qu'avec des images",
            ],
            bonne: 2,
            explication:
              "BindWidget rend l'élément obligatoire (erreur de compilation du WBP s'il manque). Le projet n'utilise que BindWidget : chaque texte est obligatoire, donc le code n'a pas à tester nullptr.",
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
              "Le PlayerController appelle SetText sur le widget",
              "Le GameMode déclenche OnCountdownTick, auquel le widget s'est abonné dans NativeConstruct",
              "Le kart envoie son état au widget",
            ],
            bonne: 2,
            explication:
              "Le widget ne compte rien : il s'abonne à l'event OnCountdownTick du GameMode, qui appelle HandleCountdownTick avec le bon chiffre.",
          },
          {
            type: "code",
            enonce: "Le niveau utilise un autre GameMode que AKartGameMode. Que se passe-t-il dans NativeConstruct ?",
            code: "SetVisibility(ESlateVisibility::Collapsed);\n\nif (AKartGameMode* GameMode = GetWorld()->GetAuthGameMode<AKartGameMode>())\n{\n\tGameMode->OnCountdownTick.AddUniqueDynamic(this, &UKartCountdownWidget::HandleCountdownTick);",
            choix: [
              "Le jeu plante sur la ligne AddUniqueDynamic",
              "GetAuthGameMode renvoie nullptr : tout le bloc est sauté et le widget reste caché",
              "Le widget s'abonne au GameMode par défaut d'Unreal",
              "Le widget affiche « 3 » tout de suite",
            ],
            bonne: 1,
            explication:
              "GetAuthGameMode<AKartGameMode>() renvoie nullptr si le GameMode n'est pas un AKartGameMode. Le if est faux : pas d'abonnement, et le widget reste en Collapsed.",
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
            type: "vrai-faux",
            enonce: "Avec AddUniqueDynamic, si NativeConstruct était appelé deux fois sans NativeDestruct entre les deux, HandleCountdownTick serait appelée deux fois par chiffre.",
            choix: ["Vrai", "Faux"],
            bonne: 1,
            explication:
              "C'est justement ce qu'évite AddUniqueDynamic : la fonction n'est abonnée qu'une fois. Avec AddDynamic, elle pourrait l'être deux fois.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi NativeDestruct appelle-t-il RemoveDynamic ?",
            choix: [
              "Pour remettre le compte à rebours à 3",
              "Parce que sinon le widget ne s'affiche pas la fois suivante",
              "Pour libérer le texte CountdownText",
              "Pour que le GameMode n'appelle pas un widget qui n'existe plus",
            ],
            bonne: 3,
            explication:
              "Chaque abonnement doit être défait quand le widget disparaît. On arrête aussi le timer pour qu'il ne rappelle pas HideCountdown plus tard.",
          },
          {
            type: "code",
            enonce: "Pourquoi Super::NativeDestruct() est-il appelé à la fin, et pas au début comme Super::NativeConstruct() ?",
            code: "if (UWorld* World = GetWorld())\n{\n\tWorld->GetTimerManager().ClearTimer(HideTimer);\n\n\tif (AKartGameMode* GameMode = World->GetAuthGameMode<AKartGameMode>())\n\t{\n\t\tGameMode->OnCountdownTick.RemoveDynamic(this, &UKartCountdownWidget::HandleCountdownTick);\n\t}\n}\n\nSuper::NativeDestruct();",
            choix: [
              "On range d'abord ses affaires (timer, abonnement), puis la classe parente termine la destruction",
              "Parce que Super doit toujours être la dernière ligne d'une fonction",
              "Parce que GetWorld() n'existe qu'après Super::NativeDestruct()",
              "Ça ne change rien, l'ordre est libre",
            ],
            bonne: 0,
            explication:
              "À la construction, le parent prépare le widget avant nous ; à la destruction, on fait notre ménage tant que tout existe encore, puis le parent finit.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le widget se met-il en HitTestInvisible plutôt qu'en Visible ?",
            choix: [
              "Pour que le texte soit transparent",
              "Parce que Visible ne marche pas en C++",
              "Le texte s'affiche, mais la souris passe au travers sans être bloquée",
              "Pour que le widget ne reçoive pas de NativeTick",
            ],
            bonne: 2,
            explication:
              "HitTestInvisible affiche le widget sans qu'il intercepte les clics. Un widget Visible en plein écran pourrait voler les clics destinés au jeu ou à un autre widget.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi HandleCountdownTick appelle-t-il ClearTimer(HideTimer) à chaque nouveau chiffre ?",
            choix: [
              "Pour que le chiffre suivant arrive plus vite",
              "Si la course est relancée pendant que « GO! » est affiché, l'ancien timer ne doit pas cacher le nouveau « 3 »",
              "Parce qu'un timer ne peut être lancé qu'une fois par partie",
              "Pour remettre GoDisplayTime à sa valeur par défaut",
            ],
            bonne: 1,
            explication:
              "Le timer du GO est encore en cours pendant GoDisplayTime secondes. Sans ClearTimer, il appellerait HideCountdown au milieu du nouveau décompte.",
          },
          {
            type: "code",
            enonce: "Pourquoi passer par FText::AsNumber au lieu de donner Number directement ?",
            code: "if (Number > 0)\n{\n\tCountdownText->SetText(FText::AsNumber(Number));\n}",
            choix: [
              "Pour arrondir le chiffre",
              "Pour afficher le chiffre en toutes lettres",
              "Parce que Number peut être négatif",
              "Parce que SetText attend un FText, pas un int32",
            ],
            bonne: 3,
            explication:
              "Un TextBlock affiche du FText. FText::AsNumber convertit l'entier en texte affichable.",
          },
          {
            type: "code",
            enonce: "Un graphiste met Go Display Time à 0 dans WBP_Countdown. Que se passe-t-il au GO ?",
            code: "CountdownText->SetText(GoText);\nGetWorld()->GetTimerManager().SetTimer(HideTimer, this, &UKartCountdownWidget::HideCountdown,\n\tFMath::Max(GoDisplayTime, 0.01f), false);",
            choix: [
              "« GO! » reste affiché pour toujours, car un timer de 0 ne se lance pas",
              "« GO! » s'affiche un instant (0,01 seconde) puis le widget se cache",
              "Le timer se répète en boucle",
              "Le jeu plante",
            ],
            bonne: 1,
            explication:
              "FMath::Max(GoDisplayTime, 0.01f) garantit une durée strictement positive : le timer part bien et cache le widget presque tout de suite. Le false final veut dire que le timer ne se répète pas.",
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
            enonce: "Pourquoi ce widget déclare-t-il NativeTick, alors que le compte à rebours n'en a pas ?",
            choix: [
              "Parce que NativeTick est obligatoire pour s'afficher",
              "Parce que NativeTick remplace NativeConstruct",
              "Pour pouvoir s'abonner à OnRaceStarted",
              "Parce que le chrono change à chaque image : il faut le réécrire en continu",
            ],
            bonne: 3,
            explication:
              "Le compte à rebours ne change qu'une fois par seconde et attend les events du GameMode. Le chrono, lui, avance en continu.",
          },
          {
            type: "code",
            enonce: "Que fera notre code des paramètres MyGeometry et InDeltaTime ?",
            code: "virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;",
            choix: [
              "Il les transmet simplement à Super::NativeTick",
              "Il additionne InDeltaTime pour calculer le chrono",
              "Il utilise MyGeometry pour placer le texte à l'écran",
              "Rien, et il n'appelle pas Super",
            ],
            bonne: 0,
            explication:
              "Ces paramètres sont imposés par UUserWidget. Le chrono vient du GameMode, pas d'une addition de DeltaTime faite par le widget.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le header annonce-t-il « class UTextBlock; » au lieu d'inclure Components/TextBlock.h ?",
            choix: [
              "Parce que UTextBlock est déclaré dans UserWidget.h",
              "Parce qu'il ne garde que des pointeurs vers des UTextBlock ; le .cpp, qui appelle SetText, fera l'include",
              "Parce que BindWidget inclut le header tout seul",
              "Parce qu'un header ne peut contenir qu'un seul include Unreal",
            ],
            bonne: 1,
            explication:
              "Un pointeur n'a besoin que de savoir que la classe existe. Pour appeler une fonction comme SetText, il faut la classe complète : c'est le travail du .cpp.",
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
              "Tu renommes le texte LapText en FinishedText",
              "Tu ajoutes un troisième BindWidget",
              "Tu changes Finished Text dans les Class Defaults de WBP_RaceHud, sans recompiler",
              "C'est impossible sans modifier le GameMode",
            ],
            bonne: 2,
            explication:
              "FinishedText est en EditAnywhere : sa valeur par défaut se change dans le WBP, catégorie Kart > Race.",
          },
          {
            type: "code",
            enonce: "Que se passerait-il si on retirait ce UFUNCTION() ?",
            code: "private:\n\t// Appelée par le GameMode au GO : on affiche le widget\n\tUFUNCTION()\n\tvoid HandleRaceStarted();",
            choix: [
              "Rien, une fonction private n'en a jamais besoin",
              "Le widget ne pourrait plus être affiché à l'écran",
              "La fonction deviendrait publique",
              "La fonction ne pourrait plus être abonnée à l'event OnRaceStarted du GameMode",
            ],
            bonne: 3,
            explication:
              "Comme HandleCountdownTick, cette fonction est branchée sur un event dynamique, qui la retrouve par son nom grâce à la réflexion : elle doit être une UFUNCTION.",
          },
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
            type: "vrai-faux",
            enonce: "Il faut recompiler le C++ avant de créer WBP_RaceHud, sinon KartRaceHudWidget n'est pas proposé comme classe parente.",
            choix: ["Vrai", "Faux"],
            bonne: 0,
            explication:
              "L'éditeur ne connaît une classe C++ qu'une fois le code compilé. C'est la première étape de la section « Dans l'éditeur ».",
          },
          {
            type: "qcm",
            enonce: "WBP_RaceHud compile et a la bonne classe parente. Que reste-t-il à faire pour qu'il apparaisse en jeu ?",
            choix: [
              "L'ajouter à la main dans le niveau",
              "Le choisir dans la case Race Hud Widget Class de BP_KartPlayerController",
              "Appeler AddToViewport dans son Graph",
              "Rien, Unreal l'affiche automatiquement",
            ],
            bonne: 1,
            explication:
              "C'est le PlayerController qui crée les widgets à partir de ses deux cases TSubclassOf. Une fois les deux cases de Kart > UI remplies, tout est branché.",
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
            enonce: "Pourquoi KartRaceHudWidget.cpp inclut-il KartPawn.h, ce que ne fait pas le compte à rebours ?",
            choix: [
              "Parce que le HUD crée le kart",
              "Pour pouvoir déplacer le kart au GO",
              "Parce que le HUD lit le tour actuel et le temps d'arrivée directement sur le kart du joueur",
              "Parce que GetOwningPlayerPawn est déclarée dans KartPawn.h",
            ],
            bonne: 2,
            explication:
              "Le tour actuel, la course finie et le temps d'arrivée viennent de GetCurrentLap(), HasFinishedRace() et GetFinishTime(), des fonctions du kart.",
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
            enonce: "Pourquoi le chrono est-il mis à jour dans NativeTick et pas avec un event du GameMode ?",
            choix: [
              "Parce que les widgets ne peuvent pas s'abonner aux events",
              "Parce que le temps change à chaque image : il n'y a pas de moment précis à annoncer",
              "Parce que NativeTick est plus rapide qu'un event",
              "Parce que le GameMode n'a pas de chrono",
            ],
            bonne: 1,
            explication:
              "Un event sert à annoncer un moment précis (le GO). Le chrono, lui, avance en continu : on le relit à chaque image.",
          },
          {
            type: "code",
            enonce: "Le joueur contrôle un Pawn qui n'est pas un kart. Que fait NativeTick ?",
            code: "const AKartPawn* Kart = GetOwningPlayerPawn<AKartPawn>();\n\nif (GameMode == nullptr || Kart == nullptr)\n{\n\treturn;\n}",
            choix: [
              "Il plante sur Kart->HasFinishedRace()",
              "Il affiche « Tour 0/3 »",
              "Il cherche le premier kart du niveau",
              "Kart vaut nullptr : la fonction sort sans rien afficher",
            ],
            bonne: 3,
            explication:
              "La version <AKartPawn> de GetOwningPlayerPawn fait le Cast et renvoie nullptr si le Pawn n'est pas un kart. Le test qui suit fait sortir la fonction : on n'utilise jamais un pointeur nul.",
          },
          {
            type: "code",
            enonce: "À quoi sert ce bloc de NativeTick ?",
            code: "if (!GameMode->IsRaceStarted())\n{\n\tSetVisibility(ESlateVisibility::Collapsed);\n\treturn;\n}",
            choix: [
              "À cacher le HUD quand le GameMode relance un compte à rebours, puisqu'aucun event ne le prévient",
              "À cacher le HUD quand le joueur a fini la course",
              "À cacher le HUD pendant la pause",
              "À rien : NativeConstruct l'a déjà caché",
            ],
            bonne: 0,
            explication:
              "Après StartCountdown, IsRaceStarted() redevient faux. Le HUD s'en rend compte lui-même, se met en Collapsed et attend le prochain OnRaceStarted.",
          },
          {
            type: "qcm",
            enonce: "Le joueur vient de finir la course. Qu'affiche le HUD ?",
            choix: [
              "Le chrono continue de tourner et le tour reste à 3/3",
              "Le widget se cache",
              "Le meilleur tour du joueur",
              "Le temps d'arrivée du kart, figé, et FinishedText à la place du tour",
            ],
            bonne: 3,
            explication:
              "Quand HasFinishedRace() est vrai, le chrono affiche GetFinishTime() du kart (qui ne bouge plus) et le texte du tour devient FinishedText.",
          },
          {
            type: "code",
            enonce: "Pourquoi peut-on appeler FormatRaceTime avec le nom de la classe, sans passer par le pointeur GameMode ?",
            code: "TimerText->SetText(AKartGameMode::FormatRaceTime(GameMode->GetRaceTime()));",
            choix: [
              "Parce que GameMode est const",
              "Parce que c'est une fonction static : elle n'a pas besoin d'un GameMode précis",
              "Parce que le widget hérite de AKartGameMode",
              "Parce que les fonctions BlueprintPure s'appellent toujours ainsi",
            ],
            bonne: 1,
            explication:
              "Une fonction static ne dépend d'aucun objet : on l'appelle avec AKartGameMode:: suivi de son nom. Elle transforme des secondes en texte comme « 01:23.500 ».",
          },
          {
            type: "code",
            enonce: "Que s'affiche-t-il pendant le deuxième tour d'une course de 3 tours ?",
            code: "LapText->SetText(FText::Format(NSLOCTEXT(\"Kart\", \"LapFormat\", \"Tour {0}/{1}\"),\n\tFText::AsNumber(Kart->GetCurrentLap()), FText::AsNumber(GameMode->GetLapCount())));",
            choix: [
              "Tour {0}/{1}",
              "Tour 3/2",
              "LapFormat 2/3",
              "Tour 2/3",
            ],
            bonne: 3,
            explication:
              "FText::Format remplace {0} par le premier argument (le tour actuel, 2) et {1} par le second (le nombre de tours, 3). LapFormat est seulement la clé de traduction.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi le code utilise-t-il TimerText et LapText sans vérifier qu'ils ne valent pas nullptr ?",
            choix: [
              "Parce que les pointeurs TObjectPtr ne peuvent jamais être nuls",
              "Parce que BindWidget empêche le WBP de compiler si ces textes manquent",
              "Parce que NativeTick vérifie les pointeurs tout seul",
              "C'est un oubli qui fera planter le jeu",
            ],
            bonne: 1,
            explication:
              "Avec BindWidget, un WBP_RaceHud sans TimerText ou LapText ne compile pas. Le code peut donc compter sur leur présence.",
          },
          {
            type: "qcm",
            enonce: "Pourquoi construire « Tour 2/3 » avec FText::Format et un modèle NSLOCTEXT plutôt qu'en collant des FString ?",
            choix: [
              "Parce que FString ne sait pas contenir de chiffres",
              "Parce que FText::Format est plus rapide",
              "Parce que le modèle peut être traduit (« Lap {0}/{1} ») sans toucher au code",
              "Parce que SetText refuse tout texte construit par morceaux",
            ],
            bonne: 2,
            explication:
              "FText est le type des textes affichés au joueur. Avec un FString collé morceau par morceau, la traduction serait impossible.",
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
        choix: [
          "Le GameMode",
          "Le kart (AKartPawn)",
          "Le PlayerController du joueur local",
          "Le niveau",
        ],
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
        explication:
          "CreateWidget fabrique le widget et renvoie un pointeur ; AddToViewport l'ajoute ensuite à l'écran.",
      },
      {
        type: "code",
        enonce: "RaceHudWidgetClass contient WBP_RaceHud. Quel objet cette ligne fabrique-t-elle ?",
        code: "RaceHudWidget = CreateWidget<UKartRaceHudWidget>(this, RaceHudWidgetClass);",
        choix: [
          "Un UKartRaceHudWidget nu, sans l'apparence du WBP",
          "Un widget WBP_RaceHud (avec sa logique C++ héritée), rangé dans un pointeur de type UKartRaceHudWidget",
          "Une copie de la classe UKartRaceHudWidget",
          "Rien tant que AddToViewport n'est pas appelé",
        ],
        bonne: 1,
        explication:
          "CreateWidget fabrique un objet de la classe choisie dans l'éditeur, ici le Blueprint enfant. Comme il hérite de UKartRaceHudWidget, il tient dans ce pointeur et exécute le code C++.",
      },
      {
        type: "qcm",
        enonce: "Le compte à rebours n'apparaît pas, aucune erreur n'est affichée. Quelle cause est la plus probable ?",
        choix: [
          "Le texte du WBP ne s'appelle pas CountdownText",
          "La variable GoText est vide",
          "Le header n'a pas de #pragma once",
          "Le GameMode utilise la classe C++ AKartPlayerController au lieu de BP_KartPlayerController, dont la case est remplie",
        ],
        bonne: 3,
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
          "Dans le Graph, Class Settings > Parent Class, choisir KartCountdownWidget",
          "Glisser le fichier .h dans le Designer",
        ],
        bonne: 2,
        explication:
          "La classe parente se change dans Class Settings. Le nom de l'asset n'a aucun effet sur l'héritage.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi les deux widgets se mettent-ils en Collapsed dans NativeConstruct ?",
        choix: [
          "Pour ne rien montrer tant que le GameMode n'a pas annoncé un chiffre ou le GO",
          "Pour économiser la mémoire",
          "Parce que AddToViewport les rend toujours visibles en double",
          "Pour que le PlayerController puisse les détruire",
        ],
        bonne: 0,
        explication:
          "Le PlayerController les crée et les affiche dès le début de la partie. Ils restent invisibles jusqu'à ce que l'event du GameMode leur dise de s'afficher.",
      },
      {
        type: "code",
        enonce: "Quelle fonction complète l'abonnement du HUD à l'event du GO ?",
        code: "GameMode->OnRaceStarted.____(this, &UKartRaceHudWidget::HandleRaceStarted);",
        choix: [
          "RemoveDynamic",
          "Broadcast",
          "SetTimer",
          "AddUniqueDynamic",
        ],
        bonne: 3,
        explication:
          "AddUniqueDynamic abonne la fonction sans risque de doublon. RemoveDynamic fait l'inverse, Broadcast est appelé par le GameMode pour déclencher l'event.",
      },
      {
        type: "code",
        enonce: "Ces deux lignes du GameMode s'exécutent au GO. Que font les deux widgets ?",
        code: "OnCountdownTick.Broadcast(0);\nOnRaceStarted.Broadcast();",
        choix: [
          "Seul le HUD réagit : le compte à rebours a déjà disparu après le « 1 »",
          "Le compte à rebours affiche GoText et lance son timer, et le HUD de course devient visible",
          "Le HUD affiche « GO! » à la place du chrono",
          "Les deux widgets sont détruits et recréés",
        ],
        bonne: 1,
        explication:
          "Broadcast(0) appelle HandleCountdownTick avec 0 : le compte à rebours affiche GoText puis se cache après GoDisplayTime. Broadcast() sur OnRaceStarted appelle HandleRaceStarted : le HUD apparaît.",
      },
      {
        type: "code",
        enonce: "Les deux widgets rattrapent un départ manqué dans NativeConstruct. Pourquoi le compte à rebours teste-t-il !IsRaceStarted() alors que le HUD teste IsRaceStarted() ?",
        code: "// Compte à rebours\nif (!GameMode->IsRaceStarted() && GameMode->GetCountdownNumber() > 0)\n\n// HUD de course\nif (GameMode->IsRaceStarted())",
        choix: [
          "C'est une erreur : les deux devraient tester la même chose",
          "Le compte à rebours ne doit s'afficher que pendant le décompte, le HUD seulement une fois la course lancée",
          "Parce que IsRaceStarted() ne marche que dans un HUD",
          "Pour que les deux widgets soient visibles en même temps pendant le « 3, 2, 1 »",
        ],
        bonne: 1,
        explication:
          "Chaque widget a sa propre période : le chiffre avant le GO, le chrono après. Un widget créé en retard s'affiche donc seulement si c'est son moment.",
      },
      {
        type: "qcm",
        enonce: "Pourquoi HandleCountdownTick et HandleRaceStarted ont-elles un UFUNCTION() alors qu'elles sont privées ?",
        choix: [
          "Pour qu'on puisse les appeler depuis un Blueprint",
          "Pour les afficher dans le panneau Details",
          "Parce qu'une fonction abonnée à un delegate dynamique doit être une UFUNCTION",
          "Parce que toutes les fonctions d'un widget doivent l'avoir",
        ],
        bonne: 2,
        explication:
          "Les delegates dynamiques retrouvent la fonction par son nom grâce au système de réflexion d'Unreal : elle doit donc être déclarée avec UFUNCTION.",
      },
      {
        type: "qcm",
        enonce: "Dans NativeDestruct, qu'est-ce que le compte à rebours fait de plus que le HUD de course ?",
        choix: [
          "Il arrête son timer HideTimer avec ClearTimer",
          "Il se désabonne du GameMode",
          "Il appelle Super::NativeDestruct()",
          "Rien, les deux fonctions sont identiques",
        ],
        bonne: 0,
        explication:
          "Les deux se désabonnent avec RemoveDynamic et appellent Super à la fin. Seul le compte à rebours a un timer, qui ne doit pas rappeler HideCountdown sur un widget détruit.",
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
          "Le premier kart trouvé dans le niveau",
          "Le kart en tête de la course",
          "Le PlayerController du joueur",
          "Le kart du joueur qui possède le widget, ou nullptr si son Pawn n'est pas un kart",
        ],
        bonne: 3,
        explication:
          "Le propriétaire du widget est le PlayerController passé en this à CreateWidget. La fonction renvoie le Pawn qu'il contrôle, converti en AKartPawn.",
      },
      {
        type: "vrai-faux",
        enonce: "Le GameMode garde un pointeur vers chaque widget pour leur dire quoi afficher.",
        choix: ["Vrai", "Faux"],
        bonne: 1,
        explication:
          "Le GameMode ne sait rien des widgets : il broadcast ses events à qui veut les entendre. Ce sont les widgets qui s'abonnent et lisent ses valeurs.",
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
