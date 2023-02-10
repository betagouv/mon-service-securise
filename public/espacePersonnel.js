import { $services, $modaleNouveauContributeur } from './modules/elementsDom/services.mjs';
import { brancheModale } from './modules/interactions/modale.mjs';
import brancheComportementPastilles from './modules/interactions/pastilles.js';
import brancheComportementSaisieContributeur from './modules/interactions/saisieContributeur.js';
import brancheMenuContextuelService from './modules/interactions/brancheMenuContextuelService.js';

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
    brancheComportementPastilles('.pastille');

    $('main').append($modaleNouveauContributeur());
    brancheModale('.ajout-contributeur', '#rideau-nouveau-contributeur');
    brancheComportementSaisieContributeur('.ajout-contributeur');
    $('.service').each((_index, service) => brancheMenuContextuelService($(service)));

    brancheModale('#nouveau-service', '#modale-nouveau-service');
  };

  const afficheBandeauMajProfil = () => {
    $('.bandeau-maj-profil').removeClass('invisible');
  };

  axios.get('/api/utilisateurCourant')
    .then(({ data }) => data.utilisateur)
    .then((utilisateur) => {
      axios.get('/api/homologations')
        .then(({ data }) => peupleServicesDans('.services', data.homologations, utilisateur.id));

      if (!utilisateur.profilEstComplet) afficheBandeauMajProfil();
    });
});
