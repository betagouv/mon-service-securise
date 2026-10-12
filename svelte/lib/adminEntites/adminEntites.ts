import AdminEntites from './AdminEntites.svelte';
import { mount, unmount } from 'svelte';
import type { AdminEntitesProps } from './adminEntites.types';

document.body.addEventListener(
  'svelte-recharge-admin-entites',
  async (e: CustomEvent<AdminEntitesProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: AdminEntitesProps) => {
  if (app) await unmount(app);

  app = mount(AdminEntites, {
    target: document.getElementById('conteneur-admin-entites')!,
    props,
  });
};

export default app!;
