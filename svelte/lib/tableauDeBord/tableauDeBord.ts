import TableauDeBord from './TableauDeBord.svelte';
import type { TableauDeBordProps } from './tableauDeBord.d';

document.body.addEventListener(
  'svelte-recharge-tableau-de-bord',
  (e: CustomEvent<TableauDeBordProps>) => rechargeApp({ ...e.detail })
);

let app: TableauDeBord;
const rechargeApp = (props: TableauDeBordProps) => {
  app?.$destroy();
  app = new TableauDeBord({
    target: document.getElementById('tableau-de-bord')!,
    props,
  });
};

export default app!;
