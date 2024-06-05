import CentreNotifications from './CentreNotifications.svelte';

document.body.addEventListener('svelte-recharge-centre-notifications', () =>
  rechargeApp()
);

let app: CentreNotifications;
const rechargeApp = () => {
  app?.$destroy();
  app = new CentreNotifications({
    target: document.getElementById('centre-notifications')!,
  });
};

export default app!;
