import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Apparition } from "@/components/motion";
import { FormulaireConnexion } from "@/components/formulaire-connexion";
import { Logo } from "@/components/ui";
import { utilisateurCourant } from "@/lib/session";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage() {
  const u = await utilisateurCourant();
  if (u) redirect(u.profil.role === "prof" ? "/prof" : "/parcours");

  return (
    <div className="flex min-h-dvh flex-wrap">
      <div className="relative flex flex-[1_1_520px] flex-col justify-between gap-12 overflow-hidden bg-sable p-8 md:p-14">
        <Logo taille="lg" />
        <Apparition className="relative flex max-w-[520px] flex-col gap-5">
          <h1 className="font-display text-[44px] leading-[1.02] font-extrabold tracking-tight md:text-[60px]">
            Reprends là où tu t&apos;étais arrêté.
          </h1>
          <p className="text-lg leading-relaxed text-encre-2">
            Tes cours de jeu vidéo, ton code expliqué ligne par ligne, et ta progression sauvegardée. En classe ou chez toi.
          </p>
          <div className="flex flex-wrap gap-2">
            {["JV1", "JV2", "JV3"].map((n) => (
              <span key={n} className="rounded-full border border-ligne-2 bg-white px-3.5 py-1.5 text-sm font-semibold">
                {n}
              </span>
            ))}
          </div>
        </Apparition>
        <div className="flex max-w-[460px] flex-col gap-2.5 rounded-2xl bg-encre px-5 py-[18px] font-mono text-[13px] leading-[1.7] text-[#f6e9d8]">
          <span className="text-[#a8927b]">{"// KartPawn.h · ligne 103"}</span>
          <span>
            <span className="text-[#7fc8e8]">UPROPERTY</span>(EditAnywhere, Category = <span className="text-[#b7d88b]">&quot;Kart|Input&quot;</span>)
          </span>
          <span>
            <span className="text-[#f3d27a]">TObjectPtr</span>&lt;<span className="text-[#f3d27a]">UInputMappingContext</span>&gt; KartMappingContext;
          </span>
        </div>
        <div aria-hidden="true" className="absolute top-[120px] -right-[90px] size-[280px] rounded-full border-[36px] border-[#f2d2b0]" />
      </div>

      <div className="flex flex-[1_1_480px] items-center justify-center px-6 py-14">
        <FormulaireConnexion />
      </div>
    </div>
  );
}
