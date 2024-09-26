$(() => {
  const $configurationComposantSvelte = $('#configuration-composant-svelte');
  const { estimationNombreServices } = JSON.parse(
    $configurationComposantSvelte.text()
  );
  const $informationsProfessionnelles = $('#informations-professionnelles');
  const { informationsProfessionnelles } = JSON.parse(
    $informationsProfessionnelles.text()
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-inscription', {
      detail: { estimationNombreServices, informationsProfessionnelles },
    })
  );
});
