const EVENEMENT_BASCULE_TIROIR = 'basculeTiroir';

const gestionnaireTiroir = {
  afficheContenuAction: ({ action, estSelectionMulitple }, ...args) => {
    const { titre, texteSimple, texteMultiple, initialise } = action;

    $('.titre-tiroir').text(titre);
    $('.texte-tiroir').text(estSelectionMulitple ? texteMultiple : texteSimple);
    $('.bloc-contenu').hide();
    action.affiche();
    initialise.apply(action, args);
    gestionnaireTiroir.basculeOuvert(true);
  },
  basculeOuvert: (doitOuvrir) => {
    if (doitOuvrir) $('.tiroir').addClass('ouvert');
    else {
      $('.tiroir').removeClass('ouvert');
      $('#barre-outils .action').removeClass('actif');
    }
    $(document).trigger(EVENEMENT_BASCULE_TIROIR, { ouvert: doitOuvrir });
  },
  brancheComportement: () => {
    $('.tiroir .fermeture-tiroir').on('click', () => {
      gestionnaireTiroir.basculeOuvert(false);
    });
  },
};

export { gestionnaireTiroir, EVENEMENT_BASCULE_TIROIR };
