import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';
import ActionExportMesures from '../modules/tableauDeBord/actions/ActionExportMesures.mjs';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const categories = lisDonneesPartagees('referentiel-categories-mesures');
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const priorites = lisDonneesPartagees('referentiel-priorites-mesures');
  const retoursUtilisateur = lisDonneesPartagees(
    'referentiel-retours-utilisateur'
  );
  const estLectureSeule = lisDonneesPartagees('securiser-lecture-seule');
  const versionService = lisDonneesPartagees('version-service');
  const idService = $('.page-service').data('id-service');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const avecRisquesV2 = lisDonneesPartagees('avec-risques-v2');
  const afficheExplicationRisquesV2 = lisDonneesPartagees(
    'affiche-modale-risques-v2'
  );

  const enVisiteGuidee = () =>
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;

  const autorisationsService = lisDonneesPartagees('autorisations-service');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: {
        avecRisquesV2,
        afficheExplicationRisquesV2,
        categories,
        statuts,
        priorites,
        idService,
        estLectureSeule,
        modeVisiteGuidee: enVisiteGuidee(),
        versionService,
        visible: {
          rolesResponsabilites: !autorisationsService.CONTACTS.estMasque,
          risques: !autorisationsService.RISQUES.estMasque,
          descriptionService: !autorisationsService.DECRIRE.estMasque,
          mesures: !autorisationsService.SECURISER.estMasque,
          dossiers: !autorisationsService.HOMOLOGUER.estMasque,
          indiceCyber: !autorisationsService.SECURISER.estMasque,
          homologation: !autorisationsService.HOMOLOGUER.estMasque,
        },
      },
    })
  );

  let actionMesure;
  $(document.body).on('svelte-affiche-tiroir-ajout-mesure-specifique', (e) => {
    const propsDuBundle = {
      idService,
      categories,
      statuts,
      priorites,
      retoursUtilisateur,
      estLectureSeule,
      modeVisiteGuidee: enVisiteGuidee(),
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

  $(document.body).on('ferme-tiroir', () => {
    gestionnaireTiroir.basculeOuvert(false);
  });
});
