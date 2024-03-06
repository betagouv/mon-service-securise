import ActionContributeurs from './actions/ActionContributeurs.mjs';
import ActionDuplication from './actions/ActionDuplication.mjs';
import ActionExport from './actions/ActionExport.mjs';
import ActionSuppressionService from './actions/ActionSuppressionService.mjs';
import ActionTelechargement from './actions/ActionTelechargement.mjs';

const registreDesActions = {
  contributeurs: new ActionContributeurs(),
  duplication: new ActionDuplication(),
  export: new ActionExport(),
  suppression: new ActionSuppressionService(),
  telechargement: new ActionTelechargement(),
};

export default registreDesActions;
