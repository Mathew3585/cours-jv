#include "LapZone.h"

#include "Components/ArrowComponent.h"
#include "Components/BoxComponent.h"
#include "KartPawn.h"

ALapZone::ALapZone()
{
	// La zone ne fait rien à chaque frame : elle attend juste qu'un kart entre dedans, donc pas de Tick
	PrimaryActorTick.bCanEverTick = false;

	// La boîte est la racine : déplacer / tourner l'acteur déplace / tourne la boîte
	Box = CreateDefaultSubobject<UBoxComponent>(TEXT("Box"));
	RootComponent = Box;

	// Taille par défaut (demi-taille en cm) : 1 m d'épaisseur, 10 m de large, 4 m de haut
	// Bien plus épais que la distance parcourue en une frame, pour qu'aucun kart ne passe "entre deux frames"
	Box->SetBoxExtent(FVector(50.f, 500.f, 200.f));

	// Profil "Trigger" : la boîte ne bloque rien, elle signale juste quand on entre dedans (overlap)
	// On ne prend pas "BlockAll" sinon le kart taperait dedans comme dans un mur
	// Le profil "Trigger" est aussi ignoré par les rayons du kart qui cherchent le sol (ils ne gardent que ce qui bloque)
	Box->SetCollisionProfileName(TEXT("Trigger"));

	// Sans ça, la boîte ne déclenche pas l'event OnComponentBeginOverlap
	Box->SetGenerateOverlapEvents(true);

	// La flèche est attachée à la boîte : elle pointe vers l'avant de l'acteur (axe X rouge)
	Arrow = CreateDefaultSubobject<UArrowComponent>(TEXT("Arrow"));
	Arrow->SetupAttachment(Box);

	// Grosse flèche verte, facile à voir sur le circuit
	Arrow->SetArrowColor(FLinearColor::Green);
	Arrow->SetArrowSize(3.f);
	Arrow->SetArrowLength(100.f);
}

void ALapZone::BeginPlay()
{
	Super::BeginPlay();

	// Dans l'éditeur la boîte et la flèche sont toujours visibles
	// En jeu, c'est la case bShowInGame du BP qui décide
	// (SetHiddenInGame(true) = caché seulement pendant le jeu, ça ne change rien dans l'éditeur)
	Box->SetHiddenInGame(!bShowInGame);
	Arrow->SetHiddenInGame(!bShowInGame);

	// On s'abonne à l'event de la boîte : à chaque fois que quelque chose entre dedans,
	// Unreal appellera HandleBeginOverlap
	// AddDynamic (et pas un simple pointeur de fonction) car l'event est un delegate "dynamic", comme ceux du GameMode
	Box->OnComponentBeginOverlap.AddDynamic(this, &ALapZone::HandleBeginOverlap);
}

bool ALapZone::IsGoingRightWay(const FVector& MoveDirection) const
{
	// DotProduct (produit scalaire) compare deux directions :
	//  > 0 = elles vont plutôt dans le même sens
	//  = 0 = elles sont perpendiculaires (on longe la ligne, on ne la traverse pas)
	//  < 0 = elles vont dans des sens opposés
	// On le choisit car il suffit de regarder son signe : pas besoin de calculer d'angle
	// On prend le "Forward" de la flèche (son axe X) : c'est la direction dans laquelle elle pointe
	return FVector::DotProduct(MoveDirection, Arrow->GetForwardVector()) > 0.f;
}

void ALapZone::HandleBeginOverlap(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, UPrimitiveComponent* OtherComp,
	int32 OtherBodyIndex, bool bFromSweep, const FHitResult& SweepResult)
{
	// Cast = "est-ce que cet acteur est un kart ?"
	// Si oui on récupère un pointeur de type AKartPawn, sinon on obtient nullptr (un objet du décor, un autre acteur...)
	AKartPawn* Kart = Cast<AKartPawn>(OtherActor);
	if (Kart == nullptr)
	{
		return;
	}

	// Mauvais sens (marche arrière à travers la zone, ou circuit pris à l'envers) : on ignore
	if (!IsGoingRightWay(Kart->GetMoveDirection()))
	{
		return;
	}

	// Bon sens : c'est le kart qui vérifie si c'est la bonne zone (le bon checkpoint ou la ligne d'arrivée)
	Kart->EnterLapZone(ZoneIndex);
}
