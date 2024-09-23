import Inscription from './Inscription.svelte';
import type { InscriptionProps } from './inscription.d';

document.body.addEventListener(
  'svelte-recharge-inscription',
  (e: CustomEvent<InscriptionProps>) => rechargeApp({ ...e.detail })
);

let app: Inscription;
const rechargeApp = (props: InscriptionProps) => {
  app?.$destroy();
  app = new Inscription({
    target: document.getElementById('conteneur-inscription')!,
    props: props,
  });
};

export default app!;
