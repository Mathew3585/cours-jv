---
name: ajouter-cours
description: Transforme un projet Unreal C++ (dossier Source) en cours pour Atelier JV, ou met à jour un cours existant après des changements dans le code. À utiliser quand le prof demande d'ajouter, créer, générer ou mettre à jour un cours, un projet ou un module à partir de son code Unreal.
argument-hint: <chemin du dossier Source> <niveau JV1|JV2|JV3> [nom du projet]
---

# Ajouter un cours à partir d'un projet Unreal

Le prof donne le chemin du dossier `Source` d'un projet Unreal, le niveau de la classe et, s'il le souhaite, le nom du projet. Exemple : `/ajouter-cours D:\Projet\Kart\Source JV3 "Mario Kart"`.

Avant d'écrire quoi que ce soit, lis `docs/guide-redaction.md` (les règles d'écriture) et la leçon modèle `contenu/projets/mario-kart/modules/pawn-controller/header-kartpawn.mdx` avec son `module.ts`.

## 1. Lire le projet et proposer un plan

1. Liste les `.h`, `.cpp` et `.Build.cs` du dossier, avec leur nombre de lignes. Ignore `Intermediate`, `Binaries` et les fichiers générés (`*.generated.h`).
2. Lis tous les fichiers en entier. Repère les classes, qui appelle qui (GameMode, Pawn, Controller, widgets, acteurs du niveau…), et les grosses fonctions.
3. Propose au prof un plan, **sans rien écrire encore** :
   - le slug du projet (minuscules, tirets) et son titre ;
   - les modules (une grosse brique du jeu chacun, dans l'ordre où il faut les comprendre) ;
   - pour chaque module : les leçons (titre, fichier et lignes couvertes, durée), et pour les fichiers de plus de 200 lignes la façon de les découper.
   - Règle à respecter : les élèves recopient le script en suivant les leçons. Pour chaque classe, le `.h` en entier puis le `.cpp` en entier, du haut vers le bas, sans sauter de ligne non vide ni revenir en arrière. Un gros fichier se découpe en leçons consécutives (lignes 1-120, puis 121-260…).
4. Attends la validation du prof et applique ses corrections.

Si le projet existe déjà (`contenu/projets/<slug>/`), c'est une **mise à jour** : compare les nouveaux fichiers avec ceux de `code/` (ajouts, suppressions, numéros de ligne décalés), et propose seulement les changements de leçons nécessaires. Ne change jamais un identifiant de quiz ou de question libre déjà publié : les notes des élèves y sont rattachées.

## 2. Créer les fichiers

1. Copie les fichiers de code utilisés dans `contenu/projets/<slug>/code/` (copie à plat, sans sous-dossiers ; s'il y a deux fichiers du même nom, demande au prof).
2. Crée `contenu/projets/<slug>/projet.ts` sur le modèle de `contenu/projets/mario-kart/projet.ts` (niveau = celui donné par le prof).
3. Pour chaque module, crée `contenu/projets/<slug>/modules/<module>/module.ts` et ses leçons `.mdx`, en suivant le guide.
4. Ajoute les mots du dico dans `contenu/dico/<slug>-<module>.ts` (vérifie d'abord ceux qui existent dans `contenu/dico/*.ts`), puis importe ce fichier dans `contenu/dico/index.ts`.
5. Déclare le projet dans `src/contenu/index.ts` (import et tableau `projets`).

Pour un gros projet, tu peux écrire les modules en parallèle avec des sous-agents : un par module, chacun limité à son dossier et à son fichier de dico, avec le guide et la leçon modèle comme références.

## 3. Vérifier

1. `npm run verifier-contenu` doit finir avec 0 erreur.
2. `npx tsc --noEmit` ne doit rien signaler.
3. `npm run build` doit réussir.
4. Relis une leçon par module en vérifiant que chaque étape surligne bien les lignes qu'elle explique.

## 4. Rendre la main au prof

Dis-lui :
- les modules et leçons créés (ou modifiés) ;
- ce qui t'a semblé ambigu ou possiblement buggé dans son code ;
- comment voir le cours : `npm run dev`, puis en prof « Voir les cours comme un élève » ;
- comment le publier : commit et push (Vercel redéploie), puis dans l'espace prof, « Projets et deadlines » pour l'ouvrir à une classe et fixer les deadlines.

Ne fais pas de commit ni de push sans que le prof le demande.
