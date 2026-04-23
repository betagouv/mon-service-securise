import lisDonneesPartagees from '../modules/donneesPartagees.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';
import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionExportMesures from '../modules/tableauDeBord/actions/ActionExportMesures.mjs';
import ActionSuppressionDossierCourant from '../modules/tableauDeBord/actions/ActionSuppressionDossierCourant.mjs';

$(() => {
  const idService = $('#pages-service').data('id-service');
  const referentiel = lisDonneesPartagees('referentiel');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const modeVisiteGuidee =
    etatVisiteGuidee.dejaTerminee === false &&
    etatVisiteGuidee.enPause === false;
  const etapeActive = lisDonneesPartagees('etape-active');
  const featureFlags = lisDonneesPartagees('feature-flags');
  const preferencesUtilisateur = lisDonneesPartagees('preferences-utilisateur');
  const suggestionsService = lisDonneesPartagees('suggestions-service');

  const autorisationsService = lisDonneesPartagees('autorisations-service');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-pages-service', {
      detail: {
        idService,
        referentiel,
        etapeActive,
        modeVisiteGuidee,
        featureFlags,
        preferencesUtilisateur,
        suggestionsService,
        visible: {
          rolesResponsabilites: !autorisationsService.CONTACTS.estMasque,
          risques: !autorisationsService.RISQUES.estMasque,
          descriptionService: !autorisationsService.DECRIRE.estMasque,
          mesures: !autorisationsService.SECURISER.estMasque,
          indiceCyber: !autorisationsService.SECURISER.estMasque,
          dossiers: !autorisationsService.HOMOLOGUER.estMasque,
          homologation: !autorisationsService.HOMOLOGUER.estMasque,
        },
        estLectureSeule: {
          rolesResponsabilites: autorisationsService.CONTACTS.estLectureSeule,
          risques: autorisationsService.RISQUES.estLectureSeule,
          descriptionService: autorisationsService.DECRIRE.estLectureSeule,
          mesures: autorisationsService.SECURISER.estLectureSeule,
          indiceCyber: autorisationsService.SECURISER.estLectureSeule,
          dossiers: autorisationsService.HOMOLOGUER.estLectureSeule,
          homologation: autorisationsService.HOMOLOGUER.estLectureSeule,
        },
      },
    })
  );

  gestionnaireTiroir.brancheComportement();

  let actionMesure;
  $(document.body).on('svelte-affiche-tiroir-ajout-mesure-specifique', (e) => {
    const propsDuBundle = {
      idService,
      categories: referentiel.mesures.categories,
      statuts: referentiel.mesures.statuts,
      priorites: referentiel.mesures.priorites,
      retoursUtilisateur: referentiel.mesures.retoursUtilisateur,
      estLectureSeule: autorisationsService.SECURISER.estLectureSeule,
      modeVisiteGuidee,
      mesureAEditer: e.detail.mesureAEditer,
    };
    actionMesure = new ActionMesure(e.detail.titreTiroir);

    gestionnaireTiroir.afficheContenuAction(
      { action: actionMesure },
      propsDuBundle
    );
  });

  const actionExportMesures = new ActionExportMesures();
  $(document.body).on('svelte-affiche-tiroir-export-mesures', () => {
    gestionnaireTiroir.afficheContenuAction(
      { action: actionExportMesures },
      { idService }
    );
  });

  $(document.body).on('mesure-modifiee', (e) => {
    const doitFermerTiroir = e.detail?.sourceDeModification === 'tiroir';
    if (doitFermerTiroir) gestionnaireTiroir.basculeOuvert(false);
  });

  const actionSuppressionDossierCourant = new ActionSuppressionDossierCourant();
  $(document.body).on('affiche-tiroir-suppression-dossier-courant', () => {
    gestionnaireTiroir.afficheContenuAction({
      action: actionSuppressionDossierCourant,
    });
  });

  $('#formulaire-suppression-dossier-courant').on('submit', async (e) => {
    e.preventDefault();
    await actionSuppressionDossierCourant.execute({ idService });
    document.dispatchEvent(new CustomEvent('homologation-supprimee'));
    gestionnaireTiroir.basculeOuvert(false);
  });

  $(document.body).on('ferme-tiroir', () => {
    gestionnaireTiroir.basculeOuvert(false);
  });
});
