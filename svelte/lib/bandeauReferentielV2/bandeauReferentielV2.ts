import BandeauReferentielV2 from './BandeauReferentielV2.svelte';
import type { BandeauReferentielV2Props } from './bandeauReferentielV2.d';

document.body.addEventListener(
  'svelte-recharge-bandeau-referentiel-v2',
  (e: CustomEvent<BandeauReferentielV2Props>) => rechargeApp(e.detail)
);

let app: BandeauReferentielV2;
const rechargeApp = (props: BandeauReferentielV2Props) => {
  app?.$destroy();
  app = new BandeauReferentielV2({
    target: document.getElementById('conteneur-bandeau-referentiel-v2')!,
    props,
  });
};

export default app!;
