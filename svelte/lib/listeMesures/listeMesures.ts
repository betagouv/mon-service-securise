import ListeMesures from './ListeMesures.svelte';
import type {
  ListeMesuresProps,
  RapportTeleversementProps,
} from './listeMesures.d';
import RapportTeleversementModelesMesureSpecifique from './televersement/RapportTeleversementModelesMesureSpecifique.svelte';

document.body.addEventListener(
  'svelte-recharge-liste-mesures',
  (e: CustomEvent<ListeMesuresProps>) => rechargeApp({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-modeles-mesure-specifique',
  (e: CustomEvent<RapportTeleversementProps>) =>
    rechargeRapport({ ...e.detail })
);

let app: ListeMesures;
const rechargeApp = (props: ListeMesuresProps) => {
  app?.$destroy();
  app = new ListeMesures({
    target: document.getElementById('liste-mesures')!,
    props,
  });
};

let rapport: RapportTeleversementModelesMesureSpecifique;
const rechargeRapport = (props: RapportTeleversementProps) => {
  rapport?.$destroy();
  rapport = new RapportTeleversementModelesMesureSpecifique({
    target: document.getElementById('rapport-televersement')!,
    props,
  });
};

export default app!;
