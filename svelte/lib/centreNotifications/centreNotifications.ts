import CentreNotifications from './CentreNotifications.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-centre-notifications',
  async () => await rechargeApp()
);

let app: CentreNotifications;
const rechargeApp = async () => {
  if (app) await unmount(app);

  app = mount(CentreNotifications, {
    target: document.getElementById('centre-notifications')!,
  });
};

export default app!;
