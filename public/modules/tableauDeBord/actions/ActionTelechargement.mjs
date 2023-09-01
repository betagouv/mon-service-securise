import ActionAbstraite from './Action.mjs';

class ActionTelechargement extends ActionAbstraite {
  constructor() {
    super('#contenu-telechargement');
    this.appliqueContenu({
      titre: 'Télécharger les PDFs',
      texteSimple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation des services sélectionnés.",
      texteMultiple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.",
    });
  }

  initialise({ idService, donneesService }) {
    super.initialise();

    const urlBase = `/api/service/${idService}/pdf/`;

    $('#lien-synthese').attr('href', `${urlBase}syntheseSecurite.pdf`);
    $('#lien-annexes').attr('href', `${urlBase}annexes.pdf`);
    $('#lien-decision').attr('href', `${urlBase}dossierDecision.pdf`);
    $('#lien-archive').attr('href', `${urlBase}documentsHomologation.zip`);

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
