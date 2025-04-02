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

  $('#bouton-fermeture-modale-encart-homologation').on('click', (e) => {
    e.preventDefault();
    $('.modale-encart-homologation')[0].close();
  });

  const parametresDeRecherche = new URLSearchParams(window.location.search);
  if (parametresDeRecherche.has('succesHomologation')) {
    const elementModale = $('.modale-encart-homologation')[0];
    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  }

  $('#bouton-tampon-homologation-modale').on('click', () => {
    $('.modale-encart-homologation')[0].close();
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

  $('#formulaire-suppression-dossier-courant').on('submit', async (e) => {
    e.preventDefault();
    await suppressionDossierCourant.execute({ idService });
    window.location.reload();
  });

  const afficheModaleParcoursHomologation = () => {
    const modale = $('#modale-parcours-homologation')[0];
    modale.inert = true;
    modale.showModal();
    modale.inert = false;
  };

  $('#commencer-homologation').on('click', () =>
    afficheModaleParcoursHomologation()
  );

  $('#nouvelle-homologation').on('click', () => {
    window.location = `/service/${idService}/homologation/edition/etape/autorite`;
  });
});
