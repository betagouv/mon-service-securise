import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';
import ActionExportMesures from '../modules/tableauDeBord/actions/ActionExportMesures.mjs';

$(() => {
  const categories = JSON.parse($('#referentiel-categories-mesures').text());
  const statuts = JSON.parse($('#referentiel-statuts-mesures').text());
  const priorites = JSON.parse($('#referentiel-priorites-mesures').text());
  const retoursUtilisateur = JSON.parse(
    $('#referentiel-retours-utilisateur').text()
  );
  const estLectureSeule = JSON.parse($('#securiser-lecture-seule').text());
  const idService = $('.page-service').data('id-service');
  const { indiceCyber, noteMax } = JSON.parse($('#indice-cyber').text());
  const etatVisiteGuidee = JSON.parse($('#etat-visite-guidee').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: {
        categories,
        statuts,
        priorites,
        idService,
        estLectureSeule,
        modeVisiteGuidee:
          etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause,
      },
    })
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber', {
      detail: { indiceCyber, noteMax, idService },
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
      mesuresExistantes: e.detail.mesuresExistantes,
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
});
