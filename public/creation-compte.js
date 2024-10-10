$(() => {
  const $configurationComposantSvelte = $('#configuration-composant-svelte');
  const { estimationNombreServices } = JSON.parse(
    $configurationComposantSvelte.text()
  );
  const $informationsProfessionnelles = $('#informations-professionnelles');
  const { informationsProfessionnelles } = JSON.parse(
    $informationsProfessionnelles.text()
  );
  const $departements = $('#departements');
  const { departements } = JSON.parse($departements.text());

  const $invite = $('#invite');
  const invite = JSON.parse($invite.text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-inscription', {
      detail: {
        estimationNombreServices,
        informationsProfessionnelles,
        departements,
        invite,
      },
    })
  );
});
