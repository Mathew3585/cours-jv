#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RotatingObject.generated.h"

class USceneComponent;

// Objet qui tourne sur lui-même et flotte de haut en bas (boîte à bonus, pièce, décor...)
// Cette classe ne fait QUE l'animation : les classes enfants (comme AKartItemBox) ajoutent leur propre logique
// Les enfants accrochent leurs meshes sur AnimatedRoot pour qu'ils soient animés
UCLASS()
class KARTGAMES_API ARotatingObject : public AActor
{
	GENERATED_BODY()

public:
	ARotatingObject();

	virtual void Tick(float DeltaTime) override;

	// Met l'animation en pause (false) ou la relance (true), par exemple quand l'objet est caché
	UFUNCTION(BlueprintCallable, Category = "Rotating")
	void SetAnimationEnabled(bool bEnabled);

	UFUNCTION(BlueprintPure, Category = "Rotating")
	bool IsAnimationEnabled() const { return bAnimate; }

protected:
	virtual void BeginPlay() override;

	// ---------- Composants ----------

	// Racine fixe : c'est la position où on a posé l'objet dans le niveau, elle ne bouge jamais
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Rotating|Components")
	TObjectPtr<USceneComponent> Root;

	// Point d'accroche animé : c'est LUI qui tourne et qui monte / descend
	// Tout ce qu'on attache dessus (meshes, effets) est animé avec lui
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Rotating|Components")
	TObjectPtr<USceneComponent> AnimatedRoot;

	// ---------- Réglages : rotation ----------

	// Vitesse de rotation sur chaque axe, en degrés par seconde
	// Pitch = basculer avant / arrière, Yaw = tourner comme une toupie, Roll = rouler sur le côté
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating|Rotation")
	FRotator RotationSpeed = FRotator(30.f, 90.f, 45.f);

	// ---------- Réglages : flottement (haut / bas) ----------

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating|Bobbing")
	bool bEnableBobbing = true;

	// Hauteur du flottement en cm : l'objet monte de BobHeight puis descend de BobHeight
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating|Bobbing", meta = (ClampMin = "0"))
	float BobHeight = 20.f;

	// Nombre d'allers-retours (monter + descendre) par seconde
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating|Bobbing", meta = (ClampMin = "0.01"))
	float BobFrequency = 0.5f;

	// ---------- Réglages : général ----------

	// Coché = chaque objet commence son animation à un moment au hasard
	// (sinon toutes les boîtes d'une rangée montent et tournent exactement en même temps, ça fait robot)
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating")
	bool bRandomStartPhase = true;

	// Décoché = l'objet reste immobile
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Rotating")
	bool bAnimate = true;

private:
	// Temps écoulé depuis le début de l'animation (sert à calculer le sinus du flottement)
	float AnimationTime = 0.f;

	// Position d'AnimatedRoot placée dans le Blueprint : le flottement se fait autour de ce point
	FVector AnimatedRootBaseLocation = FVector::ZeroVector;
};
