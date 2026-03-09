import Connexion from './Connexion.svelte';
import type { ConnexionProps } from './connexion.d';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-connexion',
  (e: CustomEvent<ConnexionProps>) => rechargeApp({ ...e.detail })
);

let app: Connexion;
const rechargeApp = (props: ConnexionProps) => {
  app?.$destroy();
  app = mount(Connexion, {
    target: document.getElementById('conteneur-connexion')!,
    props: props,
  });
};

export default app!;
