import brancheComportemenFormulaireEtape from './formulaireEtape.js';
import ActionTelechargementTamponHomologation from '../../modules/tableauDeBord/actions/ActionTelechargementTamponHomologation.js';
import { gestionnaireTiroir } from '../../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionTelechargement from '../../modules/tableauDeBord/actions/ActionTelechargement.mjs';

$(() => {
  const telechargementTamponHomologation =
    new ActionTelechargementTamponHomologation();
  const telechargement = new ActionTelechargement();
  const idService = $('.page-service').data('id-service');
  const chargeDonneesService = async () =>
    (await axios.get(`/api/service/${idService}`)).data;

  $('#bouton-tampon-homologation').on('click', () => {
    gestionnaireTiroir.afficheContenuAction(
      { action: telechargementTamponHomologation },
      { idService }
    );
  });

  $('#affiche-documents').on('click', async () => {
    const donneesService = await chargeDonneesService();
    gestionnaireTiroir.afficheContenuAction(
      { action: telechargement, estSelectionMulitple: false },
      { idService, donneesService }
    );
  });

  brancheComportemenFormulaireEtape(() => Promise.resolve());
});
