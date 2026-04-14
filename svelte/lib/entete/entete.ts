import Entete from './Entete.svelte';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-entete',
  async () => await rechargeApp()
);

let app: Entete;
const rechargeApp = async () => {
  const conteneurs = document.querySelectorAll('.utilisateur-courant');
  if (!conteneurs) return;

  for (const conteneur of conteneurs) {
    app = mount(Entete, { target: conteneur });
  }
};

export default app!;
