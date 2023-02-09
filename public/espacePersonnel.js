import { $services, $modaleNouveauContributeur } from './modules/elementsDom/services.mjs';
import { brancheModale, initialiseComportementModale } from './modules/interactions/modale.mjs';
import brancheComportementPastilles from './modules/interactions/pastilles.js';
import brancheComportementSaisieContributeur from './modules/interactions/saisieContributeur.js';
import brancheMenuContextuelService from './modules/interactions/brancheMenuContextuelService.js';
import { brancheValidation, declencheValidation } from './modules/interactions/validation.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

$(() => {
  const $modaleSuppression = $('.modale-suppression-service');
  initialiseComportementModale($modaleSuppression);
  $('.services').on('modaleSuppression', (_evenement, { idService, nomService }) => {
    $('.nom-service', $modaleSuppression).text(nomService);

    const $bouton = $('.bouton-suppression-service', $modaleSuppression);
    $bouton.on('click', () => axios.delete(`/api/service/${idService}`).then(() => window.location.reload()));
    $modaleSuppression.on('fermeModale', () => $bouton.off());
    $modaleSuppression.trigger('afficheModale');
  });

  const $modaleDuplication = $('.modale-duplication-service');
  initialiseComportementModale($modaleDuplication);
  $('.services').on('modaleDuplication', (_e, { idService, nomService }) => {
    $('.nom-service', $modaleDuplication).text(nomService);

    const selecteurFormulaire = '.modale-duplication-service form';
    const $valider = $('.bouton-duplication-service', $modaleDuplication);
    const $erreurServeur = $('.message-erreur-serveur', $modaleDuplication);

    $(selecteurFormulaire).on('submit', (e) => {
      e.preventDefault();
      $erreurServeur.hide();
      const nombreCopies = parseInt($('#nombre-copie').val(), 10) || 1;

      tableauDeLongueur(nombreCopies).reduce((acc) => acc.then(
        () => axios({ method: 'copy', url: `/api/service/${idService}` })
      ), Promise.resolve())
        .then(() => window.location.reload())
        .catch((exc) => {
          if (exc.response.status !== 424) return;

          $erreurServeur.text(exc.response.data.message).show();
        });
    });

    brancheValidation(selecteurFormulaire);
    $(`${selecteurFormulaire} button[type = 'submit']`).on('click', () => declencheValidation(selecteurFormulaire));

    $modaleDuplication.on('fermeModale', () => {
      $erreurServeur.hide();
      $valider.off();
    });
    $modaleDuplication.trigger('afficheModale');
  });

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
