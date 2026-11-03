#include "KartCountdownWidget.h"

#include "Components/TextBlock.h"
#include "KartGameMode.h"
#include "TimerManager.h"

void UKartCountdownWidget::NativeConstruct()
{
	Super::NativeConstruct();

	// Rien à afficher tant que le premier chiffre n'est pas arrivé
	SetVisibility(ESlateVisibility::Collapsed);

	if (AKartGameMode* GameMode = GetWorld()->GetAuthGameMode<AKartGameMode>())
	{
		GameMode->OnCountdownTick.AddUniqueDynamic(this, &UKartCountdownWidget::HandleCountdownTick);

		// Si le widget arrive en plein décompte, on affiche tout de suite le bon chiffre
		if (!GameMode->IsRaceStarted() && GameMode->GetCountdownNumber() > 0)
		{
			HandleCountdownTick(GameMode->GetCountdownNumber());
		}
	}
}

void UKartCountdownWidget::NativeDestruct()
{
	if (UWorld* World = GetWorld())
	{
		World->GetTimerManager().ClearTimer(HideTimer);

		if (AKartGameMode* GameMode = World->GetAuthGameMode<AKartGameMode>())
		{
			GameMode->OnCountdownTick.RemoveDynamic(this, &UKartCountdownWidget::HandleCountdownTick);
		}
	}

	Super::NativeDestruct();
}

void UKartCountdownWidget::HandleCountdownTick(int32 Number)
{
	// HitTestInvisible : visible mais ne bloque jamais la souris
	SetVisibility(ESlateVisibility::HitTestInvisible);
	GetWorld()->GetTimerManager().ClearTimer(HideTimer);

	if (Number > 0)
	{
		CountdownText->SetText(FText::AsNumber(Number));
	}
	else
	{
		// GO : on l'affiche un moment puis le widget disparaît
		CountdownText->SetText(GoText);
		GetWorld()->GetTimerManager().SetTimer(HideTimer, this, &UKartCountdownWidget::HideCountdown,
			FMath::Max(GoDisplayTime, 0.01f), false);
	}

	OnCountdownNumberShown(Number);
}

void UKartCountdownWidget::HideCountdown()
{
	SetVisibility(ESlateVisibility::Collapsed);
}
