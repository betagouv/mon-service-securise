import { declencheValidation } from '../../interactions/validation.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

class ActionDuplication {
  constructor(tableauDesServices) {
    this.tableauDesServices = tableauDesServices;
    this.titre = 'Dupliquer';
    this.texteSimple =
      "Créer une ou plusieurs copies du services sélectionné. Cette copie n'inclut pas les données concernant son homologation.";
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {
    $('#nombre-copie').val(1);
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple, seulementCreateur }) {
    return !estSelectionMultiple && seulementCreateur;
  }

  execute() {
    declencheValidation('#contenu-duplication');
    const $nombreCopie = $('#nombre-copie');

    if (!$nombreCopie.is(':valid')) return Promise.resolve();

    const $loader = $('.conteneur-loader', '#contenu-duplication');
    $('#action-duplication').hide();
    $loader.addClass('visible');

    const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
    const promesses = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) =>
        tableauDeLongueur(nombreCopies).reduce(
          (acc) =>
            acc.then(() =>
              axios({ method: 'copy', url: `/api/service/${idService}` })
            ),
          Promise.resolve()
        )
    );

    return Promise.all(promesses).then(() => {
      this.tableauDesServices.recupereServices();
      $('#action-duplication').show();
      $loader.removeClass('visible');
    });
  }
}

export default ActionDuplication;
