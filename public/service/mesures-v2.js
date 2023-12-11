import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';

$(() => {
  const categories = JSON.parse($('#referentiel-categories-mesures').text());
  const statuts = JSON.parse($('#referentiel-statuts-mesures').text());
  const idService = $('.page-service').data('id-service');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: { categories, statuts, idService },
    })
  );

  const actionMesure = new ActionMesure();
  $(document.body).on('svelte-affiche-tiroir-ajout-mesure-specifique', (e) => {
    const { mesuresExistantes } = e.detail;
    gestionnaireTiroir.afficheContenuAction(
      { action: actionMesure },
      {
        idService,
        categories,
        statuts,
        mesuresExistantes,
      }
    );
  });
});
