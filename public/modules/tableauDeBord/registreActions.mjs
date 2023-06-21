import tableauDesServices from './tableauDesServices.mjs';
import ActionContributeurs from './actions/ActionContributeurs.mjs';
import ActionDuplication from './actions/ActionDuplication.mjs';
import ActionExport from './actions/ActionExport.mjs';
import ActionInvitation from './actions/ActionInvitation.mjs';
import ActionSuppression from './actions/ActionSuppression.mjs';
import ActionTelechargement from './actions/ActionTelechargement.mjs';

const registreDesActions = {
  contributeurs: new ActionContributeurs(tableauDesServices),
  duplication: new ActionDuplication(tableauDesServices),
  export: new ActionExport(tableauDesServices),
  invitation: new ActionInvitation(tableauDesServices),
  suppression: new ActionSuppression(tableauDesServices),
  telechargement: new ActionTelechargement(tableauDesServices),
};

export default registreDesActions;
