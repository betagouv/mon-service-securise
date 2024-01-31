import DecouverteFonctionnalite from './DecouverteFonctionnalite.svelte';
import type { DecouverteFonctionnaliteProps } from './decouverteFonctionnalite.d';

document.body.addEventListener(
  'svelte-recharge-decouverte-fonctionnalite',
  (e: CustomEvent<DecouverteFonctionnaliteProps>) =>
    rechargeApp({ ...e.detail })
);

let app: DecouverteFonctionnalite;
const rechargeApp = (props: DecouverteFonctionnaliteProps) => {
  app?.$destroy();

  app = new DecouverteFonctionnalite({
    target: document.getElementById('conteneur-decouverte-fonctionnalite')!,
    props: props,
  });
};

export default app!;
