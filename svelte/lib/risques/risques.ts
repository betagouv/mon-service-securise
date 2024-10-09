import Risques from './Risques.svelte';
import type { RisquesProps } from './risques.d';

document.body.addEventListener(
  'svelte-recharge-risques',
  (e: CustomEvent<RisquesProps>) => rechargeApp({ ...e.detail })
);

let app: Risques;
const rechargeApp = (props: RisquesProps) => {
  app?.$destroy();
  app = new Risques({
    target: document.getElementById('conteneur-risques')!,
    props,
  });
};

export default app!;
