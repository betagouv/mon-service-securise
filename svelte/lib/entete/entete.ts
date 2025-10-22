import Entete from './Entete.svelte';

document.body.addEventListener('svelte-recharge-entete', () => rechargeApp());

let app: Entete;
const rechargeApp = () => {
  const conteneur = document.querySelector('.utilisateur-courant');
  if (!conteneur) return;

  app?.$destroy();
  app = new Entete({ target: conteneur });
};

export default app!;
