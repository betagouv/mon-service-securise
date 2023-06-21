import ActionAbstraite from './Action.mjs';

class ActionSuppression extends ActionAbstraite {
  constructor(tableauDesServices) {
    super(tableauDesServices);
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: 'Effacer toutes les données du service sélectionné.',
      texteMultiple: 'Effacer toutes les données des services sélectionnés.',
    });
  }

  initialise() {
    const { nomDuService, servicesSelectionnes } = this.tableauDesServices;

    const nbServicesSelectionnes = servicesSelectionnes.size;

    if (nbServicesSelectionnes === 1) {
      const idSelectionne = servicesSelectionnes.keys().next().value;
      $('#nombre-service-suppression').html(
        `le service <strong>${nomDuService(idSelectionne)}</strong> `
      );
    } else {
      $('#nombre-service-suppression').html(
        `<strong>les ${nbServicesSelectionnes} services sélectionnés</strong> `
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementCreateur }) {
    return seulementCreateur;
  }

  execute() {
    const $loader = $('.conteneur-loader', '#contenu-suppression');
    const $actionSuppression = $('#action-suppression');

    $actionSuppression.hide();
    $loader.addClass('visible');

    const suppressions = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) => axios.delete(`/api/service/${idService}`)
    );

    return Promise.all(suppressions).then(() => {
      $actionSuppression.prop('disabled', false);
      this.tableauDesServices.servicesSelectionnes.clear();
      this.tableauDesServices.recupereServices();
      $actionSuppression.show();
      $loader.removeClass('visible');
    });
  }
}

export default ActionSuppression;
