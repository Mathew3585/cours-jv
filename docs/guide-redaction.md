# Guide de rédaction des cours

Ce guide décrit comment écrire un cours pour Atelier JV à partir d'un projet Unreal C++. La leçon modèle à imiter est `contenu/projets/mario-kart/modules/pawn-controller/header-kartpawn.mdx`, déclarée dans `contenu/projets/mario-kart/modules/pawn-controller/module.ts`.

## Le public

Des élèves de jeu vidéo (JV1, JV2, JV3) qui découvrent le C++ dans Unreal. Ils ont fait le projet en cours avec le prof et relisent le code pour le comprendre. Ils connaissent l'éditeur Unreal et les Blueprints, beaucoup moins le C++.

- On tutoie l'élève, en français, avec des phrases courtes.
- Chaque mot technique est expliqué la première fois, soit dans le texte, soit avec `<Terme>`.
- On explique **pourquoi** le code est écrit ainsi, pas seulement ce qu'il fait.
- On ne paraphrase pas ligne à ligne : on regroupe les lignes qui forment une idée.
- On ne décrit que ce que le code fait vraiment. Si un détail n'est pas sûr, on ne l'invente pas.
- Pas d'emoji, pas de tiret cadratin pour faire des incises.

## La règle d'or : suivre le fichier du haut vers le bas

Les élèves suivent la leçon **en recopiant le script** dans leur projet. Donc :

- Pour chaque classe, on explique d'abord le `.h` en entier, puis le `.cpp` en entier.
- Chaque fichier est expliqué **de la première à la dernière ligne, dans l'ordre**, sans sauter de ligne non vide : includes, signatures de fonctions, accolades, commentaires compris. On ne revient jamais en arrière dans un fichier.
- Un gros fichier se découpe en plusieurs leçons **consécutives** (lignes 1-120, puis 121-260, etc.), en coupant entre deux fonctions.
- Une étape couvre un petit groupe de lignes qu'on recopie d'un coup (en général 2 à 12 lignes). Une fonction se découpe en : signature et accolade ouvrante, puis ses blocs, puis l'accolade fermante (qu'on peut regrouper avec le dernier bloc).
- L'explication dit ce qu'on écrit et **pourquoi**. Si une ligne fait appel à une notion expliquée ailleurs (un autre fichier, un autre module), on le dit en une phrase.
- Le texte hors des blocs de code (introduction, transitions entre deux fonctions) s'affiche en écrans pleine largeur : garde-le court, 1 à 3 paragraphes par section.

`npm run verifier-contenu` liste les lignes non expliquées et les étapes qui reviennent en arrière.

## Où sont les fichiers

```
contenu/
├── dico/<module>.ts                    mots du dico ajoutés par le module
└── projets/<projet>/
    ├── projet.ts                       titre, description, liste des modules et des fichiers
    ├── code/                           copie des .h et .cpp du projet Unreal
    └── modules/<module>/
        ├── module.ts                   leçons, quiz, questions libres, carte
        └── <lecon>.mdx                 texte de chaque leçon
```

Les numéros de ligne cités dans les leçons sont ceux des fichiers de `code/`. Lis-les toujours avec leurs numéros (par exemple `cat -n`) avant d'écrire une étape.

## module.ts

Voir le type `Module` dans `src/contenu/types.ts`. Points importants :

- `slug` en minuscules avec tirets ; c'est aussi le nom du dossier.
- `intro` : 2 ou 3 phrases qui disent à quoi sert cette partie du jeu.
- `lecons` : dans l'ordre où l'élève doit les lire. Chaque leçon a `charger: () => import("./<slug>.mdx")`.
- `dureeMin` : temps de lecture réaliste, entre 10 et 30 minutes.
- Les identifiants (`quiz.id`, `questionsLibres[].id`, `quizFinal.id`) sont écrits **en toutes lettres** (pas de gabarit `${}`), sous la forme `projet/module/lecon` ou `projet/module/lecon/question`. Ils ne doivent plus changer une fois publiés : les scores des élèves y sont rattachés.
- `quiz` d'une leçon : 3 à 5 questions. `quizFinal` du module : 8 à 10 questions qui couvrent tout le module.
- `questionsLibres` : 0 ou 1 par leçon, avec `attendus` (ce que le prof attend, visible par lui seul).
- `carte` : pour un fichier .cpp de plus de 200 lignes, découpe-le en tranches contiguës, une par leçon (`lecon` = slug de la leçon). Les tranches doivent couvrir tout le fichier sans se chevaucher.

