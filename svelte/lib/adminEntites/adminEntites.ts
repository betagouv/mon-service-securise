import AdminEntites from './AdminEntites.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-admin-entites',
  async () => await rechargeApp()
);

let app: AdminEntites;
const rechargeApp = async () => {
  if (app) await unmount(app);

  app = mount(AdminEntites, {
    target: document.getElementById('conteneur-admin-entites')!,
  });
};

export default app!;
