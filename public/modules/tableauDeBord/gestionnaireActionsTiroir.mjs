import tableauDesServices from './tableauDesServices.mjs';
import { gestionnaireTiroir } from './gestionnaireTiroir.mjs';
import { declencheValidation } from '../interactions/validation.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

const gestionnaireActionsTiroir = {
  duplique: () => {
    declencheValidation('#contenu-duplication');
    const $nombreCopie = $('#nombre-copie');
    if ($nombreCopie.is(':valid')) {
      const $loader = $('.conteneur-loader', '#contenu-duplication');
      $('#action-duplication').hide();
      $loader.addClass('visible');

      const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
      const promesses = [...tableauDesServices.servicesSelectionnes].map(
        (idService) =>
          tableauDeLongueur(nombreCopies).reduce(
            (acc) =>
              acc.then(() =>
                axios({ method: 'copy', url: `/api/service/${idService}` })
              ),
            Promise.resolve()
          )
      );
      Promise.all(promesses).then(() => {
        gestionnaireTiroir.basculeOuvert(false);
        tableauDesServices.recupereServices();
        $('#action-duplication').show();
        $loader.removeClass('visible');
      });
    }
  },
  exporteCsv: () => {
    window.open(
      `/api/services/export.csv?idsServices=${encodeURIComponent(
        JSON.stringify([...tableauDesServices.servicesSelectionnes])
      )}`,
      '_blank'
    );
  },
  invite: () => {
    declencheValidation('#contenu-invitation');
    const $emailInvite = $('#email-invitation-collaboration');
    if ($emailInvite.is(':valid')) {
      $('#action-invitation').prop('disabled', true);
      const emailContributeur = $emailInvite.val();
      const invitations = [...tableauDesServices.servicesSelectionnes].map(
        (idService) =>
          axios.post('/api/autorisation', {
            emailContributeur,
            idHomologation: idService,
          })
      );
      Promise.all(invitations).then(() => {
        $('#action-invitation').prop('disabled', false);
        tableauDesServices.recupereServices();
        gestionnaireTiroir.afficheContenuAction('invitation-confirmation');
      });
    }
  },
  supprime: () => {
    const $loader = $('.conteneur-loader', '#contenu-suppression');
    $('#action-suppression').hide();
    $loader.addClass('visible');
    const suppressions = [...tableauDesServices.servicesSelectionnes].map(
      (idService) => axios.delete(`/api/service/${idService}`)
    );
    Promise.all(suppressions).then(() => {
      $('#action-suppression').prop('disabled', false);
      gestionnaireTiroir.basculeOuvert(false);
      tableauDesServices.servicesSelectionnes.clear();
      tableauDesServices.recupereServices();
      $('#action-suppression').show();
      $loader.removeClass('visible');
    });
  },
};

export default gestionnaireActionsTiroir;
