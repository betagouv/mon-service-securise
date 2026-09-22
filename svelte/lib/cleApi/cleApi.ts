import CleApi from './CleApi.svelte';
import type { CleApiProps } from './cleApi.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-cle-api',
  async (e: CustomEvent<CleApiProps>) => await rechargeApp({ ...e.detail })
);

let app: CleApi;
const rechargeApp = async (props: CleApiProps) => {
  if (app) await unmount(app);

  app = mount(CleApi, {
    target: document.getElementById('conteneur-cle-api')!,
    props,
  });
};

export default app!;
