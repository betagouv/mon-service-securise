import { mount, unmount } from 'svelte';
import EntetePageService from './EntetePageService.svelte';
import type { EntetePageServiceProps } from './entetePageService.d';

document.body.addEventListener(
  'svelte-recharge-entete-page-service',
  async (e: CustomEvent<EntetePageServiceProps>) => await rechargeApp(e.detail)
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: EntetePageServiceProps) => {
  const conteneur = document.querySelector('#entete-page-service');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(EntetePageService, { target: conteneur, props });
};

export default app!;
