#include "Items/KartItemWidget.h"

#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/PlayerController.h"
#include "Items/KartItemComponent.h"
#include "Items/KartItemData.h"
#include "Items/KartItemPoolData.h"

void UKartItemWidget::NativeConstruct()
{
	Super::NativeConstruct();

	// Au départ la poche est vide
	ShowIcon(nullptr);
	UsesText->SetText(FText::GetEmpty());

	// Le widget peut être créé avant que le joueur ait son kart : on écoute donc le PlayerController,
	// qui nous préviendra à chaque fois qu'il prend un nouveau pawn
	if (APlayerController* PlayerController = GetOwningPlayer())
	{
		PlayerController->OnPossessedPawnChanged.AddUniqueDynamic(this, &UKartItemWidget::HandlePossessedPawnChanged);
		BindToPawn(PlayerController->GetPawn());
	}
}

void UKartItemWidget::NativeDestruct()
{
	// On se désabonne de tout : personne ne doit appeler un widget qui n'existe plus
	if (APlayerController* PlayerController = GetOwningPlayer())
	{
		PlayerController->OnPossessedPawnChanged.RemoveDynamic(this, &UKartItemWidget::HandlePossessedPawnChanged);
	}
	BindToPawn(nullptr);

	Super::NativeDestruct();
}

void UKartItemWidget::HandlePossessedPawnChanged(APawn* OldPawn, APawn* NewPawn)
{
	BindToPawn(NewPawn);
}

void UKartItemWidget::BindToPawn(APawn* Pawn)
{
	// 1. On se désabonne de l'ancien composant (s'il existe encore)
	if (ItemComponent.IsValid())
	{
		ItemComponent->OnItemChanged.RemoveDynamic(this, &UKartItemWidget::HandleItemChanged);
		ItemComponent->OnRouletteStarted.RemoveDynamic(this, &UKartItemWidget::HandleRouletteStarted);
	}

	// 2. On cherche la poche à objets du nouveau pawn (comme la boîte à bonus : peu importe que ce soit un kart)
	ItemComponent = Pawn != nullptr ? Pawn->FindComponentByClass<UKartItemComponent>() : nullptr;
	RoulettePool = nullptr;

	if (!ItemComponent.IsValid())
	{
		return;
	}

	// 3. On s'abonne, puis on affiche tout de suite ce qu'il a déjà en main
	ItemComponent->OnItemChanged.AddUniqueDynamic(this, &UKartItemWidget::HandleItemChanged);
	ItemComponent->OnRouletteStarted.AddUniqueDynamic(this, &UKartItemWidget::HandleRouletteStarted);
	HandleItemChanged(ItemComponent->GetCurrentItem(), ItemComponent->GetUsesLeft());
}

void UKartItemWidget::HandleRouletteStarted(UKartItemPoolData* Pool, float Duration)
{
	// On ne connaît pas encore le résultat (le widget n'en a pas besoin) : on fait juste défiler les icônes
	RoulettePool = Pool;
	RouletteIndex = 0;
	RouletteTimer = RouletteIconInterval; // "plein" : la première icône s'affiche dès la prochaine image
	UsesText->SetText(FText::GetEmpty());
}

void UKartItemWidget::HandleItemChanged(UKartItemData* Item, int32 UsesLeft)
{
	// L'objet est arrivé (ou a été utilisé) : la roulette s'arrête
	RoulettePool = nullptr;

	ShowIcon(Item != nullptr ? Item->Icon.Get() : nullptr);

	// On affiche "x3", "x2"... seulement s'il reste plus d'une utilisation
	if (Item != nullptr && UsesLeft > 1)
	{
		UsesText->SetText(FText::Format(NSLOCTEXT("Kart", "ItemUses", "x{0}"), FText::AsNumber(UsesLeft)));
	}
	else
	{
		UsesText->SetText(FText::GetEmpty());
	}
}

void UKartItemWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
	Super::NativeTick(MyGeometry, InDeltaTime);

	// Pas de roulette en cours, ou table vide : rien à animer
	if (RoulettePool == nullptr || RoulettePool->Entries.Num() == 0)
	{
		return;
	}

	RouletteTimer += InDeltaTime;
	if (RouletteTimer < RouletteIconInterval)
	{
		return;
	}
	RouletteTimer -= RouletteIconInterval;

	// Icône suivante. % (modulo) fait revenir au début de la liste : avec 3 objets, 0, 1, 2, 0, 1, 2...
	RouletteIndex = (RouletteIndex + 1) % RoulettePool->Entries.Num();

	const UKartItemData* ShownItem = RoulettePool->Entries[RouletteIndex].Item;
	ShowIcon(ShownItem != nullptr ? ShownItem->Icon.Get() : nullptr);
}

void UKartItemWidget::ShowIcon(UTexture2D* Texture)
{
	if (Texture == nullptr)
	{
		// Hidden et pas Collapsed : la case garde sa place dans le HUD, l'image est juste invisible
		ItemIcon->SetVisibility(ESlateVisibility::Hidden);
		return;
	}

	ItemIcon->SetBrushFromTexture(Texture);
	ItemIcon->SetVisibility(ESlateVisibility::HitTestInvisible);
}
