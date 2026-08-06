import VisiteGuideeSPA from './VisiteGuideeSPA.svelte';
import { mount } from 'svelte';
import type { VisiteGuideeSPAProps } from './visiteGuideeSPA.d';

document.body.addEventListener(
  'svelte-recharge-visite-guidee-spa',
  async (e: CustomEvent<VisiteGuideeSPAProps>) => await rechargeApp(e.detail)
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: VisiteGuideeSPAProps) => {
  app = mount(VisiteGuideeSPA, {
    target: document.getElementById('visite-guidee-spa')!,
    props,
  });
};

export default app!;
