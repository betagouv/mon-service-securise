## Occurrences of '!{' in Project

`src/vues/fragments/donneesPartagees.pug  (1 usage found)`
`3 !{JSON.stringify(donnees)}`

- ????

`src/pdf/modeles/annexeRisques.pug  (1 usage found)`
`57 p.commentaire #[strong Commentaire :] !{risque.commentaire}`

- Commentaire dans un risque

`src/vues/fragments/inputChoix.pug`
`11 .decoration !{decoration}`

- Je ne vois personne qui utilise ce paramètre de mixin

`src/vues/fragments/elementsAjoutables/elementsAjoutablesAvis.pug  (2 usages found)`
`18 each collaborateur in donneesUnAvis.collaborateurs`
`option(value!= collaborateur, selected) !{collaborateur}
20 option(value!= contributeur.prenomNom()) !{contributeur.prenomNom()}`

- Les avis sur une homologation
- Les nom prénom de contributeur de service

## Dans Svelte

### TODO

- [ ] Enlever les `@html` qui sont sur des données saisies
- [ ] ActiviteAjoutCommentaire.svelte il faut conserver la possibilité de mentionner qqun
- [ ] LigneMesure.svelte il faut conserver le surlignage quand on recherche un texte
- [ ] Enlever des `decode()` qui sont sur des données saisies
- [ ] Enlever les !{ en pug
- [x] Enlever les != en pug
- [ ] Voir le problème de Ce fichier .ZIP contient les <span id="nbPdfDisponibles"></span> PDF.
- [ ] Migration des données

### Les migrations BDD

- [ ] table `utilisateurs`
  - champ `nom`
  - champ `prenom`
  - champ `postes` qui est un `[]`
- [ ] table `services`

  - champ `descriptionService`
    - `nomService`
    - `pointsAcces[].description`
    - `donneesSensiblesSpecifiques[].description`
    - `fonctionnalitesSpecifiques[].description`
  - champ `risquesGeneraux[].commentaire`
  - champ `risquesSpecifiques[]`
    - `intitule`, `commentaire`, `description`
  - champ `mesuresGenerales[].modalites`
  - champ `mesuresSpecifiques[]`
    - `description`, `modalites`
  - champ `dossiers[]`
    - `autorite.nom` et `autorite.fonction`
    - `avis[].commentaires` et `avis[].collaborateurs`
    - `documents[]`
  - champ `rolesResponsabilites`
    - `acteursHomologation[].role`, `nom`, `fonction`
    - `partiesPrenantes[].nom`, `natureAcces`, `pointContact`

- [ ] table `activites_mesure`
  - `WHERE type = 'ajoutCommentaire'` colonne `detail` est un JSON : on veut update `contenu`

### Les tests pour vérifier :

- Pour `utilisateurs.[nom|prenom]`:
  - gestionContributeurs/kit/ChampAvecSuggestions.svelte:97
  - gestionContributeurs/invitation/ListeInvitations.svelte:15
  - gestionContributeurs/kit/LigneContributeur.svelte:38
  - SuppressionContributeur.svelte
  - ListeSuggestionsMention.svelte
- Pour `utilisateurs.postes`
  - LigneContributeur.svelte
- Pour les `risquesSpecifiques` et `risquesGeneraux` :
  - la liste des risques sur la page `/risques`,
  - le tiroir de risque général
  - le tiroir de risque spécifique
- Pour `services`
- table `activites_mesure`
  - l'onglet Activité de la mesure "Limiter et connaître…" sur http://localhost:3000/service/76b6025d-212c-4978-9662-cf0e5287538c/mesures commentaire du 04/09/2025
  - `descriptionService.nom` : partout

### Pas besoin de changer :

- NiveauxDeSecurite.svelte : on affiche des données statiques qui viennent du code source
