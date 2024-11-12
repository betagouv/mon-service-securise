import Supervision from './Supervision.svelte';

document.body.addEventListener('svelte-recharge-supervision', () =>
  rechargeApp()
);

let app: Supervision;
const rechargeApp = () => {
  app?.$destroy();
  app = new Supervision({
    target: document.getElementById('conteneur-supervision')!,
  });
};

export default app!;
