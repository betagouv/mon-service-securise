import TableauDeBord from './TableauDeBord.svelte';

document.body.addEventListener('svelte-recharge-tableau-de-bord', () =>
  rechargeApp()
);

let app: TableauDeBord;
const rechargeApp = () => {
  app?.$destroy();
  app = new TableauDeBord({
    target: document.getElementById('tableau-de-bord')!,
  });
};

export default app!;
