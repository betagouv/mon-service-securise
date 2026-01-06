import ExplicationFinCompteLegacy from './ExplicationFinCompteLegacy.svelte';

document.body.addEventListener(
  'svelte-recharge-explication-fin-compte-legacy',
  () => rechargeApp()
);

let app: ExplicationFinCompteLegacy;
const rechargeApp = () => {
  const conteneur = document.querySelector('#explication-fin-compte-legacy');
  if (!conteneur) return;

  app?.$destroy();
  app = new ExplicationFinCompteLegacy({ target: conteneur });
};

export default app!;
