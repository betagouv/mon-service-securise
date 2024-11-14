import Supervision from './Supervision.svelte';
import type { SupervisionProps } from './supervision.d';

document.body.addEventListener(
  'svelte-recharge-supervision',
  (e: CustomEvent<SupervisionProps>) => rechargeApp({ ...e.detail })
);

let app: Supervision;
const rechargeApp = (props: SupervisionProps) => {
  app?.$destroy();
  app = new Supervision({
    target: document.getElementById('conteneur-supervision')!,
    props,
  });
};

export default app!;
