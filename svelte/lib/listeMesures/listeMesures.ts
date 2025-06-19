import ListeMesures from './ListeMesures.svelte';

document.body.addEventListener('svelte-recharge-liste-mesures', () =>
  rechargeApp()
);

let app: ListeMesures;
const rechargeApp = () => {
  app?.$destroy();
  app = new ListeMesures({
    target: document.getElementById('liste-mesures')!,
  });
};

export default app!;
