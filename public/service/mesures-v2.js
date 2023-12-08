$(() => {
  const referentielMesuresGenerales = JSON.parse(
    $('#donnees-referentiel-mesures-generales').text()
  );
  const categories = JSON.parse($('#referentiel-categories-mesures').text());
  const statuts = JSON.parse($('#referentiel-statuts-mesures').text());
  const idService = $('.page-service').data('id-service');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: { referentielMesuresGenerales, categories, statuts, idService },
    })
  );
});
