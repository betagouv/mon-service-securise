# Les services ont une description V2

## TODO

#### Modale Nouveau référentiel

- [x] On affiche la modale si l'utilisateur ne l'a pas validée et que le feature flag est activé
- [x] On stocke le "dejaTermine" pour un utilisateur
- [x] On lis le "dejaTermine" dans le middleware
- [ ] On affiche la modale UNE FOIS par connexion, sur le tableau de bord
- [ ] On affiche la modale QUE SI l'utilisateur a encore des services V1
- [ ] Tout le contenu de la modale

#### MEP V2

- retirer le bouton de téléversement V1
- supprimer les téléversements V1 en base

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

#### Référentiel v2

- [x] Créer un ref v2 qui implémente la même interface que reférentiel v1 avec un spread
- [x] Créer un objet serveur refV2 qui sera passé au dépôt de données pour être utilisé par la création de service
- [x] Déplacer les méthodes xxxV2 du réfv1 en surchargeant plutôt une méthode du refV1
  - [x] Remplacer les utilisations des méthodes xxxV2 existantes
  - [x] Remplacer l'utilisation de `identifiantsMesures` par `estIdentifiantMesureConnu` car les appelants font la même chose
    - [x] Puis implémenter la méthode dans le refv2 et voir si on peut contextualiser partout
- [x] Les données V2 ne doivent pas être dans le referentiel v1
- [ ] Chasser chaque utilisation de `referentiel.xxx()` pour le remplacer par `service.referentiel.xxx()`

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

#### Liste de mesures (modèles)

- [ ] /services/mesuresGenerales/:id (assigner une mesure générale à des services) il faut discerner les mesures v1/V2 et vérifier qu'on n'associe pas une mesure v1 à un service v2 et inversement

#### Autre

- [ ] Tableau de bord : afficher le bouton « Ajouter service » dans le cas où on a 0 service mais un/des brouillon.
- [ ] Svelte : que `npm run build:front` déclecnche un `tsc` dans `svelte/` pour vérifier qu'il n'y a pas d'erreur TS

## TODO plus tard

- Svelte : les questions ont des `<label>` haut-niveau qui ont des `@for`… mais aucun contrôle n'a de `@name` qui correspond. On pourrait aller vers https://stackoverflow.com/a/13273841
- On va devoir décommissioner le code qui permet de créer des services v1
  - supprimer le téléversement v1
- [ ] On peut sélectionner un brouillon pour le supprimer
- Penser à afficher l'erreur si le nom de service est déjà utilisé (erreur dans le POST /finalise)
- Estimation du niveau de sécurité v2, sur le front : on a `POST /api/service/estimationNiveauSecurite` pour les dragons v1,
  - on imagine cloner pour `POST /api/service/v2/estimationNiveauSecurite` qui appellera en static `DescriptionServiceV2.estimeNiveauDeSecurite`
- Le dépot de Brouillon est une classe TS ?
- Metabase : au moment du switch, on imagine un nouvel event `SERVICE_A_ETE_MIGRE` qui dit `versionCible: "v2"`
- Description service et description service v2 doivent implémenter une interface commune
  - technique : pour sérialiser
  - métier : pour dupliquer, pour exploiter les données métier du service (les passe plat `descriptionService.*`)
- Regarder toutes les routes connectées de page Service et vérifier s'il faut du v2

## DONE

#### Téléversement Excel

- [x] `valide()` devient privé
- [x] dépôt de données passé à la méthode `rapportDetaille`
- [x] Bien penser que « type Hébergement : SaaS » = cocher les 2 activités externalisées

## Exemple de mesure personnalisée renvoyée par le moteur de règles V1 (`.mesures()`)

[SERVEUR] "hebergementUE": {
[SERVEUR] "description": "Héberger le service numérique et les données au sein de l'Union européenne",
[SERVEUR] "categorie": "gouvernance",
[SERVEUR] "descriptionLongue": "<p>Privilégier le recours à un hébergeur proposant la localisation au sein de l'Union européenne du service numérique et des données.</p><p>Cette mesure vise à renforcer la protection des données grâce aux garanties offertes par la réglementation européenne et à faciliter les actions de remédiation et d'investigation en cas d'incident de sécurité.</p>",
[SERVEUR] "referentiel": "ANSSI",
[SERVEUR] "identifiantNumerique": "0007",
[SERVEUR] "indispensable": false
[SERVEUR] },
[SERVEUR] "testIntrusion": {
[SERVEUR] "description": "Réaliser un test d'intrusion ou une campagne de recherche de bug",
[SERVEUR] "categorie": "gouvernance",
[SERVEUR] "descriptionLongue": "<p>Faire réaliser un test d'intrusion et/ou une campagne de recherche de bug (bug bounty) du service, par un prestataire ou par un service compétent.</p><p>Cette mesure permet d'identifier des vulnérabilités du service en vue de les corriger et ainsi renforcer sa sécurité.</p>",
[SERVEUR] "referentiel": "ANSSI",
[SERVEUR] "identifiantNumerique": "0013",
[SERVEUR] "indispensable": true
[SERVEUR] },
