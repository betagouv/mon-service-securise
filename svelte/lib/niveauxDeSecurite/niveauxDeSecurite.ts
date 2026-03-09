import NiveauxDeSecurite from './NiveauxDeSecurite.svelte';
import type { NiveauxDeSecuriteProps } from './niveauxDeSecurite.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-niveaux-de-securite',
  async (e: CustomEvent<NiveauxDeSecuriteProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: NiveauxDeSecurite;
const rechargeApp = async (props: NiveauxDeSecuriteProps) => {
  if (app) await unmount(app);
  app = mount(NiveauxDeSecurite, {
    target: document.getElementById('niveaux-de-securite')!,
    props,
  });
};

export default app!;
