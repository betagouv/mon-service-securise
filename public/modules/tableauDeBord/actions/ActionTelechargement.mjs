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

    const listeDocuments = [
      {
        cible: 'decision',
        nomDocument: 'dossierDecision',
      },
      {
        cible: 'annexes',
        nomDocument: 'annexes',
      },
      {
        cible: 'synthese',
        nomDocument: 'syntheseSecurite',
      },
    ];

    listeDocuments.forEach(({ cible, nomDocument }) => {
      const $conteneur = $(`#conteneur-lien-${cible}`);
      const documentDisponible =
        donneesService.documentsPdfDisponibles.includes(nomDocument);
      $('.lien-telechargement', $conteneur).toggle(documentDisponible);
      $('.lien-indisponible', $conteneur).toggle(!documentDisponible);
    });

    const $conteneurArchive = $('#conteneur-lien-archive');
    if (donneesService.documentsPdfDisponibles.length === 0) {
      $conteneurArchive.find('.lien-telechargement').hide();
      $conteneurArchive.find('.lien-indisponible').show();
    }
    $conteneurArchive
      .find('#nbPdfDisponibles')
      .text(donneesService.documentsPdfDisponibles.length);
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ estSelectionMultiple }) {
    return !estSelectionMultiple;
  }
}

export default ActionTelechargement;
