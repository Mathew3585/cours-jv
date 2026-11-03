#include "Items/KartItemBox.h"

#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Items/KartItemComponent.h"
#include "TimerManager.h"

AKartItemBox::AKartItemBox()
{
	// Le constructeur du parent (ARotatingObject) a déjà été appelé avant celui-ci :
	// Root et AnimatedRoot existent déjà, on peut s'y accrocher

	// Détection sur la racine fixe : la zone reste au même endroit pendant que le cube bouge
	DetectionSphere = CreateDefaultSubobject<USphereComponent>(TEXT("DetectionSphere"));
	DetectionSphere->SetupAttachment(Root);
	DetectionSphere->SetSphereRadius(80.f);

	// Comme une ALapZone : "Trigger" ne bloque rien, il signale juste qui entre
	DetectionSphere->SetCollisionProfileName(TEXT("Trigger"));
	DetectionSphere->SetGenerateOverlapEvents(true);

	// Le cube est juste visuel : pas de collision, c'est la sphère qui détecte
	BoxMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BoxMesh"));
	BoxMesh->SetupAttachment(AnimatedRoot);
	BoxMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AKartItemBox::BeginPlay()
{
	// Super::BeginPlay() lance d'abord le BeginPlay du parent (position de départ du flottement, départ au hasard)
	Super::BeginPlay();

	DetectionSphere->OnComponentBeginOverlap.AddDynamic(this, &AKartItemBox::HandleBeginOverlap);
}

void AKartItemBox::HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
	int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// On ne cherche pas un AKartPawn mais un acteur qui a une "poche" à objets :
	// la boîte ne dépend pas du kart, n'importe quel acteur avec un UKartItemComponent peut la prendre
	// FindComponentByClass renvoie le premier composant de ce type sur l'acteur (nullptr s'il n'en a pas)
	UKartItemComponent* ItemComponent = OtherActor != nullptr ? OtherActor->FindComponentByClass<UKartItemComponent>() : nullptr;
	if (ItemComponent == nullptr)
	{
		return;
	}

	// La boîte casse même si le kart a déjà un objet (il ne reçoit simplement rien de plus)
	ItemComponent->TryGiveRandomItem(ItemPool);

	SetBoxActive(false);
	OnBoxCollected(OtherActor);

	GetWorldTimerManager().SetTimer(RespawnTimer, this, &AKartItemBox::Respawn, RespawnDelay, false);
}

void AKartItemBox::SetBoxActive(bool bActive)
{
	// true en 2e paramètre = on cache aussi tous les enfants du cube
	BoxMesh->SetVisibility(bActive, true);

	// Boîte cachée = plus de détection, sinon on pourrait prendre une boîte invisible
	DetectionSphere->SetCollisionEnabled(bActive ? ECollisionEnabled::QueryOnly : ECollisionEnabled::NoCollision);

	// Fonction héritée de ARotatingObject : inutile d'animer une boîte que personne ne voit
	SetAnimationEnabled(bActive);
}

void AKartItemBox::Respawn()
{
	SetBoxActive(true);
}
