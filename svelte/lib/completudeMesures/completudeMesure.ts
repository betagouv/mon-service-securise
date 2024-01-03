import CompletudeMesures from './CompletudeMesures.svelte';
import type { CompletudeMesureProps } from './completudeMesure.d';

document.body.addEventListener(
  'svelte-recharge-completude-mesure',
  (e: CustomEvent<CompletudeMesureProps>) => rechargeApp({ ...e.detail })
);

let app: CompletudeMesures;
const rechargeApp = (props: CompletudeMesureProps) => {
  app?.$destroy();
  app = new CompletudeMesures({
    target: document.getElementById('conteneur-completude-mesure')!,
    props: props,
  });
};

export default app!;
