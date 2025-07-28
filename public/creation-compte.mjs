import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { estimationNombreServices } = lisDonneesPartagees(
    'configuration-composant-svelte'
  );
  const { informationsProfessionnelles } = lisDonneesPartagees(
    'informations-professionnelles'
  );
  const { departements } = lisDonneesPartagees('departements');
  const invite = lisDonneesPartagees('invite');
  const { token } = lisDonneesPartagees('token');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-inscription', {
      detail: {
        estimationNombreServices,
        informationsProfessionnelles,
        departements,
        invite,
        token,
      },
    })
  );
});
