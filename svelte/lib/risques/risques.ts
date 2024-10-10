import Risques from './Risques.svelte';
import type { RisquesProps, TypeRisque, Risque } from './risques.d';

document.body.addEventListener(
  'svelte-recharge-risques',
  (e: CustomEvent<RisquesProps>) => rechargeApp({ ...e.detail })
);

let app: Risques;
const rechargeApp = (props: RisquesProps) => {
  app?.$destroy();
  const tousRisques: Risque[] = [
    ...props.risques.risquesGeneraux.map((r) => ({
      ...r,
      type: 'GENERAL' as TypeRisque,
    })),
    ...props.risques.risquesSpecifiques.map((r) => ({
      ...r,
      type: 'SPECIFIQUE' as TypeRisque,
    })),
  ];
  app = new Risques({
    target: document.getElementById('conteneur-risques')!,
    props: { ...props, risques: tousRisques },
  });
};

export default app!;
