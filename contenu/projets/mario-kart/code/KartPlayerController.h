#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "KartPlayerController.generated.h"

class UKartCountdownWidget;
class UKartRaceHudWidget;
class UKartItemWidget;

// Controller du joueur : crée l'UI de la course (seulement pour le joueur local)
UCLASS()
class KARTGAMES_API AKartPlayerController : public APlayerController
{
	GENERATED_BODY()

protected:
	virtual void BeginPlay() override;

	// Widget du compte à rebours à afficher (mettre WBP_Countdown ici dans BP_KartPlayerController)
	UPROPERTY(EditAnywhere, Category = "Kart|UI")
	TSubclassOf<UKartCountdownWidget> CountdownWidgetClass;

	// Widget de la case d'objet bonus (mettre WBP_ItemSlot ici dans BP_KartPlayerController)
	UPROPERTY(EditAnywhere, Category = "Kart|UI")
	TSubclassOf<UKartItemWidget> ItemWidgetClass;

	// Widget du chrono et des tours (mettre WBP_RaceHud ici dans BP_KartPlayerController)
	UPROPERTY(EditAnywhere, Category = "Kart|UI")
	TSubclassOf<UKartRaceHudWidget> RaceHudWidgetClass;

private:
	UPROPERTY()
	TObjectPtr<UKartCountdownWidget> CountdownWidget;

	UPROPERTY()
	TObjectPtr<UKartItemWidget> ItemWidget;

	UPROPERTY()
	TObjectPtr<UKartRaceHudWidget> RaceHudWidget;
};
