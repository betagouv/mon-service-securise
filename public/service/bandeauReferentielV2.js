$(() => {
  const versionService = $('#bandeau-referentiel-v2').data('version-service');
  const idService = $('.page-service').data('id-service');
  const avecDecrireV2 = $('#bandeau-referentiel-v2').data('avec-decrire-v2');

  if (avecDecrireV2 && versionService === 'v1') {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-bandeau-referentiel-v2', {
        detail: {
          idService,
        },
      })
    );
  }
});
