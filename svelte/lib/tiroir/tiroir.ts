import Tiroir from './Tiroir.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-tiroir',
  async () => await rechargeApp()
);

let app: Tiroir;
const rechargeApp = async () => {
  if (app) await unmount(app);

  app = mount(Tiroir, {
    target: document.getElementById('tiroir')!,
  });
};

export default app!;
