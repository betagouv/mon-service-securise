import ExplicationNouveauReferentiel from './ExplicationNouveauReferentiel.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-explication-nouveau-referentiel',
  async () => await rechargeApp()
);

let app: ExplicationNouveauReferentiel;
const rechargeApp = async () => {
  const conteneur = document.querySelector('#explication-nouveau-referentiel');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(ExplicationNouveauReferentiel, { target: conteneur });
};

export default app!;
