import lisDonneesPartagees from '../modules/donneesPartagees.mjs';
import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';

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
  const nonce = lisDonneesPartagees('nonce-commentaires');

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
        nonce,
        peutHomologuer: autorisationsService.peutHomologuer,
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

  $(document.body).on('mesure-modifiee', (e) => {
    const doitFermerTiroir = e.detail?.sourceDeModification === 'tiroir';
    if (doitFermerTiroir) gestionnaireTiroir.basculeOuvert(false);
  });

  $(document.body).on('ferme-tiroir', () => {
    gestionnaireTiroir.basculeOuvert(false);
  });
});
