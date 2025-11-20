import SimulationV2 from './SimulationV2.svelte';

document.body.addEventListener('svelte-recharge-simulation-v2', () =>
  rechargeApp()
);

let app: SimulationV2;
const rechargeApp = () => {
  app?.$destroy();
  app = new SimulationV2({
    target: document.getElementById('simulation-v2')!,
  });
};

export default app!;
