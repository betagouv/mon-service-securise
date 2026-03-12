import CreationV2 from './CreationV2.svelte';
import type { CreationV2Props } from './creationV2.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-creation-v2',
  async (e: CustomEvent<CreationV2Props>) => await rechargeApp(e.detail)
);

let app: CreationV2;
const rechargeApp = async (props: CreationV2Props) => {
  if (app) await unmount(app);

  app = mount(CreationV2, {
    target: document.getElementById('creation-v2')!,
    props,
  });
};

export default app!;
