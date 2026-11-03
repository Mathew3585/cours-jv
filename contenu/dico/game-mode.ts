import type { EntreeDico } from "@/contenu/types";

// Mots ajoutés par le module Game Mode.
export const termes: EntreeDico[] = [
  {
    id: "game-mode",
    mot: "GameMode",
    categorie: "Classe Unreal",
    definition:
      "Acteur unique qui porte les règles de la partie : quelles classes utiliser pour le joueur (Pawn, PlayerController), quand la partie commence, quand elle se termine. Il est créé automatiquement au lancement du niveau, d'après le réglage GameMode Override des World Settings ou celui du projet.",
    simple: "L'arbitre de la partie : il ne joue pas, il fait respecter les règles.",
    code: "class AKartGameMode : public AGameModeBase",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/game-mode-and-game-state-in-unreal-engine",
  },
  {
    id: "delegate",
    mot: "Delegate (event)",
    categorie: "Système Unreal",
    definition:
      "Variable à laquelle d'autres objets s'abonnent pour être prévenus quand quelque chose se passe. Les macros DECLARE_..._DELEGATE créent le type de l'event ; DYNAMIC le rend utilisable en Blueprint, MULTICAST autorise plusieurs abonnés.",
    simple: "Une sonnette : celui qui la déclenche ne sait pas qui l'entend, tous les abonnés sont prévenus.",
    code: "DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnCountdownTick, int32, Number);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/delegates-and-lambda-functions-in-unreal-engine",
  },
  {
    id: "broadcast",
    mot: "Broadcast",
    categorie: "Fonction Unreal",
    definition:
      "Fonction d'un delegate multicast qui prévient tous les abonnés en même temps, en leur passant les paramètres de l'event. S'il n'y a aucun abonné, il ne se passe rien.",
    simple: "Appuyer sur la sonnette.",
    code: "OnCountdownTick.Broadcast(CountdownNumber);",
  },
  {
    id: "blueprintassignable",
    mot: "BlueprintAssignable",
    categorie: "Macro Unreal",
    definition:
      "Option de UPROPERTY réservée aux delegates dynamic multicast : elle permet aux Blueprints (et aux widgets) de s'abonner à l'event, avec un nœud « Bind Event » ou « Assign ».",
    simple: "Autorise les Blueprints à s'abonner à cet event.",
    code: "UPROPERTY(BlueprintAssignable)\nFOnRaceStarted OnRaceStarted;",
  },
  {
    id: "timer",
    mot: "Timer (FTimerHandle)",
    categorie: "Système Unreal",
    definition:
      "Le Timer Manager du monde appelle une fonction après un délai, une seule fois ou en boucle. Le FTimerHandle est le ticket qui identifie ce timer : on le garde pour pouvoir le remplacer ou l'arrêter (ClearTimer).",
    simple: "Un minuteur de cuisine qui appelle une fonction quand il sonne.",
    code: "GetWorldTimerManager().SetTimer(Handle, this, &AMaClasse::MaFonction, 1.f, true);",
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-timers-in-unreal-engine",
  },
  {
    id: "tactoriterator",
    mot: "TActorIterator",
    categorie: "Classe Unreal",
    definition:
      "Outil qui parcourt un par un tous les acteurs d'un type donné présents dans le monde. On l'utilise dans une boucle for : It pointe sur l'acteur en cours, ++It passe au suivant, et la boucle s'arrête quand il n'y en a plus.",
    simple: "Faire l'appel de tous les acteurs d'un certain type dans le niveau.",
    code: "for (TActorIterator<AKartPawn> It(GetWorld()); It; ++It)",
  },
  {
    id: "ue-log",
    mot: "UE_LOG",
    categorie: "Macro Unreal",
    definition:
      "Macro qui écrit un message dans l'Output Log de l'éditeur. On lui donne une catégorie (LogTemp pour un usage rapide), une gravité (Log, Warning, Error) et le texte.",
    simple: "Écrire une note dans le journal de l'éditeur.",
    code: 'UE_LOG(LogTemp, Warning, TEXT("Attention !"));',
    lien: "https://dev.epicgames.com/documentation/en-us/unreal-engine/logging-in-unreal-engine",
  },
  {
    id: "debug-message",
    mot: "AddOnScreenDebugMessage",
    categorie: "Fonction Unreal",
    definition:
      "Fonction de GEngine qui affiche un texte à l'écran pendant le jeu, pour déboguer. On donne une clé (un message avec la même clé remplace le précédent), une durée en secondes, une couleur et le texte.",
    simple: "Un post-it affiché à l'écran pour tester.",
    code: 'GEngine->AddOnScreenDebugMessage(100, 1.f, FColor::Red, TEXT("3"));',
  },
  {
    id: "fonction-static",
    mot: "Fonction static",
    categorie: "C++",
    definition:
      "Fonction qui appartient à la classe et pas à un objet précis. Elle n'a pas accès aux variables d'un objet ; on l'appelle avec le nom de la classe suivi de ::.",
    simple: "Un outil rangé dans la classe, utilisable sans avoir d'objet sous la main.",
    code: "AKartGameMode::FormatRaceTime(83.5f);",
  },
  {
    id: "reference-const",
    mot: "Référence const (const &)",
    categorie: "C++",
    definition:
      "Paramètre passé par référence (&) pour éviter de copier un objet lourd comme un FString, et marqué const pour que la fonction ne puisse pas le modifier.",
    simple: "Prêter un livre à lire, sans le photocopier et sans droit d'écrire dedans.",
    code: "void ShowDebugText(const FString& Text);",
  },
  {
    id: "gettimeseconds",
    mot: "GetTimeSeconds",
    categorie: "Fonction Unreal",
    definition:
      "Fonction du monde (UWorld) qui renvoie le nombre de secondes de jeu écoulées depuis le lancement du niveau. Ce temps s'arrête pendant la pause et suit les ralentis, contrairement à GetRealTimeSeconds.",
    simple: "L'horloge du jeu, qui s'arrête quand le jeu est en pause.",
    code: "float Maintenant = GetWorld()->GetTimeSeconds();",
  },
  {
    id: "printf",
    mot: "FString::Printf",
    categorie: "Fonction Unreal",
    definition:
      "Construit un texte à partir d'un modèle et de valeurs. Dans le modèle, %d est remplacé par un entier, %s par un texte (passé avec *), %02d par un entier écrit sur au moins 2 chiffres.",
    simple: "Un texte à trous qu'on remplit avec des nombres.",
    code: 'FString::Printf(TEXT("Tour %d/%d"), Tour, Total);',
  },
];
