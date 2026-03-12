import Entete from './Entete.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-entete',
  async () => await rechargeApp()
);

let app: Entete;
const rechargeApp = async () => {
  const conteneur = document.querySelector('.utilisateur-courant');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(Entete, { target: conteneur });
};

export default app!;
