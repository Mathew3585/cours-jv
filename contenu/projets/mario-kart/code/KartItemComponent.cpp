#include "Items/KartItemComponent.h"

#include "Engine/Engine.h"
#include "Items/KartItemData.h"
#include "Items/KartItemPoolData.h"
#include "KartPawn.h"
#include "TimerManager.h"

UKartItemComponent::UKartItemComponent()
{
	// Le composant ne fait rien à chaque frame : il réagit aux boîtes, à la touche et à son timer
	PrimaryComponentTick.bCanEverTick = false;
}

bool UKartItemComponent::TryGiveRandomItem(UKartItemPoolData* Pool)
{
	// Une seule chose en poche à la fois : si on a déjà un objet (ou qu'il est en train d'arriver), on refuse
	if (Pool == nullptr || HasItem() || bRouletteRunning)
	{
		return false;
	}

	// Le résultat est tiré TOUT DE SUITE : la roulette n'est qu'une animation pour le suspense
	PendingItem = Pool->PickRandomItem();
	if (PendingItem == nullptr)
	{
		return false;
	}

	bRouletteRunning = true;
	OnRouletteStarted.Broadcast(Pool, RouletteDuration);

	if (RouletteDuration > 0.f)
	{
		// Dans RouletteDuration secondes, Unreal appellera FinishRoulette (une seule fois : false = pas de boucle)
		GetWorld()->GetTimerManager().SetTimer(RouletteTimer, this, &UKartItemComponent::FinishRoulette, RouletteDuration, false);
	}
	else
	{
		FinishRoulette();
	}

	return true;
}

void UKartItemComponent::FinishRoulette()
{
	bRouletteRunning = false;

	if (PendingItem != nullptr)
	{
		SetItem(PendingItem, PendingItem->Uses);
		PendingItem = nullptr;
	}
}

void UKartItemComponent::UseItem()
{
	// Pendant la roulette ou sans objet, la touche ne fait rien
	if (bRouletteRunning || CurrentItem == nullptr)
	{
		return;
	}

	// GetOwner = l'acteur qui porte ce composant (ici le kart)
	AKartPawn* Kart = Cast<AKartPawn>(GetOwner());

	// C'est le Data Asset qui fait l'effet : le composant ne sait pas (et n'a pas besoin de savoir) ce que fait l'objet
	// C'est ça le polymorphisme : on appelle Activate sur un UKartItemData, et c'est la version de l'enfant qui s'exécute
	if (!CurrentItem->Activate(Kart))
	{
		return;
	}

	// Une utilisation de moins. Plus rien : la poche se vide
	if (UsesLeft > 1)
	{
		SetItem(CurrentItem, UsesLeft - 1);
	}
	else
	{
		SetItem(nullptr, 0);
	}
}

void UKartItemComponent::ClearItem()
{
	GetWorld()->GetTimerManager().ClearTimer(RouletteTimer);
	bRouletteRunning = false;
	PendingItem = nullptr;
	SetItem(nullptr, 0);
}

void UKartItemComponent::SetItem(UKartItemData* NewItem, int32 NewUses)
{
	CurrentItem = NewItem;
	UsesLeft = NewUses;

	// Tous les abonnés (le widget de la case d'objet...) sont prévenus en même temps
	OnItemChanged.Broadcast(CurrentItem, UsesLeft);

	if (bShowDebugText && GEngine != nullptr)
	{
		const FString ItemName = CurrentItem != nullptr ? CurrentItem->DisplayName.ToString() : TEXT("aucun");
		GEngine->AddOnScreenDebugMessage(10, 2.f, FColor::Green, FString::Printf(TEXT("Objet : %s x%d"), *ItemName, UsesLeft));
	}
}
