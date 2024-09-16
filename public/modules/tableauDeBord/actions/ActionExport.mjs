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
    const queryString = new URLSearchParams();
    idServices.forEach((id) => queryString.append('idsServices', id));
    queryString.append('timestamp', Date.now().toString());

    $('#action-export-csv').attr(
      'href',
      `/api/services/export.csv?${queryString}`
    );
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible() {
    return true;
  }
}

export default ActionExport;
