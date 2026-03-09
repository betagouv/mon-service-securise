import IndiceCyber from './IndiceCyber.svelte';
import type { IndiceCyberProps } from './indiceCyber.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-indice-cyber',
  async (e: CustomEvent<IndiceCyberProps>) => await rechargeApp({ ...e.detail })
);

let app: IndiceCyber;
const rechargeApp = async (props: IndiceCyberProps) => {
  if (app) await unmount(app);

  app = mount(IndiceCyber, {
    target: document.getElementById('conteneur-indice-cyber')!,
    props: props,
  });
};

export default app!;
