import ActionAbstraite from './Action.mjs';

class ActionExportMesures extends ActionAbstraite {
  constructor() {
    super('#contenu-export-mesures');
    this.appliqueContenu({
      titre: 'Exporter la liste des mesures de sécurité',
      texteSimple: 'Obtenir la liste complète des mesures de sécurité.',
    });
  }

  initialise({ idService }) {
    super.initialise();

    const urlBase = `/service/${idService}/mesures/export.csv`;
    $('.document-telechargeable').show();

    $('#lien-sans-donnees-additionnelles').attr('href', `${urlBase}`);
    $('#lien-avec-donnees-additionnelles').attr(
      'href',
      `${urlBase}?avecDonneesAdditionnelles=true`
    );
  }
}

export default ActionExportMesures;
