import BandeauReferentielV2 from './BandeauReferentielV2.svelte';
import type { BandeauReferentielV2Props } from './bandeauReferentielV2.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-bandeau-referentiel-v2',
  async (e: CustomEvent<BandeauReferentielV2Props>) =>
    await rechargeApp(e.detail)
);

let app: BandeauReferentielV2;
const rechargeApp = async (props: BandeauReferentielV2Props) => {
  if (app) await unmount(app);

  app = mount(BandeauReferentielV2, {
    target: document.getElementById('conteneur-bandeau-referentiel-v2')!,
    props,
  });
};

export default app!;
