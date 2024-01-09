import TableauDesMesures from './TableauDesMesures.svelte';
import type { TableauDesMesuresProps } from './tableauDesMesures.d';
import { store } from './tableauDesMesures.store';

document.body.addEventListener(
  'svelte-recharge-tableau-mesures',
  (e: CustomEvent<TableauDesMesuresProps>) => rechargeApp({ ...e.detail })
);

const reinitialiseStore = () => {
  store.reinitialise();
};

let app: TableauDesMesures;
const rechargeApp = (props: TableauDesMesuresProps) => {
  app?.$destroy();
  reinitialiseStore();
  app = new TableauDesMesures({
    target: document.getElementById('tableau-des-mesures')!,
    props,
  });
};

export default app!;
