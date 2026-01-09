# Les services ont une description V2

## TODO

##### Nettoyage post MEP

- TiroirTeleversementServices.svelte
- évènement : svelte-recharge-rapport-televersement-services
- paramètre url : rapportTeleversement
- RapportTeleversementServices.svelte
- les fonctions v1 dans rapportTeleversementServices.api.ts
- serviceTeleverse.js
- televersementServices.js
- ` || !(televersementServices instanceof TeleversementServicesV2)` dans la route
- table televersement_services colonne version_service + adaptateur Postgres
- adaptateurTeleversementServices.xls la méthode v1 et les constantes associées
- La route GET `api/referentiel/mesures` renvoi les mesures V1 par défaut, pour un utilisateur sans service
  - On veut sûrement renvoyer les mesures V2 après la MEP
- l'adaptateurEnvironnement dans actionRecommandee()
- suppression de la route création v1
  - supprimer dans referentiel `versionServiceParDefaut`

#### Moteur v2

- [ ] Jette des erreurs "en cas de problème" : mais "problème" reste à définir.
- [ ] Optimisation pour `break` la boucle d'évaluation d'un champ dès qu'on a un match ?
  - ça veut dire dès que `if (valeurReelle === valeurRegle)` est vrai, on `break;`

#### Parsing CSV

- [ ] Tester que "statut initial" vide fonctionne bien
- [ ] Vérifier qu'on peut bien traduire chaque colonne contenant potentiellement un modificateur
  - Exemple : on doit savoir traduire "Données: +", "Données: ++", etc.
- [ ] Jette des erreurs en cas de "il manque des colonnes attendues"
- [ ] Vers du code générique qui boucle sur une collection de tous les champs attendus ? Ça sera peut-être le cas une fois `Projection…` mise en place

#### Autre

- [ ] Svelte : que `npm run build:front` déclecnche un `tsc` dans `svelte/` pour vérifier qu'il n'y a pas d'erreur TS

## TODO plus tard

- Svelte : les questions ont des `<label>` haut-niveau qui ont des `@for`… mais aucun contrôle n'a de `@name` qui correspond. On pourrait aller vers https://stackoverflow.com/a/13273841
- On va devoir décommissioner le code qui permet de créer des services v1
  - supprimer le téléversement v1
- [ ] On peut sélectionner un brouillon pour le supprimer
