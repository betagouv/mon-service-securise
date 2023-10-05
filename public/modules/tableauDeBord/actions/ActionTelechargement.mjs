import ActionAbstraite from './Action.mjs';

class ActionTelechargement extends ActionAbstraite {
  constructor() {
    super('#contenu-telechargement');
    this.appliqueContenu({
      titre: 'Télécharger les PDF',
      texteSimple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.",
      texteMultiple:
        "Obtenir les documents utiles à la sécurisation et à l'homologation des services sélectionnés.",
    });
  }

  initialise({ idService, donneesService }) {
    super.initialise();

    const urlBase = `/api/service/${idService}/pdf/`;

    $('#lien-synthese').attr('href', `${urlBase}syntheseSecurite.pdf`);
    $('#lien-annexes').attr('href', `${urlBase}annexes.pdf`);
    $('#lien-decision').attr('href', `${urlBase}dossierDecision.pdf`);
    $('#lien-archive').attr('href', `${urlBase}documentsHomologation.zip`);

    const domDocuments = {
      dossierDecision: 'decision',
      annexes: 'annexes',
      syntheseSecurite: 'synthese',
    };

    $('.document-telechargeable').hide();
    donneesService.documentsPdfDisponibles.forEach((nomDocument) => {
      const cible = domDocuments[nomDocument];
      const $conteneur = $(`#conteneur-lien-${cible}`);
      $conteneur.show();
    });

    const $conteneurArchive = $('#conteneur-lien-archive');
    $conteneurArchive.toggle(
      donneesService.documentsPdfDisponibles.length !== 0
    );
    $conteneurArchive
      .find('#nbPdfDisponibles')
      .text(donneesService.documentsPdfDisponibles.length);
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ aDesDocuments, estSelectionMultiple }) {
    if (estSelectionMultiple) return false;
    return aDesDocuments;
  }
}

export default ActionTelechargement;
