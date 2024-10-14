$(() => {
  const idService = $('.page-service').data('id-service');
  const { estLectureSeule } = JSON.parse($('#autorisations-risques').text());
  const risques = JSON.parse($('#donnees-risques').text());
  const categories = JSON.parse($('#donnees-referentiel-categories').text());
  const niveauxGravite = JSON.parse($('#donnees-referentiel-gravite').text());
  const referentielRisques = JSON.parse(
    $('#donnees-referentiel-risques').text()
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-risques', {
      detail: {
        idService,
        estLectureSeule,
        risques,
        categories,
        niveauxGravite,
        referentielRisques,
      },
    })
  );
});
