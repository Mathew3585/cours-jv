# cours-jv · Atelier JV

Plateforme de cours pour les classes de jeu vidéo JV1, JV2 et JV3 : le code des projets Unreal expliqué pas à pas, des définitions au clic, des quiz notés et la progression de chaque élève. Le prof crée les comptes, ouvre les projets aux classes, fixe les deadlines et corrige les réponses libres.

## Lancer en local

1. `npm install`
2. Créer `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<projet>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```
   La clé secrète se trouve dans Supabase > Project Settings > API Keys. Elle ne doit jamais être publiée.
3. Créer le compte prof : `npm run creer-prof -- prenom.nom "Prénom" "Nom" "mot-de-passe"`
4. `npm run dev`, puis http://localhost:3000

## Organisation

- `contenu/projets/<projet>/` : un cours. `projet.ts`, `code/` (copie des sources Unreal), `modules/<module>/module.ts` (leçons, quiz, défi) et les leçons `.mdx`.
- `contenu/dico/` : les mots du dico.
- `contenu/exercices/<niveau>/` : les exercices bonus (pas obligatoires) par niveau. `bases.ts` (facile, moyen) et `avances.ts` (difficile, expert) les déclarent, un `.mdx` par exercice.
- `docs/guide-redaction.md` : comment écrire une leçon.
- `src/app/(eleve)` : pages élève ; `src/app/(lecon)` : leçon et quiz final ; `src/app/prof` : espace prof.
- `supabase/migrations/` : schéma de la base et règles d'accès (déjà appliqués au projet Supabase).

## Ajouter un cours avec Claude

Dans Claude Code, à la racine du dépôt :

```
/ajouter-cours D:\Projet\MonJeu\Source JV2 "Nom du projet"
```

Claude lit le code, propose un découpage en modules et leçons, l'écrit après validation, puis vérifie avec `npm run verifier-contenu`.

## Scripts

- `npm run dev` : site en local
- `npm run build` : build de production
- `npm run verifier-contenu` : vérifie les leçons (syntaxe, numéros de ligne, dico, questions)
- `npm run creer-prof` : crée ou met à jour un compte prof

## Déploiement

Vercel, avec les trois variables d'environnement ci-dessus. Chaque push sur `main` redéploie le site.
