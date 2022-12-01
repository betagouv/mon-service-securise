import { $services, $modaleNouveauContributeur } from './modules/elementsDom/services.mjs';
import { brancheModale } from './modules/interactions/modale.mjs';
import brancheComportementSaisieContributeur from './modules/interactions/saisieContributeur.js';

$(() => {
  const peupleServicesDans = (placeholder, donneesServices, idUtilisateur) => {
    const $conteneurServices = $(placeholder);
    const nombreMaxContributeursDistincts = 2;
    const $conteneursService = $services(
      donneesServices,
      idUtilisateur,
      'ajout-contributeur',
      nombreMaxContributeursDistincts
    );

    $conteneurServices.prepend($conteneursService);

    $('main').append($modaleNouveauContributeur());
    brancheModale('.ajout-contributeur', '#rideau-nouveau-contributeur');
    brancheComportementSaisieContributeur('.ajout-contributeur');
    brancheModale('#nouveau-service', '#modale-nouveau-service');
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => reponse.data.utilisateur.id)
    .then((idUtilisateur) => axios.get('/api/homologations')
      .then((reponse) => peupleServicesDans('.services', reponse.data.homologations, idUtilisateur)));
});
