import Profil from './Profil.svelte';
import type { ProfilProps } from './profil.d';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-profil',
  (e: CustomEvent<ProfilProps>) => rechargeApp({ ...e.detail })
);

let app: Profil;
const rechargeApp = (props: ProfilProps) => {
  app?.$destroy();
  app = mount(Profil, {
    target: document.getElementById('conteneur-profil')!,
    props,
  });
};

export default app!;
