import CentreNotifications from './CentreNotifications.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-centre-notifications',
  async () => await rechargeApp()
);

let app: CentreNotifications;
const rechargeApp = async () => {
  if (app) await unmount(app);

  const target = document.getElementById('centre-notifications');
  if (!target) return;

  app = mount(CentreNotifications, {
    target: target!,
  });
};

export default app!;
