import AccueilInscription from './AccueilInscription.svelte';
import type { AccueilInscriptionProps } from './accueilInscription.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-accueil-inscription',
  async (e: CustomEvent<AccueilInscriptionProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: AccueilInscription;
const rechargeApp = async (props: AccueilInscriptionProps) => {
  if (app) await unmount(app);

  app = mount(AccueilInscription, {
    target: document.getElementById('conteneur-accueil-inscription')!,
    props: props,
  });
};

export default app!;
