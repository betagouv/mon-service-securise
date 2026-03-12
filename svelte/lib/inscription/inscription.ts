import Inscription from './Inscription.svelte';
import type { InscriptionProps } from './inscription.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-inscription',
  async (e: CustomEvent<InscriptionProps>) => await rechargeApp({ ...e.detail })
);

let app: Inscription;
const rechargeApp = async (props: InscriptionProps) => {
  if (app) await unmount(app);

  app = mount(Inscription, {
    target: document.getElementById('conteneur-inscription')!,
    props: props,
  });
};

export default app!;
