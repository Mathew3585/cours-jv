#pragma once

#include "CoreMinimal.h"
#include "World/RotatingObject.h"
#include "KartItemBox.generated.h"

class USphereComponent;
class UStaticMeshComponent;
class UKartItemPoolData;
class UPrimitiveComponent;
struct FHitResult;

// Boîte à bonus posée sur la piste : le kart qui roule dedans reçoit un objet au hasard
// Elle HÉRITE de ARotatingObject : elle tourne et flotte déjà toute seule, sans une ligne de code ici pour ça
// Cette classe n'ajoute que ce qui est propre à la boîte : la détection du kart, le don de l'objet et la réapparition
UCLASS()
class KARTGAMES_API AKartItemBox : public ARotatingObject
{
	GENERATED_BODY()

public:
	AKartItemBox();

protected:
	virtual void BeginPlay() override;

	// ---------- Composants ----------

	// Zone de détection, attachée à la racine FIXE : elle ne tourne pas et ne flotte pas avec le cube
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Components")
	TObjectPtr<USphereComponent> DetectionSphere;

	// Le cube visible, attaché au point ANIMÉ du parent : c'est lui qui tourne
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Kart|Components")
	TObjectPtr<UStaticMeshComponent> BoxMesh;

	// ---------- Réglages ----------

	// La table de tirage utilisée par cette boîte (DA_ItemPool_Default...)
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|ItemBox")
	TObjectPtr<UKartItemPoolData> ItemPool;

	// Temps (en secondes) avant que la boîte réapparaisse après avoir été prise (au moins 0.1 : un timer de 0 ne se lance pas)
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|ItemBox", meta = (ClampMin = "0.1"))
	float RespawnDelay = 3.f;

	// Appelé quand un kart prend la boîte : à utiliser dans le BP pour jouer un son ou un effet de particules
	UFUNCTION(BlueprintImplementableEvent, Category = "Kart|ItemBox")
	void OnBoxCollected(AActor* Collector);

private:
	UFUNCTION()
	void HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
		int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult);

	// Montre ou cache la boîte : visible + détection + animation, ou rien de tout ça
	void SetBoxActive(bool bActive);

	// Appelée par le timer : la boîte revient
	void Respawn();

	FTimerHandle RespawnTimer;
};
