import CreationV2 from './CreationV2.svelte';
import type { CreationV2Props } from './creationV2.d';

document.body.addEventListener(
  'svelte-recharge-creation-v2',
  (e: CustomEvent<CreationV2Props>) => rechargeApp(e.detail)
);

let app: CreationV2;
const rechargeApp = (props: CreationV2Props) => {
  app?.$destroy();
  app = new CreationV2({
    target: document.getElementById('creation-v2')!,
    props,
  });
};

export default app!;
