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
  const idService = $('.page-service').data('id-service');
  const { indiceCyber, noteMax } = lisDonneesPartagees('indice-cyber');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const { indiceCyberPersonnalise } = lisDonneesPartagees(
    'indice-cyber-personnalise'
  );
  const afficheModelesMesureSpecifique = lisDonneesPartagees(
    'affiche-modeles-mesure-specifique'
  );

  const enVisiteGuidee = () =>
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: {
        categories,
        statuts,
        priorites,
        idService,
        estLectureSeule,
        modeVisiteGuidee: enVisiteGuidee(),
        afficheModelesMesureSpecifique,
      },
    })
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber', {
      detail: { indiceCyber, noteMax, idService },
    })
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber-personnalise', {
      detail: { indiceCyberPersonnalise, noteMax, idService },
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
