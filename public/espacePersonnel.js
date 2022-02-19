import { $homologations, $modaleNouveauContributeur } from './modules/elementsDom/homologations.js';
import { brancheModales } from './modules/interactions/modale.mjs';
import brancheComportementSaisieContributeur from './modules/interactions/saisieContributeur.js';

$(() => {
  const peupleHomologationsDans = (placeholder, donneesHomologations, idUtilisateur) => {
    const $conteneurHomologations = $(placeholder);
    const $conteneursHomologation = $homologations(donneesHomologations, idUtilisateur, 'ajout-contributeur');

    $conteneurHomologations.prepend($conteneursHomologation);

    $('body').append($modaleNouveauContributeur());
    brancheModales('.ajout-contributeur', 'body');
    brancheComportementSaisieContributeur('.ajout-contributeur');
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => reponse.data.utilisateur.id)
    .then((idUtilisateur) => axios.get('/api/homologations')
      .then((reponse) => peupleHomologationsDans('.homologations', reponse.data.homologations, idUtilisateur)));
});
