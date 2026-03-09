import Connexion from './Connexion.svelte';
import type { ConnexionProps } from './connexion.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-connexion',
  async (e: CustomEvent<ConnexionProps>) => await rechargeApp({ ...e.detail })
);

let app: Connexion;
const rechargeApp = async (props: ConnexionProps) => {
  if (app) await unmount(app);

  app = mount(Connexion, {
    target: document.getElementById('conteneur-connexion')!,
    props: props,
  });
};

export default app!;
