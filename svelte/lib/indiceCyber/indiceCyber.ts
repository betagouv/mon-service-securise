import IndiceCyber from './IndiceCyber.svelte';
import type { IndiceCyberProps } from './indiceCyber.d';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-indice-cyber',
  (e: CustomEvent<IndiceCyberProps>) => rechargeApp({ ...e.detail })
);

let app: IndiceCyber;
const rechargeApp = (props: IndiceCyberProps) => {
  app?.$destroy();
  app = mount(IndiceCyber, {
    target: document.getElementById('conteneur-indice-cyber')!,
    props: props,
  });
};

export default app!;
