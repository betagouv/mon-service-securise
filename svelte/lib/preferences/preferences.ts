import { mount, unmount } from 'svelte';
import Preferences from './Preferences.svelte';
import type { PreferencesProps } from './preferences.types';

document.body.addEventListener(
  'svelte-recharge-preferences',
  async (e: CustomEvent<PreferencesProps>) => await rechargeApp({ ...e.detail })
);

let app: Preferences;
const rechargeApp = async (props: PreferencesProps) => {
  if (app) await unmount(app);

  app = mount(Preferences, {
    target: document.getElementById('conteneur-preferences')!,
    props,
  });
};

export default app!;
