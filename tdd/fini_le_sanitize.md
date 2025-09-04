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

- en BDD : table `utilisateurs` > champs `nom` `prenom`
  - svelte/lib/gestionContributeurs/kit/ChampAvecSuggestions.svelte:97
    - `prenomNom` qui fini sur Utilisateur
  - svelte/lib/gestionContributeurs/invitation/ListeInvitations.svelte:15
    - des `invitations` qui contiennent un `utilisateur` avec `prenomNom`
  - svelte/lib/gestionContributeurs/kit/LigneContributeur.svelte:38 qui fait `prenomNom`
