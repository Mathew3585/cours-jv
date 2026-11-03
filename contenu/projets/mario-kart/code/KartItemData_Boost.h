#pragma once

#include "CoreMinimal.h"
#include "Items/KartItemData.h"
#include "KartItemData_Boost.generated.h"

// Objet turbo : donne un boost au kart, comme un super-turbo de drift
// Pour un triple turbo, on crée un deuxième asset de cette classe avec Uses = 3 : pas une ligne de code en plus
UCLASS()
class KARTGAMES_API UKartItemData_Boost : public UKartItemData
{
	GENERATED_BODY()

public:
	// Durée du turbo en secondes
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Item|Boost", meta = (ClampMin = "0.1"))
	float BoostDuration = 1.5f;

	// "override" = on remplace la fonction Activate du parent (le compilateur vérifie qu'elle existe bien chez lui)
	virtual bool Activate(AKartPawn* Kart) const override;
};
