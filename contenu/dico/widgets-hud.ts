import type { EntreeDico } from "@/contenu/types";

// Termes ajoutés par le module « Widgets HUD » (projet Mario Kart).
export const termes: EntreeDico[] = [
  {
    id: "umg",
    mot: "UMG",
    categorie: "Système Unreal",
    definition:
      "Unreal Motion Graphics : le système d'interface d'Unreal. On dessine les écrans (menus, HUD) dans l'éditeur de Widget Blueprint, en plaçant des textes, images et boutons. En C++, il faut ajouter le module \"UMG\" dans le fichier .Build.cs pour s'en servir.",
    simple: "L'outil d'Unreal pour fabriquer l'interface du jeu.",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/umg-ui-designer-for-unreal-engine",
  },
  {
    id: "uuserwidget",
    mot: "UUserWidget",
    categorie: "Classe Unreal",
    definition:
      "Classe de base de tous les widgets qu'on crée soi-même avec UMG. Un Widget Blueprint hérite de UUserWidget, ou d'une classe C++ qui en hérite. Le préfixe U signale un UObject qui n'est pas un Actor : un widget n'est pas posé dans le niveau.",
    simple: "Un morceau d'interface : un écran, un HUD, un menu.",
    code: "class UKartCountdownWidget : public UUserWidget",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/umg-ui-designer-for-unreal-engine",
  },
  {
    id: "widget-blueprint",
    mot: "Widget Blueprint (WBP)",
    categorie: "Système Unreal",
    definition:
      "Asset créé dans le Content Browser (clic droit > User Interface > Widget Blueprint). Son onglet Designer sert à placer les éléments visuels, son onglet Graph à écrire de la logique en Blueprint. Par convention son nom commence par WBP_.",
    simple: "Le fichier de l'éditeur où l'on dessine un widget.",
  },
  {
    id: "classe-parente",
    mot: "Classe parente (Parent Class)",
    categorie: "Concept",
    definition:
      "La classe dont une autre hérite. Pour qu'un Blueprint utilise du code C++, sa classe parente doit être la classe C++. Dans un Widget Blueprint, on la choisit ou on la change dans Class Settings > Parent Class (on dit « reparenter »).",
    simple: "La classe dont on hérite tout le code.",
    code: "class UKartRaceHudWidget : public UUserWidget // UUserWidget est la classe parente",
  },
  {
    id: "bindwidget",
    mot: "BindWidget",
    categorie: "Macro Unreal",
    definition:
      "Option meta d'un UPROPERTY dans une classe C++ de widget. Au moment de créer le widget, Unreal remplit le pointeur avec l'élément du Widget Blueprint qui porte exactement le même nom et le même type. Si l'élément manque, le Widget Blueprint refuse de compiler.",
    simple: "« Branche ce pointeur sur l'élément du WBP qui a ce nom. »",
    code: "UPROPERTY(meta = (BindWidget))\nTObjectPtr<UTextBlock> CountdownText;",
  },
  {
    id: "utextblock",
    mot: "UTextBlock",
    categorie: "Classe Unreal",
    definition:
      "Le widget « Text » de la palette UMG : il affiche un texte. On change ce qu'il affiche avec SetText, qui attend un FText.",
    simple: "Une étiquette de texte à l'écran.",
    code: "CountdownText->SetText(GoText);",
  },
  {
    id: "tsubclassof",
    mot: "TSubclassOf",
    categorie: "C++",
    definition:
      "Variable qui contient une classe (pas un objet) : cette classe ou une de ses classes filles. Dans l'éditeur, le menu déroulant ne propose que les classes compatibles. On s'en sert pour dire « quel type d'objet créer » sans l'écrire en dur dans le code.",
    simple: "Un tiroir où l'on range un modèle à fabriquer, pas l'objet fabriqué.",
    code: "TSubclassOf<UKartCountdownWidget> CountdownWidgetClass;",
  },
  {
    id: "createwidget",
    mot: "CreateWidget",
    categorie: "Fonction Unreal",
    definition:
      "Fonction qui fabrique un widget à partir d'une classe et d'un propriétaire (ici le PlayerController). Elle renvoie un pointeur vers le widget créé, mais ne l'affiche pas encore.",
    simple: "Fabrique le widget, sans le montrer.",
    code: "CreateWidget<UKartCountdownWidget>(this, CountdownWidgetClass);",
  },
  {
    id: "addtoviewport",
    mot: "AddToViewport",
    categorie: "Fonction Unreal",
    definition:
      "Fonction qui ajoute un widget à l'écran du jeu (le viewport). Tant qu'on ne l'appelle pas, un widget créé existe en mémoire mais reste invisible.",
    simple: "Colle le widget sur l'écran.",
    code: "CountdownWidget->AddToViewport();",
  },
  {
    id: "islocalcontroller",
    mot: "IsLocalController",
    categorie: "Fonction Unreal",
    definition:
      "Fonction d'un Controller qui renvoie vrai s'il appartient à un joueur qui joue sur cette machine. En réseau, le serveur possède aussi les PlayerControllers des autres joueurs : ceux-là ne sont pas locaux et n'ont pas d'écran à remplir.",
    simple: "« Ce joueur est-il assis devant cet écran ? »",
    code: "if (!IsLocalController()) { return; }",
  },
  {
    id: "nativeconstruct",
    mot: "NativeConstruct",
    categorie: "Fonction Unreal",
    definition:
      "Fonction C++ d'un UUserWidget appelée quand le widget est construit et ajouté à l'écran, après que les pointeurs BindWidget ont été remplis. C'est l'équivalent C++ de l'event Construct du Blueprint : on y prépare l'affichage et on s'abonne aux events.",
    simple: "Le BeginPlay d'un widget.",
    code: "virtual void NativeConstruct() override;",
  },
  {
    id: "nativedestruct",
    mot: "NativeDestruct",
    categorie: "Fonction Unreal",
    definition:
      "Fonction C++ d'un UUserWidget appelée quand le widget est retiré de l'écran. On y défait ce qu'on a fait dans NativeConstruct : se désabonner des events, arrêter les timers.",
    simple: "Le rangement avant que le widget disparaisse.",
    code: "virtual void NativeDestruct() override;",
  },
  {
    id: "nativetick",
    mot: "NativeTick",
    categorie: "Fonction Unreal",
    definition:
      "Fonction C++ d'un UUserWidget appelée à chaque image pendant que le widget est affiché. Elle reçoit la géométrie du widget (sa taille et sa position à l'écran) et le temps écoulé depuis l'image précédente.",
    simple: "Le Tick d'un widget.",
    code: "virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;",
  },
  {
    id: "ftext",
    mot: "FText",
    categorie: "Classe Unreal",
    definition:
      "Le type de texte destiné au joueur. Contrairement à FString, un FText peut être traduit (localisé) et sait formater les nombres selon la langue. Les widgets texte affichent des FText. FText::AsNumber transforme un nombre en texte, FText::Format remplace {0}, {1}… dans un modèle.",
    simple: "Le texte qu'on montre au joueur, prêt à être traduit.",
    code: 'FText::Format(NSLOCTEXT("Kart", "LapFormat", "Tour {0}/{1}"), A, B)',
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/text-localization-in-unreal-engine",
  },
  {
    id: "nsloctext",
    mot: "NSLOCTEXT",
    categorie: "Macro Unreal",
    definition:
      "Macro qui crée un FText traduisible à partir de trois morceaux : un espace de noms, une clé unique et le texte dans la langue d'origine. Les outils de traduction d'Unreal retrouvent le texte grâce à l'espace de noms et à la clé.",
    simple: "Un texte avec une étiquette pour pouvoir le traduire plus tard.",
    code: 'NSLOCTEXT("Kart", "Go", "GO!")',
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/text-localization-in-unreal-engine",
  },
  {
    id: "blueprintimplementableevent",
    mot: "BlueprintImplementableEvent",
    categorie: "Macro Unreal",
    definition:
      "Option d'UFUNCTION : la fonction est déclarée en C++ mais n'a pas de code en C++. C'est le Blueprint enfant qui écrit son contenu, sous la forme d'un event rouge. Le C++ peut l'appeler ; si le Blueprint ne l'a pas implémentée, l'appel ne fait rien.",
    simple: "Le C++ sonne la cloche, le Blueprint décide quoi faire.",
    code: "UFUNCTION(BlueprintImplementableEvent)\nvoid OnCountdownNumberShown(int32 Number);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/ufunctions-in-unreal-engine",
  },
  {
    id: "eslatevisibility",
    mot: "ESlateVisibility",
    categorie: "Classe Unreal",
    definition:
      "Énumération qui règle la visibilité d'un widget. Visible : affiché et cliquable. HitTestInvisible : affiché, mais la souris passe au travers. Hidden : invisible mais garde sa place. Collapsed : invisible et ne prend plus de place.",
    simple: "Le réglage « montré, caché ou transparent aux clics » d'un widget.",
    code: "SetVisibility(ESlateVisibility::Collapsed);",
  },
  {
    id: "adduniquedynamic",
    mot: "AddUniqueDynamic / RemoveDynamic",
    categorie: "Macro Unreal",
    definition:
      "Variantes de AddDynamic. AddUniqueDynamic abonne une fonction à un delegate dynamique, mais ne l'ajoute pas si elle est déjà abonnée : elle ne sera jamais appelée deux fois pour le même event. RemoveDynamic fait l'inverse et la désabonne. La fonction doit être une UFUNCTION avec les mêmes paramètres que le delegate.",
    simple: "S'inscrire à un event, ou s'en désinscrire.",
    code: "GameMode->OnRaceStarted.AddUniqueDynamic(this, &UKartRaceHudWidget::HandleRaceStarted);",
  },
  {
    id: "getowningplayerpawn",
    mot: "GetOwningPlayerPawn",
    categorie: "Fonction Unreal",
    definition:
      "Fonction d'un UUserWidget qui renvoie le Pawn contrôlé par le joueur propriétaire du widget (celui passé à CreateWidget). La version avec un type entre chevrons fait aussi le Cast et renvoie nullptr si le Pawn n'est pas de ce type.",
    simple: "« Donne-moi le personnage du joueur à qui j'appartiens. »",
    code: "const AKartPawn* Kart = GetOwningPlayerPawn<AKartPawn>();",
  },
];
