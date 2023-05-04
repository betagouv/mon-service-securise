const contenuActions = {
  duplication: {
    titre: 'Dupliquer',
    texte: 'Copier autant de fois que nécessaire les services sélectionnés. Toutes les données saisies apparaîtront dans les nouveaux services créés, hormis celles de la rubrique Homologuer.',
    initialise: () => {
      $('#nombre-copie').val(1);
    },
  },
};

const gestionnaireTirroir = {
  afficheContenuAction: (identifiantAction) => {
    const { titre, texte, initialise } = contenuActions[identifiantAction];
    $('.titre-tirroir').text(titre);
    $('.texte-tirroir').text(texte);
    $('.bloc-contenu').hide();
    $(`#contenu-${identifiantAction}`).show();
    initialise();
    gestionnaireTirroir.basculeOuvert(true);
  },
  basculeOuvert: (statut) => {
    if (statut) $('.tirroir').addClass('ouvert');
    else $('.tirroir').removeClass('ouvert');
  },
};

export default gestionnaireTirroir;
