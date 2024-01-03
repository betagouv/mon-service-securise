import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';

$(() => {
  const categories = JSON.parse($('#referentiel-categories-mesures').text());
  const statuts = JSON.parse($('#referentiel-statuts-mesures').text());
  const estLectureSeule = JSON.parse($('#securiser-lecture-seule').text());
  const idService = $('.page-service').data('id-service');
  const { indiceCyber, noteMax } = JSON.parse($('#indice-cyber').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: { categories, statuts, idService, estLectureSeule },
    })
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber', {
      detail: { indiceCyber, noteMax },
    })
  );

  let actionMesure;
  $(document.body).on('svelte-affiche-tiroir-ajout-mesure-specifique', (e) => {
    const propsDuBundle = {
      idService,
      categories,
      statuts,
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

  $(document.body).on('mesure-modifiee', (e) => {
    const doitFermerTiroir = e.detail?.sourceDeModification === 'tiroir';
    if (doitFermerTiroir) gestionnaireTiroir.basculeOuvert(false);
  });
});
