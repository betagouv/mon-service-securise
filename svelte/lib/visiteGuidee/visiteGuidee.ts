import VisiteGuidee from './VisiteGuidee.svelte';

document.body.addEventListener(
  'svelte-recharge-visite-guidee',
  (_: CustomEvent) => rechargeApp()
);

let app: VisiteGuidee;
const rechargeApp = () => {
  app?.$destroy();
  app = new VisiteGuidee({
    target: document.getElementById('visite-guidee')!,
  });
};

export default app!;
