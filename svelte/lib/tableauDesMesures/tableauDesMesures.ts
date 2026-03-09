import TableauDesMesures from './TableauDesMesures.svelte';
import type { TableauDesMesuresProps } from './tableauDesMesures.d';

import { mesures } from './stores/mesures.store';
import { mount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-tableau-mesures',
  (e: CustomEvent<TableauDesMesuresProps>) => rechargeApp({ ...e.detail })
);

const reinitialiseStore = () => {
  mesures.reinitialise();
};

let app: TableauDesMesures;
const rechargeApp = (props: TableauDesMesuresProps) => {
  app?.$destroy();
  reinitialiseStore();
  app = mount(TableauDesMesures, {
    target: document.getElementById('tableau-des-mesures')!,
    props,
  });
};

export default app!;
