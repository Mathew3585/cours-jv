#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "KartItemPoolData.generated.h"

class UKartItemData;

// Une ligne de la table de tirage : un objet et son poids
// USTRUCT = une structure (un petit paquet de variables) que Unreal sait afficher dans l'éditeur
USTRUCT(BlueprintType)
struct FKartItemPoolEntry
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
	TObjectPtr<UKartItemData> Item;

	// Plus le poids est grand, plus l'objet sort souvent
	// Ce n'est pas un pourcentage : avec des poids 3 et 1, le premier sort 3 fois sur 4
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item", meta = (ClampMin = "0"))
	float Weight = 1.f;
};

// Table de tirage des objets (DA_ItemPool_Default...) : la liste des objets qu'une boîte peut donner
// On peut créer plusieurs tables (une par circuit, une "que des turbos" pour tester...) et choisir laquelle dans chaque boîte
UCLASS(BlueprintType)
class KARTGAMES_API UKartItemPoolData : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Item")
	TArray<FKartItemPoolEntry> Entries;

	// Tire un objet au hasard en respectant les poids (nullptr si la table est vide)
	UFUNCTION(BlueprintCallable, Category = "Item")
	UKartItemData* PickRandomItem() const;
};
