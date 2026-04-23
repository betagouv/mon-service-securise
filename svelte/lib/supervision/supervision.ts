import Supervision from './Supervision.svelte';
import type { SupervisionProps } from './supervision.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-supervision',
  async (e: CustomEvent<SupervisionProps>) => await rechargeApp({ ...e.detail })
);

let app: Supervision;
const rechargeApp = async (props: SupervisionProps) => {
  if (app) await unmount(app);

  app = mount(Supervision, {
    target: document.getElementById('conteneur-supervision')!,
    props,
  });
};

export default app!;
