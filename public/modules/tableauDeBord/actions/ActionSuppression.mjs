import ActionAbstraite from './Action.mjs';

class ActionSuppression extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-suppression', tableauDesServices);
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: 'Effacer toutes les données du service sélectionné.',
      texteMultiple: 'Effacer toutes les données des services sélectionnés.',
    });
  }

  initialise() {
    super.initialise();
    $('#action-suppression').show();

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
    const $actionSuppression = $('#action-suppression');

    $actionSuppression.hide();
    this.basculeLoader(true);

    const suppressions = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) => axios.delete(`/api/service/${idService}`)
    );

    return Promise.all(suppressions).then(() => {
      this.tableauDesServices.servicesSelectionnes.clear();
      this.tableauDesServices.recupereServices();
    });
  }
}

export default ActionSuppression;
