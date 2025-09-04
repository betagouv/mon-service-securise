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

### Les migrations BDD

- [ ] table `utilisateurs`
  - champ `nom`
  - champ `prenom`
  - champ `postes` qui est un `[]`
- [ ] table `services`
  - champ `risquesSpecifiques[].intitule`, `commentaire`, `description`
  - champ `risquesGeneraux[].commentaire`

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

### Pas besoin de changer :

- NiveauxDeSecurite.svelte : on affiche des données statiques qui viennent du code source
