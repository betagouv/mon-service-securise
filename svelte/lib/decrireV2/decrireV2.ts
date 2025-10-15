import DecrireV2 from './DecrireV2.svelte';
import type { DecrireV2Props } from './decrireV2.d';

document.body.addEventListener(
  'svelte-recharge-decrire-v2',
  (e: CustomEvent<DecrireV2Props>) => rechargeApp(e.detail)
);

let app: DecrireV2;
const rechargeApp = (props: DecrireV2Props) => {
  app?.$destroy();
  app = new DecrireV2({
    target: document.getElementById('decrire-v2')!,
    props,
  });
};

export default app!;
