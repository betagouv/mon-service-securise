import ListeMesures from './ListeMesures.svelte';
import type {
  ListeMesuresProps,
  RapportTeleversementProps,
} from './listeMesures.d';
import RapportTeleversementModelesMesureSpecifique from './televersement/RapportTeleversementModelesMesureSpecifique.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-liste-mesures',
  async (e: CustomEvent<ListeMesuresProps>) =>
    await rechargeApp({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-modeles-mesure-specifique',
  async (e: CustomEvent<RapportTeleversementProps>) =>
    await rechargeRapport({ ...e.detail })
);

let app: ListeMesures;
const rechargeApp = async (props: ListeMesuresProps) => {
  if (app) await unmount(app);

  app = mount(ListeMesures, {
    target: document.getElementById('liste-mesures')!,
    props,
  });
};

let rapport: RapportTeleversementModelesMesureSpecifique;
const rechargeRapport = async (props: RapportTeleversementProps) => {
  if (rapport) await unmount(rapport);

  rapport = mount(RapportTeleversementModelesMesureSpecifique, {
    target: document.getElementById('rapport-televersement')!,
    props,
  });
};

export default app!;
