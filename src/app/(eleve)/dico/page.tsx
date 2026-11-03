import type { Metadata } from "next";
import { DicoNavigateur } from "@/components/dico-navigateur";
import { dico } from "@/contenu";

export const metadata: Metadata = { title: "Le dico" };

export default async function DicoPage({ searchParams }: PageProps<"/dico">) {
  const { terme } = await searchParams;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[40px] font-extrabold tracking-tight">Le dico</h1>
        <span className="text-[15px] text-muet">Les {dico.length} mots du code vus dans les leçons, expliqués simplement.</span>
      </div>
      <DicoNavigateur termes={dico} initial={typeof terme === "string" ? terme : undefined} />
    </>
  );
}
