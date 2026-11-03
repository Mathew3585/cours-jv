#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "KartItemWidget.generated.h"

class UImage;
class UTextBlock;
class UTexture2D;
class APawn;
class UKartItemComponent;
class UKartItemData;
class UKartItemPoolData;

// Case d'objet du HUD : affiche l'icône de l'objet en main, le nombre d'utilisations restantes,
// et fait défiler les icônes pendant la roulette
// Le WBP_ItemSlot hérite de cette classe et doit contenir une Image "ItemIcon" et un TextBlock "UsesText"
UCLASS()
class KARTGAMES_API UKartItemWidget : public UUserWidget
{
	GENERATED_BODY()

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	// L'icône de l'objet (même nom obligatoire dans le WBP)
	UPROPERTY(meta = (BindWidget))
	TObjectPtr<UImage> ItemIcon;

	// "x3" pour un objet à plusieurs utilisations, vide sinon (même nom obligatoire dans le WBP)
	UPROPERTY(meta = (BindWidget))
	TObjectPtr<UTextBlock> UsesText;

	// Pendant la roulette, temps (en secondes) entre deux icônes
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Items", meta = (ClampMin = "0.01"))
	float RouletteIconInterval = 0.08f;

private:
	// Appelée par le PlayerController quand il prend un nouveau pawn (au début du jeu, après une réapparition...)
	UFUNCTION()
	void HandlePossessedPawnChanged(APawn* OldPawn, APawn* NewPawn);

	// Appelées par le composant d'objet du kart
	UFUNCTION()
	void HandleItemChanged(UKartItemData* Item, int32 UsesLeft);

	UFUNCTION()
	void HandleRouletteStarted(UKartItemPoolData* Pool, float Duration);

	// S'abonne aux events du composant d'objet d'un pawn (et se désabonne de l'ancien)
	void BindToPawn(APawn* Pawn);

	// Affiche une icône dans la case, ou cache seulement l'image si Texture vaut nullptr (la case garde sa place)
	void ShowIcon(UTexture2D* Texture);

	// Le composant qu'on écoute. TWeakObjectPtr = un pointeur "faible" : il devient nul tout seul si le kart est détruit
	// (on ne veut pas que le widget garde en vie un kart qui n'existe plus)
	TWeakObjectPtr<UKartItemComponent> ItemComponent;

	// La table dont on fait défiler les icônes pendant la roulette (nullptr = pas de roulette)
	UPROPERTY()
	TObjectPtr<UKartItemPoolData> RoulettePool;

	int32 RouletteIndex = 0;

	float RouletteTimer = 0.f;
};
