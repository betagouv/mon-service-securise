import { mount, unmount } from 'svelte';
import MenuNavigationService from './MenuNavigationService.svelte';
import type { MenuNavigationServiceProps } from './menuNavigationService.d';

document.body.addEventListener(
  'svelte-recharge-menu-navigation-service',
  async (e: CustomEvent<MenuNavigationServiceProps>) =>
    await rechargeApp(e.detail)
);

let app: ReturnType<typeof mount>;
const rechargeApp = async (props: MenuNavigationServiceProps) => {
  const conteneur = document.querySelector('#menu-navigation-service');
  if (!conteneur) return;

  if (app) await unmount(app);

  app = mount(MenuNavigationService, { target: conteneur, props });
};

export default app!;
