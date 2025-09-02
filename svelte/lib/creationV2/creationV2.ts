import CreationV2 from './CreationV2.svelte';

document.body.addEventListener('svelte-recharge-creation-v2', () =>
  rechargeApp()
);

let app: CreationV2;
const rechargeApp = () => {
  app?.$destroy();
  app = new CreationV2({
    target: document.getElementById('creation-v2')!,
  });
};

export default app!;
