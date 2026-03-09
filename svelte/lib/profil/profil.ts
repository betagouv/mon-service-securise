import Profil from './Profil.svelte';
import type { ProfilProps } from './profil.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-profil',
  async (e: CustomEvent<ProfilProps>) => await rechargeApp({ ...e.detail })
);

let app: Profil;
const rechargeApp = async (props: ProfilProps) => {
  if (app) await unmount(app);

  app = mount(Profil, {
    target: document.getElementById('conteneur-profil')!,
    props,
  });
};

export default app!;
