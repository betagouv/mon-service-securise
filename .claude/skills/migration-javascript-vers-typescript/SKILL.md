---
name: migration-javascript-vers-typescript
description: >-
  Guide pas-à-pas pour convertir un fichier JavaScript du domaine (`src/modeles/`)
  en TypeScript strict dans ce projet. À utiliser dès qu'on demande de migrer ou
  convertir un modèle métier de `.js` vers `.ts`, de typer un constructeur, un
  agrégat ou un `toJSON()`, de traduire un `.spec` d'expect.js vers Vitest, ou
  lors des tâches « [SOIN] Convertis le modèle … en Typescript ».
---

# Migration JS → TypeScript (modèles de domaine)

Guide pour convertir un fichier `.js` du domaine en TypeScript **strict** (`tsconfig.json` : `strict: true`). Le style du projet reste inchangé : nommage **en français**, pas de commentaires superflus, code propre.

## Principe : de bas en haut

On convertit **toutes les dépendances d'un fichier avant le fichier lui-même**, en remontant l'arbre d'import des feuilles vers la racine. Un fichier n'est converti que lorsque tout ce qu'il importe est déjà en `.ts` (ou l'était déjà).

Découpage en **items** : un item = un fichier source + son `.spec` associé. On avance **pas à pas**, avec une **pause review/commit entre chaque item**. Les fichiers triviaux et quasi identiques (ex. sous-types d'une même classe) peuvent être regroupés en un seul item.

## Deux commits par item : renommage seul, puis conversion

Git ne mémorise pas les renommages : il les **déduit** par similarité de contenu (seuil 50 %). Une conversion TS réécrit souvent plus de la moitié du fichier, et le renommage serait alors vu comme une suppression + un ajout, ce qui casse `git log --follow` et rend la review illisible. Chaque item se fait donc en **deux commits** :

1. **Renommage seul** : `git mv` du source et du spec (et du constructeur de test éventuel), **sans aucune modification de contenu**. Vérifier `git diff --cached --name-status -M` → `R100` pour chaque fichier. Faire une pause pour que le commit soit fait, avec un intitulé du type :
   `[SOIN] Renomme uniquement \`monFichier\` en \`.ts\` afin de faciliter le diff`
2. **Conversion** : le typage, la traduction du spec et les répercussions, dans un second commit :
   `[SOIN] Convertit le modèle \`MonModele\` en Typescript`

À savoir :

- L'onglet _Files changed_ d'une PR GitHub affiche le diff **cumulé** de la branche : il peut toujours montrer un delete/add. L'onglet _Commits_ montre bien le renommage sur le premier commit.
- Merger ces PR en **rebase** ou en **merge commit**, jamais en squash : le squash fusionne les deux commits et perd le renommage sur `master`.
- Vérifier l'historique après merge : `git log --follow -- src/modeles/monFichier.ts` doit remonter jusqu'au `.js`.

## Conversion d'un fichier source

1. **Renommer en préservant l'historique** : `git mv monFichier.js monFichier.ts`, dans le commit de renommage seul (voir ci-dessus). Les imports restants pointant vers `./monFichier.js` n'ont **pas** besoin d'être modifiés — l'extension `.js` dans les imports résout correctement le `.ts` (moduleResolution `NodeNext`).
2. **Typer le constructeur** : les données d'entrée sont un type `DonneesX` exporté.
   - Si le constructeur a une valeur par défaut `= {}` (données optionnelles), typer en `Partial<DonneesX> = {}`.
   - Si le constructeur n'a **pas** de défaut (données requises), typer en `DonneesX` directement, **sans** `Partial<>`.
   - **Exception** : une classe instanciée dynamiquement par `Base` **doit** garder `Partial<DonneesX> = {}`, car le type d'entrée exigé est `Record<string, unknown>` (incompatible avec un type requis non-`Partial`). Deux cas :
     - **item d'un `ElementsConstructibles<T>`** (passé là où un `Constructible<T>` est attendu) — ex. `ActeurHomologation` (item d'`ActeursHomologation`).
     - **agrégat déclaré dans `listesAgregats`** (passé là où un `ConstructeurAgregat` est attendu) — ex. `ActeursHomologation`, `PartiesPrenantes` (agrégats de `RolesResponsabilites`).
3. **Déclarer les propriétés de classe** :
   - Propriétés remplies dynamiquement par `renseigneProprietes` (via `Base`) : les déclarer avec l'opérateur d'assignation définie `!` (ex. `readonly nom!: string;`), car TS ne voit pas l'affectation faite dans la classe mère.
   - Propriétés internes non exposées : `private readonly`.
   - Marquer `readonly` tout ce qui n'est pas réaffecté après construction.
