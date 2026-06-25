# Architecture technique — MonServiceSécurisé

Ce fichier résume l'architecture du backend (dossier `src/`). Pour l'installation et le lancement, voir `README.md`.

## RÈGLE D'OR

Ne **JAMAIS** accéder ou tenter d'accéder au fichier `.env` à la racine du projet.

## Vue d'ensemble

- **Runtime** : Node.js (version dans `.nvmrc`), TypeScript + JavaScript (migration progressive JS → TS).
- **Serveur HTTP** : Express (rendu Pug côté serveur + API JSON).
- **Persistance** : PostgreSQL via Knex (pas d'ORM). Migrations dans `/migrations/`, config dans `knexfile.js`.
- **Frontend** : rendu Pug serveur + îlots Svelte 5 dans `/svelte/` (compilés vers `/public/composants-svelte/`).
- **Tests** : Vitest (`vitest.config.ts`), tests dans `/test/` et `/test_accessibilite/`.

## Point d'entrée

- `server.ts` — bootstrap : instancie les adaptateurs via des factories (`fabrique*`), assemble le dépôt de données, le bus d'événements et les abonnés, puis appelle `MSS.creeServeur()`.
- `src/mss.js` — assemblage Express : middlewares (CSRF, rate-limit, CSP, cookie-session), moteur Pug, montage des routes, gestion d'erreurs.

## Style architectural

Architecture en **couches + ports/adaptateurs** (hexagonal-leaning). Convention de nommage **en français** dans tout le projet.

```
src/
├── modeles/        ← Domaine : objets riches (Service, Dossier, Utilisateur, Mesure,
│                     Autorisation, Risque, Avis, Entite…)
├── depots/         ← Couche persistance : un dépôt par agrégat, agrégés par
│                     src/depotDonnees.js (façade injectée partout)
├── adaptateurs/    ← Ports externes : Postgres, JWT, chiffrement, mail, PDF
│                     (Puppeteer), OIDC, Sentry, tracking, environnement
├── routes/         ← Contrôleurs HTTP : split connecte/ vs nonConnecte/,
│                     handlers fonctionnels (pas de classes)
├── http/           ← Middlewares, validation Zod (schemas/), JWT, CSP, CSRF
├── bus/            ← Bus d'événements pub/sub (fire-and-forget) + abonnements/
├── vues/           ← Templates Pug (rendu serveur)
├── moteurRegles/   ← Évaluation du référentiel ANSSI contre l'état d'un service
├── moteurRisques/  ← Calculs sur les risques
├── oidc/           ← Flux OpenID Connect
├── session/, utilisateur/, notifications/, supervision/, tracking/, taches/
└── erreurs.ts      ← Erreurs domaine (~80 classes, héritant d'ErreurModele)
```

## Points clés

- **Injection de dépendances** : tout passe par des factories (`fabriqueAdaptateurPersistance`, `fabriqueAdaptateurMail`…) qui permettent de swap mémoire/réel selon l'environnement. Les adaptateurs sont injectés à `MSS.creeServeur()`.
- **Dépôt de données** : `src/depotDonnees.js` est la façade qui compose tous les `depots/depot*.js`. Toute la logique d'accès aux données passe par lui.
- **Chiffrement au repos** : les champs sensibles sont chiffrés par l'adaptateur de persistance avant insertion (ChaCha20).
- **Routes** : montées dans `mss.js` sous `/`, `/api`, `/oidc`, `/bibliotheques`, `/statique`. Pas de classes de contrôleur — ce sont des fonctions qui valident (Zod), appellent le domaine, et renvoient.
- **Auth** : `cookie-session` signé + JWT via `adaptateurJWT`. Middleware `verificationJWT` garde les routes protégées. OIDC complet dans `src/oidc/`, MFA optionnel par fournisseur.
- **Bus d'événements** : `src/bus/busEvenements.js` diffuse les événements domaine (ex. `EvenementNouveauServiceCree`). Les abonnés (tracking, mail, journal, supervision) sont câblés dans `server.ts` via `cableTousLesAbonnes()`.
- **Configuration** : 100+ variables d'env (voir `.env.template`), centralisées dans `src/adaptateurs/adaptateurEnvironnement.js`. Feature flags = variables d'env (ex. `FEATURE_FLAG_AVEC_RISQUES_V2`).
- **Erreurs** : toutes les erreurs domaine héritent de `ErreurModele` dans `src/erreurs.ts`. Le handler global dans `mss.js` les mappe en réponses HTTP.

## Branchement d'un composant Svelte

Pour ajouter un nouveau composant Svelte (îlot) dans une page Pug. Voir aussi `svelte/CLAUDE.md` (Svelte 5 runes) et `src/vues/CLAUDE.md` (conventions Pug).

**1. Créer le composant dans `svelte/lib/monComposant/`** (le dossier donne le nom de l'entrée) :

- `MonComposant.svelte` — le composant (PascalCase).
- `monComposant.ts` — **point d'entrée** : monte le composant sur un élément du DOM. Tout fichier `.ts` sous `svelte/lib/**` est détecté automatiquement par Vite (`svelte/vite.config.mts`) et bundlé en `public/composants-svelte/<cheminRelatif>.js`.
- `monComposant.d.ts` (optionnel) — types des props, partagés avec le Pug via `+donneesPartagees`.

Exemple d'entrée, calqué sur `svelte/lib/connexion/connexion.ts` :

```ts
import MonComposant from './MonComposant.svelte';
import { mount } from 'svelte';

mount(MonComposant, {
  target: document.getElementById('mon-composant')!,
  props: {
    /* ... */
  },
});
```

**2. Brancher dans le `.pug` de la route Express** :

- Ajouter le point de montage (id kebab-case) dans `block main` (ou `block formulaire` selon le layout) :
  ```pug
  block main
    #mon-composant
  ```
- Monter le bundle dans `block append scripts` via le mixin `+composantSvelte` (défini dans `src/vues/fragments/composantSvelte.pug`, déjà inclus via `mss.pug`) :
  ```pug
  block append scripts
    +composantSvelte('monComposant.js')
  ```
- Passer des données depuis `reponse.locals` avec `+donneesPartagees('id-donnees', { ... })` ; le composant les lit dans un `<script type="application/json">`.
- Si le composant a du CSS scoped, ajouter `+feuilleDeStyleSvelte()` dans `block append styles` (une seule fois par page suffit).

## Conventions de nommage (français)

`depots` = repositories · `modeles` = domain models · `adaptateurs` = adapters/ports · `vues` = views · `routes` = route handlers · `bus` = event bus · `erreurs` = custom errors · `fabrique*` = factory · `moteur*` = engine.

Classes en français : `Service`, `Dossier`, `Utilisateur`, `Mesure`, `Autorisation`, `Risque`…

## Tests

- Runner : **Vitest**. Unitaires dans `/test/` (miroir de la structure `src/`).
- Les tests instancient directement les objets de domaine — pas de mocks de DB, utilisation de l'adaptateur de persistance en mémoire (`adaptateurPersistanceMemoire.js`).
- A11y/E2E : `/test_accessibilite/` (Playwright, voir `playwright.config.ts`).