### Questions de quiz

- `type: "qcm"` : 3 ou 4 choix plausibles, une seule bonne réponse.
- `type: "vrai-faux"` : `choix: ["Vrai", "Faux"]`.
- `type: "code"` : un extrait dans `code` (avec `____` pour un trou) et des choix.
- `bonne` : index (à partir de 0) de la bonne réponse. Varie sa position d'une question à l'autre.
- `explication` : pourquoi la bonne réponse est juste, en une ou deux phrases. Elle s'affiche après chaque réponse, juste ou fausse.
- Les questions testent la compréhension (« que se passe-t-il si… », « pourquoi… »), pas la mémoire d'un nombre.

## Le fichier .mdx d'une leçon

Pas de titre principal (`#`) ni de frontmatter : le titre vient de `module.ts`. On commence par un ou deux paragraphes d'introduction, puis des sections `##`.

Composants disponibles :

```mdx
<Terme id="uproperty">UPROPERTY</Terme>
```
Mot souligné ; un clic affiche sa définition du dico. L'`id` doit exister dans `contenu/dico/`.

```mdx
<CodePasAPas fichier="KartPawn.cpp" debut={120} fin={180}>
  <Etape lignes="120-128" titre="Titre court">
    Explication en markdown. On peut utiliser `du code`, du **gras** et des <Terme id="tick">Termes</Terme>.
  </Etape>
  <Etape lignes="130" titre="Une seule ligne">
    ...
  </Etape>
</CodePasAPas>
```
Affiche les lignes `debut` à `fin` du fichier, avec les étapes à droite. Cliquer sur une étape surligne ses lignes. Règles :
- un bloc correspond à une section de la leçon (souvent une fonction ou un groupe de fonctions) ;
- les étapes sont dans l'ordre du fichier et s'enchaînent sans trou ;
- chaque étape tient dans le bloc (`debut` ≤ lignes ≤ `fin`) ;
- l'attribut `lignes` est toujours écrit `"a-b"` ou `"a"`, et `titre` juste après.

```mdx
<Encadre type="retenir">...</Encadre>
```
Types : `retenir`, `piege` (erreur fréquente), `plus-loin`, `info`. Un ou deux par leçon, pas plus.

```mdx
<Quiz />
```
Place le quiz de la leçon (défini dans `module.ts`). En général à la fin.

```mdx
<QuestionLibre id="projet/module/lecon/question" />
```
Place une question libre définie dans `module.ts`.

### Pièges de syntaxe MDX

- Dans le texte, `<` et `{` doivent être dans des backticks : écris `` `TObjectPtr<UCameraComponent>` ``, pas TObjectPtr<UCameraComponent>.
- Pas de commentaires HTML `<!-- -->`.
- Laisse une ligne vide avant et après un bloc `<CodePasAPas>`, `<Encadre>`, `<Quiz />`.
- Les blocs de code markdown (trois backticks) sont possibles pour un petit exemple qui n'est pas dans le projet.
- Les tableaux markdown sont possibles (GFM est activé).

## Le dico

Chaque module ajoute ses mots dans `contenu/dico/<module>.ts` (type `EntreeDico`). Avant d'en ajouter un, vérifie qu'il n'existe pas déjà dans `contenu/dico/*.ts`. `id` en minuscules, sans accents, avec des tirets. `simple` est une seule phrase très simple. Ajoute un `lien` vers la documentation officielle d'Unreal quand il en existe une pertinente.

## Vérifier

```
npm run verifier-contenu
```
Le script compile chaque leçon et vérifie les fichiers de code, les numéros de ligne, les mots du dico et les questions libres. Il doit finir avec 0 erreur.
