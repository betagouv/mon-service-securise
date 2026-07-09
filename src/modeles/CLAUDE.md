# Migration JS → TypeScript (modèles de domaine)

Guide pour convertir un fichier `.js` du domaine en TypeScript **strict** (`tsconfig.json` : `strict: true`). Le style du projet reste inchangé : nommage **en français**, pas de commentaires superflus, code propre.

## Principe : de bas en haut

On convertit **toutes les dépendances d'un fichier avant le fichier lui-même**, en remontant l'arbre d'import des feuilles vers la racine. Un fichier n'est converti que lorsque tout ce qu'il importe est déjà en `.ts` (ou l'était déjà).

Découpage en **items** : un item = un fichier source + son `.spec` associé. On avance **pas à pas**, avec une **pause review/commit entre chaque item**. Les fichiers triviaux et quasi identiques (ex. sous-types d'une même classe) peuvent être regroupés en un seul item.

## Conversion d'un fichier source

1. **Renommer en préservant l'historique** : `git mv monFichier.js monFichier.ts`. Les imports restants pointant vers `./monFichier.js` n'ont **pas** besoin d'être modifiés — l'extension `.js` dans les imports résout correctement le `.ts` (moduleResolution `NodeNext`).
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

1. `git mv monFichier.spec.js monFichier.spec.ts`.
2. **Supprimer** `import expect from 'expect.js';`.
3. **Traduire les matchers** :
   | expect.js | Vitest |
   | --- | --- |
   | `.to.be(x)` | `.toBe(x)` |
   | `.to.equal(x)` | `.toEqual(x)` |
   | `.to.eql(x)` | `.toEqual(x)` |
   | `.to.be.a(Classe)` / `.to.be.an(Classe)` | `.toBeInstanceOf(Classe)` |
   | `.to.have.length(n)` | `.toHaveLength(n)` |
4. **Exceptions** : remplacer le pattern `try { ...; expect().fail(); } catch (e) { expect(e).to.be.a(ErreurX); expect(e.message).to.equal('...'); }` par :
   ```ts
   expect(() => codeQuiLeve()).toThrowError(new ErreurX('message attendu'));
   ```
   Idem pour `.to.throwException((e) => {...})`.
5. **Typer les variables** de test réassignées dans un `beforeEach` (ex. `let referentiel: Referentiel;`).
6. **Supprimer les alias `it`** (`const elle = it;`, `const ils = it;`, `const elles = it;`) et utiliser directement `it` : ce sont des reliquats historiques qui perturbent le bon fonctionnement des IDE. Conserver les libellés en français tels quels.

## Vérification

À chaque item, la barrière verte est **`npx vitest run <chemins des specs concernés>`**. Le typecheck complet passe par `pnpm build:back` (tsc) ; `pnpm test` lance ESLint puis Vitest sur tout le projet.

## Références

Commits de conversion exemplaires : `4170e44` (Risque), `ffe1148` (RisqueGeneral), `54bb108` (Utilisateur).
