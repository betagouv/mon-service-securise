import registreDesActions from './registreActions.mjs';

const EVENEMENT_BASCULE_TIROIR = 'basculeTiroir';

const gestionnaireTiroir = {
  afficheContenuAction: (
    { identifiantAction, estSelectionMulitple },
    ...args
  ) => {
    const action = registreDesActions[identifiantAction];

    const { titre, texteSimple, texteMultiple, initialise } = action;

    $('.titre-tiroir').text(titre);
    $('.texte-tiroir').text(estSelectionMulitple ? texteMultiple : texteSimple);
    $('.bloc-contenu').hide();
    $(`#contenu-${identifiantAction}`).show();
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
};

export { gestionnaireTiroir, EVENEMENT_BASCULE_TIROIR };
