import brancheComportemenFormulaireEtape from './formulaireEtape.js';
import ActionTelechargementTamponHomologation from '../../modules/tableauDeBord/actions/ActionTelechargementTamponHomologation.js';
import { gestionnaireTiroir } from '../../modules/tableauDeBord/gestionnaireTiroir.mjs';

$(() => {
  const telechargementTamponHomologation =
    new ActionTelechargementTamponHomologation();
  const idService = $('.page-service').data('id-service');

  $('#bouton-tampon-homologation').on('click', () => {
    gestionnaireTiroir.afficheContenuAction(
      { action: telechargementTamponHomologation },
      { idService }
    );
  });

  brancheComportemenFormulaireEtape(() => Promise.resolve());
});
