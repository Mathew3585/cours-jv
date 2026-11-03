#include "KartGameMode.h"

#include "Engine/Engine.h"
#include "EngineUtils.h"
#include "Kismet/GameplayStatics.h"
#include "KartPawn.h"
#include "KartPlayerController.h"
#include "LapZone.h"
#include "TimerManager.h"

AKartGameMode::AKartGameMode()
{
	// C'est le PlayerController qui crée les widgets (compte à rebours et chrono)
	PlayerControllerClass = AKartPlayerController::StaticClass();

	// Le Tick sert seulement à afficher le chrono en texte de debug
	PrimaryActorTick.bCanEverTick = true;
}

void AKartGameMode::BeginPlay()
{
	Super::BeginPlay();

	CountCheckpoints();

	if (bUseCountdown)
	{
		StartCountdown();
	}
	else
	{
		// Pas de compte à rebours : la course (et le chrono) commence tout de suite
		bRaceStarted = true;
		RaceStartTime = GetWorld()->GetTimeSeconds();
	}
}

void AKartGameMode::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (bShowDebugText)
	{
		ShowRaceDebugText();
	}
}

void AKartGameMode::StartCountdown()
{
	bRaceStarted = false;
	CountdownNumber = 0;
	SetAllKartsCanMove(false);
	
	for (TActorIterator<AKartPawn> It(GetWorld()); It; ++It)
	{
		It->ResetRaceProgress();
	}
	
	if (StartDelay > 0.f)
	{
		GetWorldTimerManager().SetTimer(CountdownTimer, this, &AKartGameMode::BeginCountdown, StartDelay, false);
	}
	else
	{
		BeginCountdown();
	}
}

void AKartGameMode::BeginCountdown()
{
	CountdownNumber = CountdownSeconds;
	ShowDebugText(FString::FromInt(CountdownNumber), FColor::Red, 1.f);
	OnCountdownTick.Broadcast(CountdownNumber);
	
	GetWorldTimerManager().SetTimer(CountdownTimer, this, &AKartGameMode::CountdownStep, 1.f, true);
}

void AKartGameMode::CountdownStep()
{
	--CountdownNumber;

	if (CountdownNumber <= 0)
	{
		StartRace();
		return;
	}

	ShowDebugText(FString::FromInt(CountdownNumber), FColor::Red, 1.f);
	OnCountdownTick.Broadcast(CountdownNumber);
}

void AKartGameMode::StartRace()
{
	GetWorldTimerManager().ClearTimer(CountdownTimer);

	CountdownNumber = 0;
	bRaceStarted = true;
	SetAllKartsCanMove(true);

	// Le chrono part au GO : on retient l'heure actuelle du jeu
	// GetTimeSeconds = secondes écoulées depuis le lancement du niveau, en temps de JEU :
	// il s'arrête quand le jeu est en pause et suit les ralentis, c'est ce qu'on veut pour un chrono de course
	// (GetRealTimeSeconds, lui, continuerait de compter pendant la pause)
	RaceStartTime = GetWorld()->GetTimeSeconds();

	ShowDebugText(TEXT("GO!"), FColor::Green, GoMessageDuration);
	OnCountdownTick.Broadcast(0);
	OnRaceStarted.Broadcast();
}

float AKartGameMode::GetRaceTime() const
{
	// Avant le GO, le chrono reste à 0
	if (!IsRaceStarted())
	{
		return 0.f;
	}

	// Temps de la course = heure actuelle - heure du GO
	// On ne compte pas les secondes nous-mêmes dans un Tick : en soustrayant on n'accumule aucune erreur d'arrondi
	return GetWorld()->GetTimeSeconds() - RaceStartTime;
}

void AKartGameMode::NotifyKartFinished(AKartPawn* Kart)
{
	// Le kart a fini : il ne répond plus aux touches et ralentit tout seul jusqu'à l'arrêt
	Kart->SetCanMove(false);

	// On prévient les abonnés (widget, BP d'écran de fin, son...)
	OnKartFinished.Broadcast(Kart);
}

