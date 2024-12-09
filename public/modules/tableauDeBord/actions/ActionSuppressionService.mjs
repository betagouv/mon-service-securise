import ActionAbstraite from './Action.mjs';

class ActionSuppressionService extends ActionAbstraite {
  constructor() {
    super('#contenu-suppression');
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: 'Effacer toutes les données du service sélectionné.',
      texteMultiple: 'Effacer toutes les données des services sélectionnés.',
    });
  }

  initialise({ nomDuService, nbServicesSelectionnes }) {
    super.initialise();
    $('#action-suppression').show();
    const champConfirmation = $('#confirmation-suppression');
    champConfirmation.val('');
    champConfirmation.removeClass('touche');

    if (nbServicesSelectionnes === 1) {
      $('#nombre-service-suppression').html(
        `le service <strong>${nomDuService}</strong> `
      );
      $('#intitule-confirmation').html(`<strong>${nomDuService}</strong>`);
      champConfirmation.attr('pattern', nomDuService);
    } else {
      $('#nombre-service-suppression').html(
        `<strong>les ${nbServicesSelectionnes} services sélectionnés</strong> `
      );
      $('#intitule-confirmation').html(
        `<strong>${nbServicesSelectionnes} services</strong>`
      );
      champConfirmation.attr('pattern', `${nbServicesSelectionnes} services`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementProprietaire }) {
    return seulementProprietaire;
  }

  execute({ idServices }) {
    const $actionSuppression = $('#action-suppression');

    if (!this.formulaireEstValide) return Promise.reject();

    $actionSuppression.hide();
    this.basculeLoader(true);

    const suppressions = idServices.map((idService) =>
      axios.delete(`/api/service/${idService}`)
    );

    return Promise.all(suppressions);
  }
}

export default ActionSuppressionService;
