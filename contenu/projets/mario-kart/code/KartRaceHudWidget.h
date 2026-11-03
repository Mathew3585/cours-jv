#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "KartRaceHudWidget.generated.h"

class UTextBlock;

// Widget de course : affiche le chrono et le tour en cours ("Tour 1/3")
// Il est caché pendant le "3, 2, 1" et apparaît au GO
// Le WBP_RaceHud hérite de cette classe et doit contenir deux TextBlock nommés "TimerText" et "LapText"
UCLASS()
class KARTGAMES_API UKartRaceHudWidget : public UUserWidget
{
	GENERATED_BODY()

protected:
	virtual void NativeConstruct() override;
	virtual void NativeDestruct() override;

	// Appelée à chaque frame tant que le widget est visible : on y met à jour le chrono
	virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

	// Le texte du chrono (même nom obligatoire dans le WBP)
	UPROPERTY(meta = (BindWidget))
	TObjectPtr<UTextBlock> TimerText;

	// Le texte du tour en cours (même nom obligatoire dans le WBP)
	UPROPERTY(meta = (BindWidget))
	TObjectPtr<UTextBlock> LapText;

	// Texte du tour affiché quand le joueur a fini la course
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Kart|Race")
	FText FinishedText = NSLOCTEXT("Kart", "Finished", "FINI !");

private:
	// Appelée par le GameMode au GO : on affiche le widget
	UFUNCTION()
	void HandleRaceStarted();
};
