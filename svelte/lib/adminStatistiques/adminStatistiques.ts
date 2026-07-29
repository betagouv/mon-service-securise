import AdminStatistiques from './AdminStatistiques.svelte';
import { mount, unmount } from 'svelte';
import type { AdminStatistiquesProps } from './adminStatistiques.types';

document.body.addEventListener(
  'svelte-recharge-admin-statistiques',
  async (e: CustomEvent<AdminStatistiquesProps>) =>
    await rechargeApp({ ...e.detail })
);

let app: AdminStatistiques;
const rechargeApp = async (props: AdminStatistiquesProps) => {
  if (app) await unmount(app);

  app = mount(AdminStatistiques, {
    target: document.getElementById('conteneur-admin-statistiques')!,
    props: props,
  });
};

export default app!;
