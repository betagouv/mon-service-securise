import ActionAbstraite from './Action.mjs';

class ActionTelechargement extends ActionAbstraite {
  constructor(tableauDesServices) {
    super(tableauDesServices);
    this.appliqueContenu({
      titre: 'Télécharger les PDFs',
      texteSimple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation des services sélectionnés.",
      texteMultiple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.",
    });
  }

  initialise() {
    const idSelectionne = this.tableauDesServices.servicesSelectionnes
      .keys()
      .next().value;
    const urlBase = `/api/service/${idSelectionne}/pdf/`;

    $('#lien-synthese').attr('href', `${urlBase}syntheseSecurite.pdf`);
    $('#lien-annexes').attr('href', `${urlBase}annexes.pdf`);
    $('#lien-decision').attr('href', `${urlBase}dossierDecision.pdf`);
    $('#lien-archive').attr('href', `${urlBase}documentsHomologation.zip`);

    const donneesService =
      this.tableauDesServices.donneesDuService(idSelectionne);

    const $conteneurDecision = $('#conteneur-lien-decision');
    const dossierDecisionDisponible =
      donneesService.documentsPdfDisponibles.includes('dossierDecision');
    $('.lien-telechargement', $conteneurDecision).toggle(
      dossierDecisionDisponible
    );
    $('.lien-indisponible', $conteneurDecision).toggle(
      !dossierDecisionDisponible
    );

    $('#nbPdfDisponibles', '#conteneur-lien-archive').text(
      donneesService.documentsPdfDisponibles.length
    );
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple }) {
    return !estSelectionMultiple;
  }
}

export default ActionTelechargement;
