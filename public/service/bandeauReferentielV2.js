$(() => {
  const versionService = $('#bandeau-referentiel-v2').data('version-service');
  const idService = $('.page-service').data('id-service');

  if (versionService === 'v1') {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-bandeau-referentiel-v2', {
        detail: {
          idService,
        },
      })
    );
  }
});
