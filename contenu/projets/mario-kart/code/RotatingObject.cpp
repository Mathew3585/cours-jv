#include "World/RotatingObject.h"

#include "Components/SceneComponent.h"

ARotatingObject::ARotatingObject()
{
	// L'animation se fait dans Tick, à chaque frame
	PrimaryActorTick.bCanEverTick = true;

	// Racine fixe : un simple point dans le niveau, sans forme ni collision
	Root = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	RootComponent = Root;

	// Le point animé est un enfant de la racine : ses mouvements sont "relatifs" à elle
	AnimatedRoot = CreateDefaultSubobject<USceneComponent>(TEXT("AnimatedRoot"));
	AnimatedRoot->SetupAttachment(Root);
}

void ARotatingObject::BeginPlay()
{
	Super::BeginPlay();

	// On retient la position placée dans le Blueprint pour flotter autour d'elle
	AnimatedRootBaseLocation = AnimatedRoot->GetRelativeLocation();

	if (bRandomStartPhase)
	{
		// On fait comme si l'animation tournait déjà depuis un temps au hasard
		// (entre 0 et la durée d'un aller-retour complet : 1 / BobFrequency secondes)
		AnimationTime = FMath::FRandRange(0.f, 1.f / BobFrequency);
		AnimatedRoot->AddLocalRotation(RotationSpeed * AnimationTime);
	}
}

void ARotatingObject::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (!bAnimate)
	{
		return;
	}

	AnimationTime += DeltaTime;

	// Rotation : on ajoute à chaque frame "vitesse x temps de la frame", comme pour un déplacement
	// AddLocalRotation tourne autour des axes de l'objet lui-même (et pas ceux du monde) :
	// avec une vitesse sur les 3 axes, l'objet culbute dans tous les sens au lieu de tourner comme une toupie
	AnimatedRoot->AddLocalRotation(RotationSpeed * DeltaTime);

	if (bEnableBobbing)
	{
		// Sin oscille entre -1 et 1 : multiplié par BobHeight, on obtient un décalage entre -BobHeight et +BobHeight
		// 2 * PI = un tour complet du sinus, donc "Temps * Fréquence * 2 * PI" fait BobFrequency allers-retours par seconde
		const float BobOffset = FMath::Sin(AnimationTime * BobFrequency * 2.f * PI) * BobHeight;
		AnimatedRoot->SetRelativeLocation(AnimatedRootBaseLocation + FVector(0.f, 0.f, BobOffset));
	}
}

void ARotatingObject::SetAnimationEnabled(bool bEnabled)
{
	bAnimate = bEnabled;
}
