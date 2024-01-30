import ActionAbstraite from './Action.mjs';

class ActionExport extends ActionAbstraite {
  constructor() {
    super('#contenu-export');
    this.appliqueContenu({
      titre: 'Exporter la sélection',
      texteSimple:
        'Télécharger les données du service sélectionné dans le tableau de bord.',
      texteMultiple:
        'Télécharger la liste des services sélectionnés dans le tableau de bord.',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  initialise({ idServices }) {
    $('#action-export-csv').attr(
      'href',
      `/api/services/export.csv?idsServices=${encodeURIComponent(
        JSON.stringify(idServices)
      )}`
    );
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }
}

export default ActionExport;
