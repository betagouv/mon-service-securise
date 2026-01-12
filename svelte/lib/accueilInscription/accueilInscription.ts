import AccueilInscription from './AccueilInscription.svelte';
import type { AccueilInscriptionProps } from './accueilInscription.d';

document.body.addEventListener(
  'svelte-recharge-accueil-inscription',
  (e: CustomEvent<AccueilInscriptionProps>) => rechargeApp({ ...e.detail })
);

let app: AccueilInscription;
const rechargeApp = (props: AccueilInscriptionProps) => {
  app?.$destroy();
  app = new AccueilInscription({
    target: document.getElementById('conteneur-accueil-inscription')!,
    props: props,
  });
};

export default app!;
