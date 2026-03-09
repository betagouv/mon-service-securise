import CentreNotifications from './CentreNotifications.svelte';
import { mount } from 'svelte';

document.body.addEventListener('svelte-recharge-centre-notifications', () =>
  rechargeApp()
);

let app: CentreNotifications;
const rechargeApp = () => {
  app?.$destroy();
  app = mount(CentreNotifications, {
    target: document.getElementById('centre-notifications')!,
  });
};

export default app!;
