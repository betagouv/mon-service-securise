import IndiceCyberPersonnalise from './IndiceCyberPersonnalise.svelte';
import type { IndiceCyberPersonnaliseProps } from './indiceCyberPersonnalise.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-indice-cyber-personnalise',
  async (e: CustomEvent<IndiceCyberPersonnaliseProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: IndiceCyberPersonnalise;
const rechargeApp = async (props: IndiceCyberPersonnaliseProps) => {
  if (app) await unmount(app);

  app = mount(IndiceCyberPersonnalise, {
    target: document.getElementById('conteneur-indice-cyber-personnalise')!,
    props: props,
  });
};

export default app!;
