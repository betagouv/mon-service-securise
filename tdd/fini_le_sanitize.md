## TODO

- [ ] Migration des données.
  - JSON.stringify avec un `formatter` custom qui `decode` ?

## DONE

- [x] Voir les concaténations de chaînes faites en jQuery…
  - par exemple public/entete.js:10 qui met dans le DOM `prenomNom`. Si `prenomNom` a du `<h1>` ça pose problème.
- [x] Enlever le code qui encode les entités HTML : `escape()` dans `middleware.aseptise()`.
  - [x] D'autres ? Chercher "html-entities" qui sert à importer des `encode()`
- [x] Enlever des `decode()` qui sont sur des données saisies
- [x] Enlever les `!{` en pug
- [x] Enlever les `@html` qui sont sur des données saisies
  - [x] ActiviteAjoutCommentaire.svelte il faut conserver la possibilité de mentionner qqun
  - [x] LigneMesure.svelte il faut conserver le surlignage quand on recherche un texte
- [x] Enlever les != en pug
- [x] Voir le problème de Ce fichier .ZIP contient les <span id="nbPdfDisponibles"></span> PDF.

## Les migrations BDD

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
    - `organisationResponsable.nom`
  - champ `risquesGeneraux[].commentaire`
  - champ `risquesSpecifiques[]`
    - `intitule`, `commentaire`, `description`
  - champ `mesuresGenerales[].modalites`
  - champ `mesuresSpecifiques[]`
    - `description`, `descriptionLongue`, `modalites`
  - champ `dossiers[]`
    - `autorite.nom` et `autorite.fonction`
    - `avis[].commentaires` et `avis[].collaborateurs`
    - `documents[]`
  - champ `rolesResponsabilites`
    - `acteursHomologation[].role`, `nom`, `fonction`
    - `partiesPrenantes[].nom`, `natureAcces`, `pointContact`

- [ ] table `activites_mesure`

  - `WHERE type = 'ajoutCommentaire'` colonne `detail` est un JSON : on veut update `contenu`

- [ ] table `modeles_mesure_specifique`, colonne 'donnees'

## Les tests pour vérifier :

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

## Pas besoin de changer :

- NiveauxDeSecurite.svelte : on affiche des données statiques qui viennent du code source
