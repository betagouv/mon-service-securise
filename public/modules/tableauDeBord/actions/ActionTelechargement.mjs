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

  initialise({ idService, donneesService, modeVisiteGuidee }) {
    super.initialise();

    if (modeVisiteGuidee) {
      $('a', this.selecteurFormulaire).removeAttr('href');
      return;
    }

    const lienSansMiseEnCache = (idLien, document) => {
      $(idLien).attr(
        'href',
        `/api/service/${idService}/pdf/${document}?timestamp=${Date.now()}`
      );
    };

    lienSansMiseEnCache('#lien-synthese', 'syntheseSecurite.pdf');
    lienSansMiseEnCache('#lien-annexes', 'annexes.pdf');
    lienSansMiseEnCache('#lien-decision', 'dossierDecision.pdf');
    lienSansMiseEnCache('#lien-archive', 'documentsHomologation.zip');

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
