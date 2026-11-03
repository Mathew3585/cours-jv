import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session Supabase à chaque requête et renvoie vers /connexion si personne n'est connecté.
// La vérification du rôle (élève ou prof) se fait dans les layouts.
export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (aEcrire) => {
        for (const { name, value } of aEcrire) request.cookies.set(name, value);
        reponse = NextResponse.next({ request });
        for (const { name, value, options } of aEcrire) reponse.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);
  const chemin = request.nextUrl.pathname;

  if (!connecte && chemin !== "/connexion") {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return reponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