FText AKartGameMode::FormatRaceTime(float Seconds)
{
	// Max : un temps négatif n'a pas de sens, on le ramène à 0
	Seconds = FMath::Max(Seconds, 0.f);

	// FloorToInt = arrondi vers le bas en nombre entier (83.5 / 60 = 1.39 -> 1 minute)
	// On ne prend pas RoundToInt (arrondi au plus proche) : 1.6 minute donnerait 2, alors que la 2e minute n'est pas finie
	const int32 Minutes = FMath::FloorToInt(Seconds / 60.f);

	// Fmod = le reste d'une division, comme % mais pour les nombres à virgule (83.5 Fmod 60 = 23.5)
	// % ne marche qu'avec des entiers (int), on perdrait les millisecondes : c'est pour ça qu'on prend Fmod
	const float SecondsInMinute = FMath::Fmod(Seconds, 60.f);

	// Les secondes entières (23.5 -> 23), puis ce qui reste après la virgule converti en millisecondes (0.5 -> 500)
	const int32 WholeSeconds = FMath::FloorToInt(SecondsInMinute);
	const int32 Milliseconds = FMath::FloorToInt((SecondsInMinute - WholeSeconds) * 1000.f);

	// Printf remplit le texte avec les nombres : %02d = entier sur 2 chiffres minimum, complété par des 0 (5 -> "05")
	// %03d = pareil sur 3 chiffres (7 -> "007"), ce qui donne "01:23.500"
	return FText::FromString(FString::Printf(TEXT("%02d:%02d.%03d"), Minutes, WholeSeconds, Milliseconds));
}

void AKartGameMode::SetAllKartsCanMove(bool bCanMove) const
{
	for (TActorIterator<AKartPawn> It(GetWorld()); It; ++It)
	{
		It->SetCanMove(bCanMove);
	}
}

void AKartGameMode::CountCheckpoints()
{
	CheckpointCount = 0;
	bool bHasFinishLine = false;

	// TActorIterator parcourt tous les acteurs du niveau d'un type donné (ici toutes les ALapZone)
	for (TActorIterator<ALapZone> It(GetWorld()); It; ++It)
	{
		const int32 ZoneIndex = It->GetZoneIndex();

		if (ZoneIndex == 0)
		{
			bHasFinishLine = true;
		}

		// Les checkpoints sont numérotés 1, 2, 3... : le plus grand numéro = le nombre de checkpoints
		CheckpointCount = FMath::Max(CheckpointCount, ZoneIndex);
	}

	// Messages dans l'Output Log pour aider à monter le circuit
	if (!bHasFinishLine)
	{
		UE_LOG(LogTemp, Warning, TEXT("Aucune ALapZone avec ZoneIndex = 0 : il n'y a pas de ligne d'arrivée, les tours ne seront jamais comptés"));
	}
	else if (CheckpointCount == 0)
	{
		UE_LOG(LogTemp, Warning, TEXT("Aucun checkpoint (ALapZone avec ZoneIndex >= 1) : on peut valider des tours en faisant des allers-retours sur la ligne"));
	}
}

void AKartGameMode::ShowRaceDebugText() const
{
	if (GEngine == nullptr || !IsRaceStarted())
	{
		return;
	}

	// GetPlayerPawn(this, 0) = le pawn contrôlé par le joueur 0 (le premier joueur, celui qui joue sur cette machine)
	// Cast car GetPlayerPawn renvoie un APawn quelconque : on vérifie que c'est bien un kart
	const AKartPawn* Kart = Cast<AKartPawn>(UGameplayStatics::GetPlayerPawn(this, 0));
	if (Kart == nullptr)
	{
		return;
	}

	FString Text;
	if (Kart->HasFinishedRace())
	{
		// Le chrono s'arrête sur le temps d'arrivée du kart
		// L'étoile (*) devant un FString donne le texte brut que Printf attend avec %s
		Text = FString::Printf(TEXT("FINI !   %s"), *FormatRaceTime(Kart->GetFinishTime()).ToString());
	}
	else
	{
		Text = FString::Printf(TEXT("Tour %d/%d   %s"), Kart->GetCurrentLap(), LapCount, *FormatRaceTime(GetRaceTime()).ToString());
	}

	// Durée 0 = le message ne dure qu'une frame, il est réécrit à chaque Tick avec le nouveau temps
	// Clé 101 (différente du 100 du compte à rebours) pour que les deux messages ne se remplacent pas
	GEngine->AddOnScreenDebugMessage(101, 0.f, FColor::White, Text, true, FVector2D(RaceDebugTextScale, RaceDebugTextScale));
}

void AKartGameMode::ShowDebugText(const FString& Text, const FColor& Color, float Duration) const
{
	if (!bShowDebugText || GEngine == nullptr)
	{
		return;
	}

	// Même clé à chaque fois : le nouveau chiffre remplace l'ancien
	GEngine->AddOnScreenDebugMessage(100, Duration, Color, Text, true, FVector2D(DebugTextScale, DebugTextScale));
}
