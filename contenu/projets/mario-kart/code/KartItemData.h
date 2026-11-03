#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "KartItemData.generated.h"

class AKartPawn;
class UTexture2D;

// Un objet bonus (turbo, piège, projectile...) décrit dans un Data Asset
// Un Data Asset est un fichier de données créé dans le Content Browser : 1 asset = 1 objet du jeu (DA_Item_Turbo...)
// Cette classe est le PARENT de tous les objets : elle contient ce qu'ils ont en commun (nom, icône, utilisations)
// Chaque type d'objet est une classe enfant qui redéfinit Activate pour faire son effet
//
// Abstract = on ne peut pas créer d'asset de cette classe directement, seulement de ses enfants
// (un objet "en général" n'a pas d'effet : c'est l'enfant qui sait ce qu'il fait)
UCLASS(Abstract, BlueprintType)
class KARTGAMES_API UKartItemData : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	// Nom affiché à l'écran
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Item")
	FText DisplayName;

	// Image affichée dans la case d'objet du HUD
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Item")
	TObjectPtr<UTexture2D> Icon;

	// Nombre de fois qu'on peut utiliser l'objet avant qu'il disparaisse (3 = triple turbo, par exemple)
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Item", meta = (ClampMin = "1"))
	int32 Uses = 1;

	// Fait l'effet de l'objet pour ce kart. Renvoie true si l'objet a bien été utilisé (une utilisation est alors consommée)
	// "virtual" = les classes enfants peuvent remplacer cette fonction par la leur (avec "override")
	// "const" = la fonction ne modifie pas le Data Asset : il est PARTAGÉ par tous les karts,
	// il ne doit donc jamais retenir quoi que ce soit sur un kart en particulier
	virtual bool Activate(AKartPawn* Kart) const;
};
