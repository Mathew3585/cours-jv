#include "KartPlayerController.h"

#include "KartCountdownWidget.h"
#include "KartRaceHudWidget.h"
#include "Items/KartItemWidget.h"

void AKartPlayerController::BeginPlay()
{
	Super::BeginPlay();

	// L'UI n'existe que pour le joueur qui joue sur cette machine
	if (!IsLocalController())
	{
		return;
	}

	if (CountdownWidgetClass != nullptr)
	{
		CountdownWidget = CreateWidget<UKartCountdownWidget>(this, CountdownWidgetClass);
		if (CountdownWidget != nullptr)
		{
			CountdownWidget->AddToViewport();
		}
	}

	// Même recette que les deux autres widgets : créer, vérifier, afficher
	if (ItemWidgetClass != nullptr)
	{
		ItemWidget = CreateWidget<UKartItemWidget>(this, ItemWidgetClass);
		if (ItemWidget != nullptr)
		{
			ItemWidget->AddToViewport();
		}
	}

	if (RaceHudWidgetClass != nullptr)
	{
		RaceHudWidget = CreateWidget<UKartRaceHudWidget>(this, RaceHudWidgetClass);
		if (RaceHudWidget != nullptr)
		{
			RaceHudWidget->AddToViewport();
		}
	}
}
