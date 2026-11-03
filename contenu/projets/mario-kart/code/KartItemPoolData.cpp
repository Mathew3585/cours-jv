#include "Items/KartItemPoolData.h"

#include "Items/KartItemData.h"

UKartItemData* UKartItemPoolData::PickRandomItem() const
{
	// 1. On additionne les poids de toutes les lignes valides
	float TotalWeight = 0.f;
	for (const FKartItemPoolEntry& Entry : Entries)
	{
		if (Entry.Item != nullptr && Entry.Weight > 0.f)
		{
			TotalWeight += Entry.Weight;
		}
	}

	if (TotalWeight <= 0.f)
	{
		return nullptr;
	}

	// 2. On tire un nombre au hasard entre 0 et le total
	// Exemple : Turbo 50, Piège 30, Projectile 20 -> total 100, on tire 73
	float Roll = FMath::FRandRange(0.f, TotalWeight);

	// 3. On avance dans la liste en retirant le poids de chaque ligne : la ligne où le nombre "tombe" est la gagnante
	// 73 - 50 (Turbo) = 23, encore positif -> 23 - 30 (Piège) = négatif : c'est le Piège
	UKartItemData* LastValidItem = nullptr;
	for (const FKartItemPoolEntry& Entry : Entries)
	{
		if (Entry.Item == nullptr || Entry.Weight <= 0.f)
		{
			continue;
		}

		LastValidItem = Entry.Item;
		Roll -= Entry.Weight;
		if (Roll < 0.f)
		{
			return Entry.Item;
		}
	}

	// Sécurité : avec les arrondis des nombres à virgule, Roll peut tomber pile sur le total, on prend alors le dernier
	return LastValidItem;
}
