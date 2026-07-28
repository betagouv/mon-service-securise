---
name: integrer-landing-page
description: >-
  Intègre une landing page (page publique) de MonServiceSécurisé à partir d'une
  maquette Figma, en respectant le pattern du repo : route Express dans
  `routesNonConnectePage.js` + vue Pug (`extends mssDeconnecte`) rendue côté
  serveur avec les web components du UI Kit Lab ANSSI (`dsfr-*`, `lab-anssi-*`)
  + feuille de style dans `public/assets/styles/`. À utiliser dès qu'on fournit
  une URL Figma (node-id) ou qu'on demande de créer une nouvelle page publique,
  d'intégrer un écran, un héros ou une section de maquette. Procède section par
  section, avec validation de l'utilisateur.
---

# Intégrer une landing page (MonServiceSécurisé)

Ce skill décrit comment transformer une maquette Figma en page publique navigable
dans ce dépôt : **rendu serveur Pug, pas de bundle Svelte**. Les composants du UI
Kit sont des web components déjà chargés globalement par `src/vues/mss.pug` —
il suffit de les écrire directement dans le Pug.

## Principe : une « page » = 5 pièces câblées

1. **Test de route** dans `test/routes/nonConnecte/routesNonConnectePage.spec.js`
   (ajouter l'URL dans la liste des routes en tête de fichier)
2. **Route** dans `src/routes/nonConnecte/routesNonConnectePage.js`
3. **Vue Pug** `src/vues/<nomDeLaPage>.pug` (`extends mssDeconnecte`)
4. **Styles** `public/assets/styles/<nomDeLaPage>.css`, chargés par la vue via
   `block append styles` (ou réutiliser `landing.css` si la page suit le même gabarit)
5. **Test d'accessibilité** dans `test_accessibilite/pagesPubliques.spec.ts`

Selon le besoin, deux câblages complémentaires :

- **Lien de navigation** : `src/vues/fragments/footer.pug` (ou `header.pug`)
- **Référencement** : `public/assets/fichiers/sitemap.xml`
  (⚠️ à faire uniquement si l'utilisateur le demande — les landings existantes n'y sont pas)

Références vivantes à copier plutôt qu'à réinventer :
`src/vues/securisezServiceNumerique.pug` et `src/vues/industrialisezHomologations.pug`
(les deux landings actuelles, partageant `public/assets/styles/landing.css`).

## Conventions de nommage

- URL en **kebab-case français** : `/securisez-votre-service-numerique`
- Vue et feuille de style en **camelCase** : `securisezServiceNumerique.pug`,
  `securisezServiceNumerique.css`
- Ids DOM et classes CSS en **kebab-case français** : `.bloc-hero`, `.conteneur-colonnes`

## Cadence : petit à petit, avec validation

Le chantier se fait **section par section**. Après le scaffolding, intégrer **une
seule section** de la maquette à la fois, montrer le résultat, et attendre la
validation de l'utilisateur avant de passer à la suivante. Ne jamais dérouler
toute la page d'un coup.

## Style de code

- **TDD** : le test de route d'abord (rouge), puis la route et la vue minimale
  (vert), puis les sections.
- **Pas de commentaires partout.** Le code doit s'expliquer de lui-même : préférer
  des **noms de variables explicites** et l'**extraction de mixins Pug** quand ça
  rend l'intention plus claire, plutôt que d'ajouter un commentaire.
- Réserver les commentaires (`//-`) aux cas où l'intention n'est pas déductible du
  code (ex. provenance d'une valeur exacte reprise de la maquette).
- Respecter `src/vues/CLAUDE.md` : indentation **2 espaces**, `block append
scripts` / `block append styles` (jamais `block scripts` qui écrase), mixins
  purement locaux définis en haut de la page, français partout, pas d'`!important`
  ni de style inline, pas de `!{...}` sur une chaîne utilisateur.

## Workflow

### 0. Prérequis

- Une URL Figma pointant sur le node à intégrer
  (`…/design/<fileKey>/…?node-id=<n>-<m>`). Si absente, la demander.

### 1. Cadrer la maquette

- Extraire `fileKey` et `nodeId` de l'URL (`node-id=6172-6974` → nodeId `6172-6974`).
- `get_screenshot` (rendu global) + `get_metadata` (structure : frames, sections,
  tailles). Repérer les sections et leur ordre.
- Pour une section précise : `get_design_context` sur son node.

### 2. Récupérer le design system — en local, pas de réseau

Le manifest des composants est livré avec la dépendance, à la version exacte
utilisée par le site :

```
node_modules/@lab-anssi/ui-kit/dist/ui-kit-components.json
```

Il liste pour chaque composant son `tagName`, ses `props` (avec le nom de
l'**attribut** HTML à utiliser en Pug), ses `events`, ses `slots` et un `example`.
S'en servir pour choisir les bons `dsfr-*` / `lab-anssi-*` et leurs attributs au
lieu de les deviner.

Vérifier que la version installée correspond à `UI_KIT_VERSION` déclarée dans
`src/vues/mss.pug` (c'est cette constante qui pilote le script et les feuilles de
style chargées depuis le CDN). Pour mettre à jour : `pnpm maj-ui-kit`.

### 3. Scaffolder la page

**a. Test de route** — ajouter l'URL à la liste en tête de
`test/routes/nonConnecte/routesNonConnectePage.spec.js` :

```js
  [
    '/',
    …
    '/ma-nouvelle-page',
  ].forEach((route) => {
```

**b. Route** — dans `src/routes/nonConnecte/routesNonConnectePage.js`, à côté des
autres landings :

```js
routes.get('/ma-nouvelle-page', (_requete, reponse) => {
  reponse.render('maNouvellePage');
});
```

Une landing statique ne prend aucune donnée. Si la page a besoin de données
spécifiques, les passer en second argument de `render()` — pas dans
`reponse.locals` (cf. `src/vues/CLAUDE.md`).

**c. Vue** — `src/vues/maNouvellePage.pug` :

```pug
extends mssDeconnecte

block title
  title Titre de la page | MonServiceSécurisé

block variables
  - const meta_description = "Une phrase de 160 caractères max décrivant la page."

block append styles
  link(href="/statique/assets/styles/maNouvellePage.css", rel="stylesheet")

block main
  .landing(data-themeable="true")
    .bloc-contenu.bloc-hero
      dsfr-container
        h1.titre Titre principal
```

`meta_description` alimente les balises `description`, `og:*` et `twitter:*` de
`base.pug` (tronquée à 160 caractères par `tronqueMetaDescription`). `data-themeable="true"`
active le thème MSS sur les web components DSFR.

**d. Styles** — `public/assets/styles/maNouvellePage.css`. CSS natif (pas de SCSS
dans ce dépôt) : variables custom, nesting natif et `@media` imbriqués, comme dans
`landing.css`. Tout scoper sous `.landing` / les classes de blocs.

**e. Test d'accessibilité** — ajouter l'entrée dans le tableau `pages` de
`test_accessibilite/pagesPubliques.spec.ts` :

```ts
  { nom: 'Ma nouvelle page', url: '/ma-nouvelle-page' },
```

### 4. Intégrer section par section

Pour chaque section, dans l'ordre de la maquette :

1. `get_design_context` du node de la section,
2. construire le markup Pug avec les composants du design system
   (`dsfr-container`, `dsfr-button`, `dsfr-accordion`, `lab-anssi-*`…),
3. styler dans `maNouvellePage.css` (scopé sous le bloc de la section),
4. **montrer / faire valider** avant de continuer.

Si un fragment se répète dans la page, en faire un mixin Pug local défini en haut
du fichier (cf. `home.pug`). S'il sert à plusieurs pages, le déplacer dans
`src/vues/fragments/`.

### 5. Assets (images)

- Télécharger les visuels depuis Figma (`download_assets` ou l'URL renvoyée par
  `get_design_context`).
- ⚠️ Avant d'enregistrer, **demander à l'utilisateur le nom de fichier et le
  répertoire**. Proposer par défaut `public/assets/images/landing/` (il choisit le
  sous-dossier et le nom de fichier).
- Référencer ensuite l'asset en `/statique/assets/images/…` (`public/` est servi
  sous `/statique`).
- ⚠️ La CSP (`src/http/middleware.ts`) impose `img-src 'self'` + le CDN du UI Kit :
  **aucune image externe**, tout doit être téléchargé dans `public/`.

### 6. Vérification

- Proposer les commandes de vérif et **laisser l'utilisateur les lancer** — il
  communique le résultat :
  - `pnpm test` (eslint + vitest, dont le test de route)
  - `pnpm test:a11y` (Playwright)
  - `pnpm dev:back` pour visualiser la page
- Aucun build front n'est nécessaire : la page est rendue côté serveur, il n'y a
  pas de bundle Svelte à produire.