4. **Types énumérés** : remplacer les valeurs libres par des unions de littéraux (ex. `type CategorieRisque = 'disponibilite' | 'integrite' | ...`). Exporter le type s'il est réutilisé.
5. **Constantes statiques** : convertir les patterns `const X = {...}; Object.assign(Classe, X)` en propriétés `static` de la classe (ex. `static NIVEAU_RISQUE_INDETERMINABLE = 'indeterminable';`).
6. **Référentiel** : importer le type via `import { Referentiel } from '../referentiel.interface.js';` (ou `TousReferentiels`) et les fabriques via `import { creeReferentielVide } from '../referentiel.js';`. Remplacer `import * as Referentiel` + `Referentiel.creeReferentielVide()` par l'import nommé.
7. **Annoter les retours de méthode** quand cela clarifie l'API (ex. `intituleRisque(): string`). Inutile de sur-annoter ce que TS infère trivialement.
8. **Fonctions de création passées à `ListeItems`** : une fabrique dont le `cree` est passé au constructeur de `ListeItems` (via `ElementsFabricables`) **doit** typer son paramètre en `Record<string, unknown>`, car `ListeItems` impose `fonctionCreation: (donnees: Record<string, unknown>) => T`. Un type d'entrée plus strict (ex. `DonneesPartiePrenante`) casse la compatibilité par contravariance (`Record<string, unknown>` n'est pas assignable à un type exigeant des propriétés). Le typage fort reste porté par les constructeurs appelés à l'intérieur.
9. **Retour de `toJSON()`** : `Base.toJSON()` renvoie `object` (volontairement générique). Si un `toJSON()` surchargé est consommé pour accéder à un champ (ex. `partiesPrenantes.hebergement()?.nom`), **annoter son type de retour** (ex. `Partial<DonneesX> & { type: string }`) — `Partial<>` car `toJSON()` filtre les propriétés `undefined`, donc aucune n'est garantie.
10. **La cible peut contraindre ses dépendances déjà converties** : typer un modèle racine révèle parfois qu'une dépendance déjà en TS doit être assouplie (passage en `Partial<>` d'un agrégat, annotation d'un `toJSON()`) ou qu'un type est trop strict pour un consommateur existant (données de requête). Lancer `tsc --noEmit` sur **tout le projet** après la cible pour capter ces répercussions.

## Conversion du `.spec` (expect.js → Vitest)

Vitest est configuré avec `globals: true` : `describe`, `it`, `expect`, `beforeEach` sont **globaux**, aucun import à ajouter.

1. `git mv monFichier.spec.js monFichier.spec.ts`, dans le même commit de renommage seul que le source.
2. **Supprimer** `import expect from 'expect.js';`.
3. **Traduire les matchers** :
   | expect.js                                | Vitest                    |
   | ---------------------------------------- | ------------------------- |
   | `.to.be(x)`                              | `.toBe(x)`                |
   | `.to.equal(x)`                           | `.toEqual(x)`             |
   | `.to.eql(x)`                             | `.toEqual(x)`             |
   | `.to.be.a(Classe)` / `.to.be.an(Classe)` | `.toBeInstanceOf(Classe)` |
   | `.to.have.length(n)`                     | `.toHaveLength(n)`        |
4. **Exceptions** : remplacer le pattern `try { ...; expect().fail(); } catch (e) { expect(e).to.be.a(ErreurX); expect(e.message).to.equal('...'); }` par :
   ```ts
   expect(() => codeQuiLeve()).toThrowError(new ErreurX('message attendu'));
   ```
   Idem pour `.to.throwException((e) => {...})`.
5. **Typer les variables** de test réassignées dans un `beforeEach` (ex. `let referentiel: Referentiel;`).
6. **Supprimer les alias `it`** (`const elle = it;`, `const ils = it;`, `const elles = it;`) et utiliser directement `it` : ce sont des reliquats historiques qui perturbent le bon fonctionnement des IDE. Conserver les libellés en français tels quels.

## Vérification

À chaque item, la barrière verte est **`pnpm exec vitest run <chemins des specs concernés>`** (jamais `npx`, cf. `CLAUDE.md`). Le typecheck passe par `pnpm exec tsc --noEmit` (src) **et** `pnpm exec tsc --noEmit -p test` (tests, vérifiés en CI) — `pnpm test:types` lance les deux. `pnpm test` lance ESLint puis Vitest sur tout le projet.

## Références

Commits de conversion exemplaires : `4170e44` (Risque), `ffe1148` (RisqueGeneral), `54bb108` (Utilisateur).
