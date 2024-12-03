import Tiroir from './Tiroir.svelte';

document.body.addEventListener('svelte-recharge-tiroir', () => rechargeApp());

let app: Tiroir;
const rechargeApp = () => {
  app?.$destroy();
  app = new Tiroir({
    target: document.getElementById('tiroir')!,
  });
};

export default app!;
