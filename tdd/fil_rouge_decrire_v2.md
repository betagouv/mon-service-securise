# Les services ont une description V2

## TODO

- [ ] moteur v2 : optimisation pour `break` la boucle d'évaluation d'un champ dès qu'on a un match ?
  - ça veut dire dès que `if (valeurReelle === valeurRegle)` est vrai, on `break;`
- [ ] Le moteur de règles v2 jette des erreurs "en cas de problème" : mais "problème" reste à définir.
- [ ] Parsing du CSV jette des erreurs en cas de "il manque des colonnes attendues"
- [ ] Parsing du CSV : vers du code générique qui boucle sur une collection de tous les champs attendus
- [ ] chaque étape de décrire permet de mettre à jour une propriété du brouillon
  - [ ] la route permettant de rajouter des données vérifie la cohérence de ces données (via `referentiel` ou via `zod` ?)
- [ ] un service v2 utilise un moteur de règles v2 (ou des reglesPersonnalisation v2 ?)
  - ce moteur de règles génère une liste de mesures v2

## TODO plus tard

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

- [x] Parsing du CSV jette des erreurs en cas de statut initial inconnu
- [x] Parsing du CSV jette des erreurs en cas de modificateur inconnu du référentiel
- [x] Le moteur de règles v2 jette des erreurs en cas de mesure inconnue du référentiel
- [x] Un CSV peut être converti en règles MSS
- [x] Le moteur v2 travaille sur certaines clés bien définies de la DescriptionServiceV2
- [x] Le moteur de règles v2 gère plusieurs valeurs+modificateurs pour un même champ
  - exemple : on veut 3 valeurs+modificateurs possibles pour "Niveau de sécurite"
- [x] Remplacer enum par constante string pour les modificateur : 'RETIRER' | 'AJOUTER' …
- [x] Le moteur de règles v2 peut retirer une mesure
- [x] Le moteur de règles v2 peut rendre une mesure indispensable
- [x] Le moteur de règles v2 peut rendre une mesure recommandée
- [x] Le moteur de règles v2 peut rajouter une mesure

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
