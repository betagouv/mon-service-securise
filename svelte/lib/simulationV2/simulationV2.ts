import SimulationV2 from './SimulationV2.svelte';
import type { SimulationV2Props } from './simulationV2.d';

document.body.addEventListener(
  'svelte-recharge-simulation-v2',
  (e: CustomEvent<SimulationV2Props>) => rechargeApp(e.detail)
);

let app: SimulationV2;
const rechargeApp = (props: SimulationV2Props) => {
  app?.$destroy();
  app = new SimulationV2({
    target: document.getElementById('simulation-v2')!,
    props,
  });
};

export default app!;
