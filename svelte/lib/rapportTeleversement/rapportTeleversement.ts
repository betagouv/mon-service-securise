import RapportTeleversement from './RapportTeleversement.svelte';

document.body.addEventListener('svelte-recharge-rapport-televersement', () =>
  rechargeApp()
);

let app: RapportTeleversement;
const rechargeApp = () => {
  app?.$destroy();
  app = new RapportTeleversement({
    target: document.getElementById('rapport-televersement')!,
  });
};

export default app!;
