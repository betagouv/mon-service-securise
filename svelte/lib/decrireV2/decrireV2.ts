import DecrireV2 from './DecrireV2.svelte';
import type { DecrireV2Props } from './decrireV2.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-decrire-v2',
  async (e: CustomEvent<DecrireV2Props>) => await rechargeApp(e.detail)
);

let app: DecrireV2;
const rechargeApp = async (props: DecrireV2Props) => {
  if (app) await unmount(app);

  app = mount(DecrireV2, {
    target: document.getElementById('decrire-v2')!,
    props,
  });
};

export default app!;
