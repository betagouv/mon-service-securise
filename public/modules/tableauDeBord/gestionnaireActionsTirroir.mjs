import tableauDesServices from './tableauDesServices.mjs';
import gestionnaireTirroir from './gestionnaireTirroir.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

const gestionnaireActionsTirroir = {
  duplique: () => {
    const $nombreCopie = $('#nombre-copie');
    if ($nombreCopie.is(':valid')) {
      $nombreCopie.prop('disabled', true);
      $('#action-duplication').prop('disabled', true);

      const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
      const promesses = [...tableauDesServices.servicesSelectionnes].map((idService) => (
        tableauDeLongueur(nombreCopies).reduce((acc) => acc.then(
          () => axios({ method: 'copy', url: `/api/service/${idService}` })
        ), Promise.resolve())
      ));
      Promise.all(promesses).then(() => {
        $nombreCopie.prop('disabled', false);
        $('#action-duplication').prop('disabled', false);
        gestionnaireTirroir.basculeOuvert(false);
        tableauDesServices.recupereServices();
      });
    }
  },
  invite: () => {
    const $emailInvite = $('#email-invitation-collaboration');
    if ($emailInvite.is(':valid')) {
      $('#action-invitation').prop('disabled', true);
      const emailContributeur = $emailInvite.val();
      const invitations = [...tableauDesServices.servicesSelectionnes].map((idService) => axios.post('/api/autorisation', { emailContributeur, idHomologation: idService }));
      Promise.all(invitations).then(() => {
        $('#action-invitation').prop('disabled', false);
        gestionnaireTirroir.basculeOuvert(false);
        tableauDesServices.recupereServices();
      });
    }
  },
  supprime: () => {
    $('#action-suppression').prop('disabled', true);
    const suppressions = [...tableauDesServices.servicesSelectionnes].map((idService) => axios.delete(`/api/service/${idService}`));
    Promise.all(suppressions).then(() => {
      $('#action-suppression').prop('disabled', false);
      gestionnaireTirroir.basculeOuvert(false);
      tableauDesServices.recupereServices();
      tableauDesServices.servicesSelectionnes.clear();
      tableauDesServices.afficheEtatSelection();
    });
  },
};

export default gestionnaireActionsTirroir;
