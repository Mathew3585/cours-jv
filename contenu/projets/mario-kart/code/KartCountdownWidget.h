#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "KartCountdownWidget.generated.h"

class UTextBlock;

// Widget du "3, 2, 1, GO" : écoute le GameMode et affiche le chiffre en cours
// Le WBP_Countdown hérite de cette classe et doit contenir un TextBlock nommé "CountdownText"
UCLASS()
class KARTGAMES_API UKartCountdownWidget : public UUserWidget
{
	GENERATED_BODY()

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	// Le texte qui affiche 3, 2, 1, GO (même nom obligatoire dans le WBP)
	UPROPERTY(meta = (BindWidget))
	TObjectPtr<UTextBlock> CountdownText;

	// Texte affiché au départ
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Countdown")
	FText GoText = NSLOCTEXT("Kart", "Go", "GO!");

	// Temps pendant lequel "GO!" reste affiché avant de disparaître
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Countdown", meta = (ClampMin = "0"))
	float GoDisplayTime = 1.f;

	// Appelé à chaque chiffre (Number = 3, 2, 1 puis 0 pour le GO) : à utiliser dans le WBP pour jouer une animation ou un son
	UFUNCTION(BlueprintImplementableEvent, Category = "Kart|Countdown")
	void OnCountdownNumberShown(int32 Number);

private:
	UFUNCTION()
	void HandleCountdownTick(int32 Number);

	void HideCountdown();

	FTimerHandle HideTimer;
};
