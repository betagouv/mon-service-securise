import TableauDesMesures from './TableauDesMesures.svelte';
import type { TableauDesMesuresProps } from './tableauDesMesures.d';

document.body.addEventListener(
  'svelte-recharge-tableau-mesures',
  (e: CustomEvent<TableauDesMesuresProps>) => rechargeApp({ ...e.detail })
);

let app: TableauDesMesures;

const rechargeApp = (props: TableauDesMesuresProps) => {
  app?.$destroy();
  app = new TableauDesMesures({
    target: document.getElementById('tableau-des-mesures')!,
    props,
  });
};

export default app!;
