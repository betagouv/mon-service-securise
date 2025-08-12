import ListeMesures from './ListeMesures.svelte';
import type { ListeMesuresProps } from './listeMesures.d';

document.body.addEventListener(
  'svelte-recharge-liste-mesures',
  (e: CustomEvent<ListeMesuresProps>) => rechargeApp({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-modeles-mesure-specifique',
  () => {
    console.log('🗒️ Affiche le rapport de téléversement…');
  }
);

let app: ListeMesures;
const rechargeApp = (props: ListeMesuresProps) => {
  app?.$destroy();
  app = new ListeMesures({
    target: document.getElementById('liste-mesures')!,
    props,
  });
};

export default app!;
