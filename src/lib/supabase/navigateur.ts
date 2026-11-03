import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Client Supabase côté navigateur (session de l'utilisateur connecté), utilisé pour le temps réel. */
export function supabaseNavigateur() {
  client ??= createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  return client;
}
