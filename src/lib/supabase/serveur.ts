import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const clePublique = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Client lié à l'utilisateur connecté : les règles d'accès (RLS) s'appliquent. */
export async function supabaseServeur() {
  const magasin = await cookies();
  return createServerClient<Database>(url, clePublique, {
    cookies: {
      getAll: () => magasin.getAll(),
      setAll: (aEcrire) => {
        try {
          for (const { name, value, options } of aEcrire) magasin.set(name, value, options);
        } catch {
          // Appelé depuis un Server Component : le proxy se charge de rafraîchir la session.
        }
      },
    },
  });
}

/**
 * Client avec la clé secrète : ignore les règles d'accès.
 * À n'utiliser que côté serveur, après avoir vérifié qui fait la demande.
 */
export function supabaseAdmin() {
  const cleSecrete = process.env.SUPABASE_SECRET_KEY;
  if (!cleSecrete) {
    throw new Error("SUPABASE_SECRET_KEY manque dans .env.local (Supabase > Project Settings > API Keys > Secret keys).");
  }
  return createClient<Database>(url, cleSecrete, { auth: { persistSession: false, autoRefreshToken: false } });
}
