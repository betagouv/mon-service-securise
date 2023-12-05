import Mesure from './Mesure.svelte';
import type { MesureProps } from './mesure.d';

document.body.addEventListener(
  'svelte-recharge-mesure',
  (e: CustomEvent<MesureProps>) => rechargeApp({ ...e.detail })
);

let app: Mesure;

const rechargeApp = (props: MesureProps) => {
  app?.$destroy();
  app = new Mesure({
    target: document.getElementById('conteneur-mesure')!,
    props,
  });
};

export default app;
