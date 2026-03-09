import RisquesV2 from './RisquesV2.svelte';
import type { RisquesV2Props } from './risquesV2.d';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-risques-v2',
  (e: CustomEvent<RisquesV2Props>) => rechargeApp({ ...e.detail })
);

let app: RisquesV2;

const rechargeApp = (props: RisquesV2Props) => {
  app?.$destroy();
  app = mount(RisquesV2, {
    target: document.getElementById('conteneur-risques-v2')!,
    props,
  });
};

export default app!;
