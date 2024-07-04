import NiveauxDeSecurite from './NiveauxDeSecurite.svelte';
import type { NiveauxDeSecuriteProps } from './niveauxDeSecurite.d';

document.body.addEventListener(
  'svelte-recharge-niveaux-de-securite',
  (e: CustomEvent<NiveauxDeSecuriteProps>) => rechargeApp({ ...e.detail })
);

let app: NiveauxDeSecurite;
const rechargeApp = (props: NiveauxDeSecuriteProps) => {
  app?.$destroy();
  app = new NiveauxDeSecurite({
    target: document.getElementById('niveaux-de-securite')!,
    props,
  });
};

export default app!;
