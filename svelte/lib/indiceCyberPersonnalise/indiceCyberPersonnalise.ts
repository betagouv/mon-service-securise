import IndiceCyberPersonnalise from './IndiceCyberPersonnalise.svelte';
import type { IndiceCyberPersonnaliseProps } from './indiceCyberPersonnalise.d';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-indice-cyber-personnalise',
  (e: CustomEvent<IndiceCyberPersonnaliseProps>) => rechargeApp({ ...e.detail })
);

let app: IndiceCyberPersonnalise;
const rechargeApp = (props: IndiceCyberPersonnaliseProps) => {
  app?.$destroy();
  app = mount(IndiceCyberPersonnalise, {
    target: document.getElementById('conteneur-indice-cyber-personnalise')!,
    props: props,
  });
};

export default app!;
