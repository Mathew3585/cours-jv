// Crée (ou met à jour) un compte prof.
// Usage : npm run creer-prof -- prenom.nom "Prénom" "Nom" "mot-de-passe"
// Nécessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local.
import { createClient } from "@supabase/supabase-js";

const [identifiant, prenom, nom, motDePasse] = process.argv.slice(2);
if (!identifiant || !prenom || !nom || !motDePasse) {
  console.error('Usage : npm run creer-prof -- prenom.nom "Prénom" "Nom" "mot-de-passe"');
  process.exit(1);
}
if (motDePasse.length < 8) {
  console.error("Le mot de passe doit faire au moins 8 caractères.");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.SUPABASE_SECRET_KEY;
if (!url || !cle) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manque dans .env.local.");
  process.exit(1);
}

const admin = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `${identifiant.trim().toLowerCase()}@eleves.atelier-jv.fr`;

const { data: existant } = await admin.from("profiles").select("id").eq("identifiant", identifiant).maybeSingle();
let id = existant?.id;
if (id) {
  const { error } = await admin.auth.admin.updateUserById(id, { password: motDePasse });
  if (error) throw error;
} else {
  const { data, error } = await admin.auth.admin.createUser({ email, password: motDePasse, email_confirm: true, user_metadata: { prenom, nom } });
  if (error) throw error;
  id = data.user.id;
}
const { error } = await admin.from("profiles").upsert({ id, identifiant, prenom, nom, role: "prof", classe_id: null });
if (error) throw error;
console.log(`Compte prof prêt : identifiant « ${identifiant} ».`);
