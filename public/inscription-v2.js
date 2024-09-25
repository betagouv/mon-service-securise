$(() => {
  const $configurationComposantSvelte = $('#configuration-composant-svelte');
  const { estimationNombreServices } = JSON.parse(
    $configurationComposantSvelte.text()
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-inscription', {
      detail: { estimationNombreServices },
    })
  );
});
