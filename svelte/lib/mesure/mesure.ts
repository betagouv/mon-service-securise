import Mesure from './Mesure.svelte';
import EnteteTiroir from './entete/EnteteTiroir.svelte';
import type { MesureGenerale, MesureProps, MesureSpecifique } from './mesure.d';

document.body.addEventListener(
  'svelte-recharge-mesure',
  (e: CustomEvent<MesureProps>) => rechargeApp({ ...e.detail })
);

let enteteTiroir: EnteteTiroir;
const changeCartoucheDuReferentiel = (
  mesureAEditer?: MesureGenerale | MesureSpecifique
) => {
  enteteTiroir?.$destroy();
  const cible = document.querySelector('.titre-tiroir');
  const insererAvant = cible?.lastChild;
  enteteTiroir = new EnteteTiroir({
    target: cible,
    anchor: insererAvant,
    props: { mesureAEditer },
  });
};

let app: Mesure;
const rechargeApp = (props: MesureProps) => {
  app?.$destroy();
  app = new Mesure({
    target: document.getElementById('conteneur-mesure')!,
    props,
  });
  changeCartoucheDuReferentiel(props.mesureAEditer);
};

export default app;
