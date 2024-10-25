import Mesure from './Mesure.svelte';
import EnteteTiroir from './entete/EnteteTiroir.svelte';
import type { MesureEditee, MesureProps } from './mesure.d';
import { store } from './mesure.store';

document.body.addEventListener(
  'svelte-recharge-mesure',
  (e: CustomEvent<MesureProps>) => rechargeApp({ ...e.detail })
);

let enteteTiroir: EnteteTiroir;
const changeCartoucheDuReferentiel = () => {
  enteteTiroir?.$destroy();
  const cibleIntituleType = document.querySelector('.type-tiroir');
  cibleIntituleType!.innerHTML = 'Mesure';
  cibleIntituleType!.classList.remove('invisible');
  const cible = document.querySelector('.titre-tiroir');
  if (!cible) {
    throw new Error('Element titre du tiroir non trouvé');
  }
  enteteTiroir = new EnteteTiroir({ target: cible });
};

const reinitialiseStore = (mesureAEditer?: MesureEditee) => {
  store.reinitialise(mesureAEditer);
};

let app: Mesure;
const rechargeApp = ({ mesureAEditer, ...autreProps }: MesureProps) => {
  app?.$destroy();
  reinitialiseStore(mesureAEditer);
  changeCartoucheDuReferentiel();
  app = new Mesure({
    target: document.getElementById('conteneur-mesure')!,
    props: autreProps,
  });
};

export default app!;
