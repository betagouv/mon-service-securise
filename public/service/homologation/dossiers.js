import brancheComportemenFormulaireEtape from './formulaireEtape.js';
import ActionTelechargementTamponHomologation from '../../modules/tableauDeBord/actions/ActionTelechargementTamponHomologation.js';
import { gestionnaireTiroir } from '../../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionTelechargement from '../../modules/tableauDeBord/actions/ActionTelechargement.mjs';
import ActionSuppressionDossierCourant from '../../modules/tableauDeBord/actions/ActionSuppressionDossierCourant.mjs';

$(() => {
  const telechargementTamponHomologation =
    new ActionTelechargementTamponHomologation();
  const telechargement = new ActionTelechargement();
  const suppressionDossierCourant = new ActionSuppressionDossierCourant();

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

  $('#supprime-dossier-courant').on('click', async () => {
    gestionnaireTiroir.afficheContenuAction({
      action: suppressionDossierCourant,
    });
  });

  $('#action-suppression-dossier-courant').on('click', async () => {
    await suppressionDossierCourant.execute({ idService });
    window.location.reload();
  });

  brancheComportemenFormulaireEtape(() => Promise.resolve());
});
