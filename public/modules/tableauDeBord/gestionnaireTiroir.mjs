import tableauDesServices from './tableauDesServices.mjs';
import ActionContributeurs from './actions/ActionContributeurs.mjs';
import ActionDuplication from './actions/ActionDuplication.mjs';
import ActionExport from './actions/ActionExport.mjs';
import ActionInvitation from './actions/ActionInvitation.mjs';
import ActionInvitationConfirmation from './actions/ActionInvitationConfirmation.mjs';
import ActionSuppression from './actions/ActionSuppression.mjs';
import ActionTelechargement from './actions/ActionTelechargement.mjs';

const EVENEMENT_BASCULE_TIROIR = 'basculeTiroir';

const registreDesActions = {
  contributeurs: new ActionContributeurs(tableauDesServices),
  duplication: new ActionDuplication(tableauDesServices),
  export: new ActionExport(tableauDesServices),
  invitation: new ActionInvitation(tableauDesServices),
  'invitation-confirmation': new ActionInvitationConfirmation(),
  suppression: new ActionSuppression(tableauDesServices),
  telechargement: new ActionTelechargement(tableauDesServices),
};

const gestionnaireTiroir = {
  afficheContenuAction: (identifiantAction, ...args) => {
    const action = registreDesActions[identifiantAction];

    const { titre, texteSimple, texteMultiple, initialise } = action;
    const estSelectionMulitple =
      tableauDesServices.servicesSelectionnes.size > 1;

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

export { gestionnaireTiroir, EVENEMENT_BASCULE_TIROIR, registreDesActions };
