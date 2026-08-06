import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const referentiel = lisDonneesPartagees('referentiel');
  const featureFlags = lisDonneesPartagees('feature-flags');
  const nonce = lisDonneesPartagees('nonce-commentaires');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-visite-guidee-spa', {
      detail: {
        referentiel,
        featureFlags,
        nonce,
      },
    })
  );
});
