#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "KartItemComponent.generated.h"

class UKartItemData;
class UKartItemPoolData;

// Envoyé quand l'objet en main change : nouvel objet, une utilisation en moins, ou plus d'objet (Item = nullptr)
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemChanged, UKartItemData*, Item, int32, UsesLeft);

// Envoyé quand la roulette commence : le widget fait défiler les icônes de la table pendant Duration secondes
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnRouletteStarted, UKartItemPoolData*, Pool, float, Duration);

// La "poche" du kart : garde l'objet qu'il a en main et l'utilise quand le joueur appuie sur la touche
// C'est un ActorComponent : une brique de code sans forme ni position, qu'on ajoute à un acteur
// Toute la logique des objets est ici, et pas dans AKartPawn : le kart reste lisible, et la boîte à bonus
// donne un objet à n'importe quel acteur qui a ce composant
// BlueprintSpawnableComponent = on peut aussi l'ajouter à la main dans un Blueprint (bouton "Add")
UCLASS(ClassGroup = (Kart), meta = (BlueprintSpawnableComponent))
class KARTGAMES_API UKartItemComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UKartItemComponent();

	// Lance la roulette et tire un objet dans la table. Renvoie false si on a déjà un objet (ou une roulette en cours)
	UFUNCTION(BlueprintCallable, Category = "Kart|Items")
	bool TryGiveRandomItem(UKartItemPoolData* Pool);

	// Utilise l'objet en main (appelée par le kart quand le joueur appuie sur la touche)
	UFUNCTION(BlueprintCallable, Category = "Kart|Items")
	void UseItem();

	// Jette l'objet en main et arrête la roulette (par exemple quand une course recommence)
	UFUNCTION(BlueprintCallable, Category = "Kart|Items")
	void ClearItem();

	UFUNCTION(BlueprintPure, Category = "Kart|Items")
	bool HasItem() const { return CurrentItem != nullptr; }

	UFUNCTION(BlueprintPure, Category = "Kart|Items")
	bool IsRouletteRunning() const { return bRouletteRunning; }

	UFUNCTION(BlueprintPure, Category = "Kart|Items")
	UKartItemData* GetCurrentItem() const { return CurrentItem; }

	UFUNCTION(BlueprintPure, Category = "Kart|Items")
	int32 GetUsesLeft() const { return UsesLeft; }

	UPROPERTY(BlueprintAssignable, Category = "Kart|Items")
	FOnItemChanged OnItemChanged;

	UPROPERTY(BlueprintAssignable, Category = "Kart|Items")
	FOnRouletteStarted OnRouletteStarted;

protected:
	// Durée de la roulette en secondes : pendant ce temps on ne peut pas utiliser d'objet
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Items", meta = (ClampMin = "0"))
	float RouletteDuration = 2.f;

	// Affiche l'objet obtenu en texte de debug (pratique tant que le widget n'est pas prêt)
	UPROPERTY(EditAnywhere, Category = "Kart|Items|Debug")
	bool bShowDebugText = true;

	// ---------- État (visible dans les Details pendant le Play) ----------

	// L'objet en main (nullptr = poche vide)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Items")
	TObjectPtr<UKartItemData> CurrentItem;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Items")
	int32 UsesLeft = 0;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Items")
	bool bRouletteRunning = false;

private:
	// Appelée par le timer à la fin de la roulette : le kart reçoit l'objet tiré
	void FinishRoulette();

	// Change l'objet en main et prévient les abonnés (le widget)
	void SetItem(UKartItemData* NewItem, int32 NewUses);

	// L'objet tiré au début de la roulette, donné à la fin
	// UPROPERTY() sans option : invisible dans l'éditeur, mais le ramasse-miettes d'Unreal sait qu'on s'en sert
	UPROPERTY()
	TObjectPtr<UKartItemData> PendingItem;

	FTimerHandle RouletteTimer;
};
