import { mount, unmount } from 'svelte';
import PagesService from './PagesService.svelte';
import type { PagesServiceProps } from './pagesService.d';

document.body.addEventListener(
  'svelte-recharge-pages-service',
  async (e: CustomEvent<PagesServiceProps>) => await rechargeApp(e.detail)
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: PagesServiceProps) => {
  const conteneur = document.querySelector('#pages-service');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(PagesService, { target: conteneur, props });
};

export default app!;
