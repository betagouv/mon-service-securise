import UiKit from './UiKit.svelte';

document.body.addEventListener('svelte-recharge-ui-kit', () => rechargeApp());

let app: UiKit;
const rechargeApp = () => {
  app?.$destroy();
  app = new UiKit({
    target: document.getElementById('ui-kit')!,
  });
};

export default app!;
