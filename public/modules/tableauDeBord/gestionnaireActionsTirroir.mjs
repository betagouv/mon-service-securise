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
};

export default gestionnaireActionsTirroir;
