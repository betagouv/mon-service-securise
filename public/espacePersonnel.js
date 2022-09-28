import { brancheModales } from './modules/interactions/modale.mjs';
import { $services, $modaleNouveauContributeur } from './modules/elementsDom/services.js';
import brancheComportementSaisieContributeur from './modules/interactions/saisieContributeur.js';

$(() => {
  const peupleServicesDans = (placeholder, donneesServices, idUtilisateur) => {
    const $conteneurServices = $(placeholder);
    const $conteneursService = $services(donneesServices, idUtilisateur, 'ajout-contributeur');

    $conteneurServices.prepend($conteneursService);

    $('main').append($modaleNouveauContributeur());
    brancheModales('.ajout-contributeur', 'main');
    brancheComportementSaisieContributeur('.ajout-contributeur');
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => reponse.data.utilisateur.id)
    .then((idUtilisateur) => axios.get('/api/homologations')
      .then((reponse) => peupleServicesDans('.services', reponse.data.homologations, idUtilisateur)));
});
