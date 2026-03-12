import SimulationV2 from './SimulationV2.svelte';
import type { SimulationV2Props } from './simulationV2.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-simulation-v2',
  async (e: CustomEvent<SimulationV2Props>) => await rechargeApp(e.detail)
);

let app: SimulationV2;
const rechargeApp = async (props: SimulationV2Props) => {
  if (app) await unmount(app);

  app = mount(SimulationV2, {
    target: document.getElementById('simulation-v2')!,
    props,
  });
};

export default app!;
