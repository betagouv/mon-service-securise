import ExplicationUtilisationMFA from './ExplicationUtilisationMFA.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-explication-utilisation-mfa',
  async () => await rechargeApp()
);

let app: ExplicationUtilisationMFA;
const rechargeApp = async () => {
  const conteneur = document.querySelector('#explication-utilisation-mfa');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(ExplicationUtilisationMFA, { target: conteneur });
};

export default app!;
