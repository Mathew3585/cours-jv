#include "Items/KartItemData_Boost.h"

#include "KartPawn.h"

bool UKartItemData_Boost::Activate(AKartPawn* Kart) const
{
	if (Kart == nullptr)
	{
		return false;
	}

	// Le kart sait déjà faire un turbo (celui du drift) : l'objet lui demande juste d'en lancer un
	Kart->ApplyBoost(BoostDuration);
	return true;
}
