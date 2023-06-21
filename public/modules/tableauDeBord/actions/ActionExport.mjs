import ActionAbstraite from './Action.mjs';

class ActionExport extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-export', tableauDesServices);
    this.appliqueContenu({
      titre: 'Exporter la sélection',
      texteSimple:
        'Télécharger les données du service sélectionné dans le tableau de bord.',
      texteMultiple:
        'Télécharger la liste des services sélectionnés dans le tableau de bord.',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  initialise() {}

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }

  execute() {
    window.open(
      `/api/services/export.csv?idsServices=${encodeURIComponent(
        JSON.stringify([...this.tableauDesServices.servicesSelectionnes])
      )}`,
      '_blank'
    );
  }
}

export default ActionExport;
