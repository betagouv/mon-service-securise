import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const referentiel = lisDonneesPartagees('referentiel');
  const nonce = lisDonneesPartagees('nonce-commentaires');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-visite-guidee-spa', {
      detail: {
        referentiel,
        nonce,
      },
    })
  );
});
