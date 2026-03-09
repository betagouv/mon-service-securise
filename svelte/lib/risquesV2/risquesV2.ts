import RisquesV2 from './RisquesV2.svelte';
import type { RisquesV2Props } from './risquesV2.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-risques-v2',
  async (e: CustomEvent<RisquesV2Props>) => await rechargeApp({ ...e.detail })
);

let app: RisquesV2;

const rechargeApp = async (props: RisquesV2Props) => {
  if (app) await unmount(app);

  app = mount(RisquesV2, {
    target: document.getElementById('conteneur-risques-v2')!,
    props,
  });
};

export default app!;
