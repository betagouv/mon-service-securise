# Bonnes pratiques Pug (src/vues)

Consignes à appliquer quand je touche aux vues Pug du projet. Tout ce qui suit reflète les conventions déjà présentes dans ce dossier — les respecter avant d'innover.

## Indentation et syntaxe

- Indentation **2 espaces** pour toute nouvelle vue ou tout nouveau fragment. Certains vieux fichiers (`base.pug`, `inputChoix.pug`) sont encore en 4 espaces ; les laisser tels quels, mais ne pas propager le style en 4.
- Une même hiérarchie ne doit jamais mélanger 2 et 4 espaces : Pug casse au rendu.
- Pas de point-virgule sur les lignes JS en Pug (`- const x = ...`).
- Attributs multi-lignes : parenthèse ouvrante sur la ligne du tag, un attribut par ligne, virgules optionnelles mais cohérentes dans le bloc. Voir `service/etapeDossier/avis.pug` pour l'exemple.

## Extensions et blocs

- Une page se branche sur la bonne base :
  - `extends mssDeconnecte` pour les pages publiques (home, accueil, connexion, CGU, etc.).
  - `extends mssConnecte` pour les pages authentifiées simples (création, simulation…).
  - `extends parcoursService` pour les écrans du parcours service (décrire, sécuriser, homologuer…).
  - `extends formulaireEtapier` pour une étape du parcours d'homologation (cf. `service/etapeDossier/*`).
- Utiliser `block append scripts` / `block append styles` pour **ajouter**, pas `block scripts` qui écrase.
- Blocs standards exposés par les layouts : `title`, `main`, `append scripts`, `append styles`, `titre`, `sous-titre`, `formulaire`, `contenu-etape`, `bouton-etape`, `modale`, `etapier`, `avancement-etape`, `zone-principale`, `header-complementaire`, `visite-guidee`. Toujours réutiliser ces noms plutôt que d'inventer un nouveau bloc.

## Mixins et fragments

- Les mixins partagés vivent dans `fragments/`. Un fragment exporte un ou plusieurs `mixin` et rien d'autre (pas de markup au niveau racine).
- Inclure avec `include ../fragments/NOM` (pas d'extension nécessaire) **avant** le premier `block`.
- Appeler un mixin avec `+nomDuMixin(...)`.
- Pour un mixin avec beaucoup d'options, préférer un **objet déstructuré** en argument (cf. `inputChoix`, `inputOuiNon`) plutôt qu'une longue liste positionnelle.
- Un mixin **purement local** à une page peut être défini en haut de la page (cf. `home.pug` : `contenuAvantage`, `etape`, `carteCarrousel`…). Le déplacer dans `fragments/` seulement s'il est réutilisé.

## Composants Svelte

- Monter un composant Svelte via le mixin `+composantSvelte('nomFichier.js')` (défini dans `fragments/composantSvelte.pug`, déjà inclus via `mss.pug`).
- Le composant s'accroche à un point de montage, toujours un `#id` vide dans `block main` ou `block formulaire`. Convention : `#nom-composant` en kebab-case (ex. `#creation-v2`, `#decrire-v2`, `#tableau-des-mesures`).
- Passer les données au composant via `+donneesPartagees('id-donnees', objetOuValeur)` (mixin `fragments/donneesPartagees.pug`). Le Svelte lit ensuite le `<script id="id-donnees" type="application/json">`.
- Le JS d'entrée TypeScript/Svelte est servi depuis `/statique/...` — ne pas fabriquer d'URLs à la main, s'aligner sur ce qui existe déjà pour la page.
- Si la page ajoute aussi des feuilles de style Svelte, appeler `+feuilleDeStyleSvelte()` dans `block append styles`.

## Données et logique

- Les variables disponibles côté vue ont deux origines, à distinguer :
  - **`reponse.locals`** — exposé globalement par les middlewares (ex. `featureFlags`, `nonce`, `version`, `avertissementMaintenance`, `autorisationsService` selon le middleware). C'est du haut-niveau : pertinent sur toutes les pages, ou sur une large famille de pages. Ne pas le re-fabriquer dans la route.
  - **Les variables passées explicitement par la route** via `reponse.render('maVue', { service, referentiel, idEtape, etapeActive, … })`. C'est du spécifique à la page : une donnée utilisée par une seule vue passe par là, pas par `reponse.locals`.
- Avant d'ajouter une variable dans `reponse.locals`, se demander si elle sert vraiment partout. Si c'est propre à une page, la passer en argument de `render()`.
- Préparer les valeurs dérivées dans un bloc `-` **juste avant** leur utilisation :
  ```pug
  -
    const avis = service.dossierCourant().avis
    const estLectureSeule = autorisationsService.HOMOLOGUER.estLectureSeule
  ```
- Interpolation :
  - `tag= expression` pour le contenu texte d'un tag.
  - `tag(attr = expression)` pour un attribut.
  - `#{expression}` dans une chaîne ; `!{expression}` seulement si on contrôle l'échappement (cf. `StringifyAvecHTMLEntitiesEncode` dans `donneesPartagees`).
- Pas de logique métier dans la vue : si ça dépasse deux-trois `const`, le calculer côté serveur et le passer via `reponse.locals`.

## Style et nommage

- Français partout : noms de mixins, variables, classes CSS, ids. Suivre le camelCase pour les mixins/vars JS, le kebab-case pour les ids DOM et classes.
- Pas de commentaires décoratifs. Un commentaire Pug (`//-`) uniquement si le « pourquoi » n'est pas évident (cf. `composantSvelte.pug` qui explique d'où vient `version`).
- Ne pas ajouter d'`!important`, de styles inline, ni de feuille CSS ad hoc sans raison : regarder d'abord dans `public/statique/assets/styles/`.

## Vérifications avant de clore

- Aucune chaîne utilisateur non échappée injectée via `!{...}`.
