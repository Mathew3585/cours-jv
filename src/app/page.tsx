import { redirect } from "next/navigation";
import { utilisateurCourant } from "@/lib/session";

export default async function Accueil() {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  redirect(u.profil.role === "prof" ? "/prof" : "/parcours");
}
