import TableauDesMesures from './TableauDesMesures.svelte';
import type { TableauDesMesuresProps } from './tableauDesMesures.d';

import { mesures } from './stores/mesures.store';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-tableau-mesures',
  async (e: CustomEvent<TableauDesMesuresProps>) =>
    await rechargeApp({ ...e.detail })
);

const reinitialiseStore = () => {
  mesures.reinitialise();
};

let app: TableauDesMesures;
const rechargeApp = async (props: TableauDesMesuresProps) => {
  if (app) await unmount(app);

  reinitialiseStore();
  app = mount(TableauDesMesures, {
    target: document.getElementById('tableau-des-mesures')!,
    props,
  });
};

export default app!;
