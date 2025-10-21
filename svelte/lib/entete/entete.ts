import Entete from './Entete.svelte';

document.body.addEventListener('svelte-recharge-entete', () => rechargeApp());

let app: Entete;
const rechargeApp = () => {
  app?.$destroy();
  app = new Entete({
    target: document.querySelector('.utilisateur-courant')!,
  });
};

export default app!;
