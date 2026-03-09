import Mesure from './Mesure.svelte';
import EnteteTiroir from './entete/EnteteTiroir.svelte';
import type { MesureEditee, MesureProps } from './mesure.d';
import { store } from './mesure.store';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-mesure',
  async (e: CustomEvent<MesureProps>) => await rechargeApp({ ...e.detail })
);

let enteteTiroir: ReturnType<typeof mount>;
const changeCartoucheDuReferentiel = async () => {
  if (enteteTiroir) await unmount(enteteTiroir);

  const cible = document.querySelector('.titre-tiroir');
  if (!cible) {
    throw new Error('Element titre du tiroir non trouvé');
  }
  enteteTiroir = mount(EnteteTiroir, { target: cible });
};

const reinitialiseStore = (mesureAEditer?: MesureEditee) => {
  store.reinitialise(mesureAEditer);
};

let app: Mesure;
const rechargeApp = async ({ mesureAEditer, ...autreProps }: MesureProps) => {
  if (app) await unmount(app);

  reinitialiseStore(mesureAEditer);
  await changeCartoucheDuReferentiel();
  app = mount(Mesure, {
    target: document.getElementById('conteneur-mesure')!,
    props: autreProps,
  });
};

export default app!;
