#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "LapZone.generated.h"

class UBoxComponent;
class UArrowComponent;
class UPrimitiveComponent;
struct FHitResult;

// Zone de passage du circuit : une boîte (le collider) + une flèche (le sens de la course)
// On en pose plusieurs sur le circuit, chacune avec un numéro (ZoneIndex) :
// - 0       = la ligne d'arrivée : la traverser après tous les checkpoints termine le tour
// - 1, 2... = les checkpoints, à traverser dans l'ordre pendant le tour
// Une zone ne compte que si le kart roule dans le sens de la flèche
//
// Pourquoi des checkpoints en plus de la flèche ?
// Avec la flèche seule, on pourrait passer la ligne en avant (+1 tour), reculer en marche arrière
// (ignoré car mauvais sens), puis repasser en avant (+1 tour)... et finir la course sans faire le circuit
// Avec les checkpoints, il faut obligatoirement faire tout le tour avant que la ligne d'arrivée compte
UCLASS()
class KARTGAMES_API ALapZone : public AActor
{
	GENERATED_BODY()

public:
	ALapZone();

	UFUNCTION(BlueprintPure, Category = "Kart|Lap")
	int32 GetZoneIndex() const { return ZoneIndex; }

	// Vrai si la direction donnée va dans le sens de la flèche
	UFUNCTION(BlueprintPure, Category = "Kart|Lap")
	bool IsGoingRightWay(const FVector& MoveDirection) const;

protected:
	virtual void BeginPlay() override;

	// ---------- Composants ----------

	// Le collider : quand un kart entre dedans, on vérifie s'il valide la zone
	// (on règle sa taille dans le BP avec "Box Extent" : X = épaisseur, Y = largeur de la piste, Z = hauteur)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Components")
	TObjectPtr<UBoxComponent> Box;

	// La flèche montre le sens dans lequel il faut traverser la zone
	// (pour changer le sens, on tourne l'acteur dans le niveau)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Components")
	TObjectPtr<UArrowComponent> Arrow;

	// ---------- Réglages ----------

	// 0 = ligne d'arrivée, 1, 2, 3... = checkpoints dans l'ordre du circuit (sans trou : 1, 2, 3 et pas 1, 3, 7)
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Lap", meta = (ClampMin = "0"))
	int32 ZoneIndex = 0;

	// Coché = la boîte et la flèche restent visibles pendant le Play (pratique pour tester)
	// Décoché = visibles seulement dans l'éditeur, invisibles en jeu
	UPROPERTY(EditAnywhere, Category = "Kart|Lap")
	bool bShowInGame = true;

private:
	// Appelée automatiquement par Unreal quand quelque chose entre dans la boîte
	// UFUNCTION() est obligatoire : sans lui, Unreal ne peut pas brancher la fonction sur l'event de la boîte
	// Les paramètres sont imposés par l'event OnComponentBeginOverlap (on n'utilise que OtherActor)
	UFUNCTION()
	void HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);
};
