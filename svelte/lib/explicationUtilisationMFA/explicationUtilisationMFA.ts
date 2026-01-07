import ExplicationUtilisationMFA from './ExplicationUtilisationMFA.svelte';

document.body.addEventListener(
  'svelte-recharge-explication-utilisation-mfa',
  () => rechargeApp()
);

let app: ExplicationUtilisationMFA;
const rechargeApp = () => {
  const conteneur = document.querySelector('#explication-utilisation-mfa');
  if (!conteneur) return;

  app?.$destroy();
  app = new ExplicationUtilisationMFA({ target: conteneur });
};

export default app!;
