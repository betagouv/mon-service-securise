# La TODO list de l'import des mesures spécifiques

## Vocabulaire

On dit [Modèles de mesure spécifique] pour parler de la partie « référentiel de mesures lié à l'utilisateur ».

## Du point de vue des Modèles de mesure

### CSV

- Voir [la todo dédiée](televersement_mesures_specifiques.md)

## Du point de vue du Front

- [ ] Les badges des onglets sont mis à jour en fonction de la recherche

## Du point de vue de la page "SÉCURISER"

- [ ] Bonus : voir les lignes concernées par l'association clignoter en bleu

## Du point de vue du service

- [x] L'association des mesures est supprimée lorsqu'un service est supprimé
  - [x] sur la route DELETE `/api/service/id`
  - [x] Dans `ConsoleAdministration.supprimeService`
- [x] Les mesures associées sont dissociées lorsqu'un utilisateur est supprimé de la contribution d'un service depuis l'interface
  - [x] sur la route DELETE `/api/autorisation?idService=&idContributeur=`
  - [x] `ConsoleAdministration.supprimeUtilisateurParEmail`
- [ ] Les mesures associées sont dissociées lorsqu'un utilisateur perd les droits d'écriture sur SÉCURISER depuis l'interface
  - [ ] sur la route PATCH `/api/service/:id/autorisations/:idAutorisation`
- [x] Les mesures associées sont dissociées lorsqu'un utilisateur est supprimé depuis la console admin
  - [x] `ConsoleAdministration.supprimeUtilisateurParEmail` qui appelle `depotDonneesUtilisateur.supprimeUtilisateur`
- [ ] La duplication d'un service entraine la duplication des associations entre idServiceADuplique <=> idModele vers idServiceDuplique <=> idModele
  - [ ] sur la route COPY `/api/service/id`

TABLE MODELE
ID ID_UTILISATEUR

TABLE ASSOCIATION
ID_MODELE ID_SERVICE
