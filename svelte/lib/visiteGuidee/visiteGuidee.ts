import VisiteGuidee from './VisiteGuidee.svelte';
import type { VisiteGuideeProps } from './visiteGuidee.d';
import { visiteGuidee } from './visiteGuidee.store';

document.body.addEventListener(
  'svelte-recharge-visite-guidee',
  (e: CustomEvent<VisiteGuideeProps>) => rechargeApp(e.detail)
);

let app: VisiteGuidee;
const rechargeApp = (props: VisiteGuideeProps) => {
  app?.$destroy();
  visiteGuidee.initialise(props.etapeCourante);
  app = new VisiteGuidee({
    target: document.getElementById('visite-guidee')!,
  });
};

export default app!;
