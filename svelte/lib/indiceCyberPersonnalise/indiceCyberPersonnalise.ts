import IndiceCyberPersonnalise from './IndiceCyberPersonnalise.svelte';
import type { IndiceCyberPersonnaliseProps } from './indiceCyberPersonnalise.d';

document.body.addEventListener(
  'svelte-recharge-indice-cyber-personnalise',
  (e: CustomEvent<IndiceCyberPersonnaliseProps>) => rechargeApp({ ...e.detail })
);

let app: IndiceCyberPersonnalise;
const rechargeApp = (props: IndiceCyberPersonnaliseProps) => {
  app?.$destroy();
  app = new IndiceCyberPersonnalise({
    target: document.getElementById('conteneur-indice-cyber-personnalise')!,
    props: props,
  });
};

export default app!;
