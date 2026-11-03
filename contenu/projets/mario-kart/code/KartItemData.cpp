#include "Items/KartItemData.h"

bool UKartItemData::Activate(AKartPawn* Kart) const
{
	// Le parent n'a pas d'effet : ce sont les classes enfants qui remplacent cette fonction
	// On renvoie false pour que l'objet ne soit pas consommé si un enfant oublie de la redéfinir
	return false;
}
