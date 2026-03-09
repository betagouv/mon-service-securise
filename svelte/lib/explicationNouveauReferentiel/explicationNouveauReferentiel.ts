import ExplicationNouveauReferentiel from './ExplicationNouveauReferentiel.svelte';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-explication-nouveau-referentiel',
  () => rechargeApp()
);

let app: ExplicationNouveauReferentiel;
const rechargeApp = () => {
  const conteneur = document.querySelector('#explication-nouveau-referentiel');
  if (!conteneur) return;

  app?.$destroy();
  app = mount(ExplicationNouveauReferentiel, { target: conteneur });
};

export default app!;
