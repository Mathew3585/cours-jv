#include "KartRaceHudWidget.h"

#include "Components/TextBlock.h"
#include "KartGameMode.h"
#include "KartPawn.h"

void UKartRaceHudWidget::NativeConstruct()
{
	Super::NativeConstruct();

	// Caché pendant le compte à rebours : le chrono n'apparaît qu'au GO
	SetVisibility(ESlateVisibility::Collapsed);

	if (AKartGameMode* GameMode = GetWorld()->GetAuthGameMode<AKartGameMode>())
	{
		// Le GameMode nous préviendra au GO
		GameMode->OnRaceStarted.AddUniqueDynamic(this, &UKartRaceHudWidget::HandleRaceStarted);

		// Si le widget est créé alors que la course a déjà commencé (ou sans compte à rebours), on s'affiche tout de suite
		if (GameMode->IsRaceStarted())
		{
			HandleRaceStarted();
		}
	}
}

void UKartRaceHudWidget::NativeDestruct()
{
	// On se désabonne : le GameMode ne doit pas appeler un widget qui n'existe plus
	if (UWorld* World = GetWorld())
	{
		if (AKartGameMode* GameMode = World->GetAuthGameMode<AKartGameMode>())
		{
			GameMode->OnRaceStarted.RemoveDynamic(this, &UKartRaceHudWidget::HandleRaceStarted);
		}
	}

	Super::NativeDestruct();
}

void UKartRaceHudWidget::HandleRaceStarted()
{
	// HitTestInvisible : visible mais ne bloque jamais la souris
	SetVisibility(ESlateVisibility::HitTestInvisible);
}

void UKartRaceHudWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	const AKartGameMode* GameMode = GetWorld()->GetAuthGameMode<AKartGameMode>();

	// GetOwningPlayerPawn = le pawn du joueur à qui appartient ce widget (ici son kart)
	// Le <AKartPawn> fait le Cast pour nous : nullptr si le pawn n'est pas un kart
	const AKartPawn* Kart = GetOwningPlayerPawn<AKartPawn>();

	if (GameMode == nullptr || Kart == nullptr)
	{
		return;
	}

	// Course relancée (nouveau compte à rebours) : on se cache jusqu'au prochain GO
	if (!GameMode->IsRaceStarted())
	{
		SetVisibility(ESlateVisibility::Collapsed);
		return;
	}

	if (Kart->HasFinishedRace())
	{
		// Course finie : le chrono reste figé sur le temps d'arrivée
		TimerText->SetText(AKartGameMode::FormatRaceTime(Kart->GetFinishTime()));
		LapText->SetText(FinishedText);
	}
	else
	{
		TimerText->SetText(AKartGameMode::FormatRaceTime(GameMode->GetRaceTime()));

		// FText::Format remplace {0} et {1} par les valeurs données, dans l'ordre : "Tour 2/3"
		// On passe par FText (et pas FString) car c'est le type de texte que les widgets affichent
		LapText->SetText(FText::Format(NSLOCTEXT("Kart", "LapFormat", "Tour {0}/{1}"),
			FText::AsNumber(Kart->GetCurrentLap()), FText::AsNumber(GameMode->GetLapCount())));
	}
}
