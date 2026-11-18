import { mount, unmount } from 'svelte';
import type { ObservatoireProps } from './observatoire.d';
import Observatoire from './Observatoire.svelte';

document.body.addEventListener(
  'svelte-recharge-observatoire',
  async (e: CustomEvent<ObservatoireProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: Observatoire;
const rechargeApp = async (props: ObservatoireProps) => {
  if (app) await unmount(app);

  app = mount(Observatoire, {
    target: document.getElementById('conteneur-observatoire')!,
    props,
  });
};

export default app!;
