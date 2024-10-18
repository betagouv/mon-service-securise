import { decode } from 'html-entities';
import Risques from './Risques.svelte';
import type { Risque, RisquesProps, TypeRisque } from './risques.d';

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
      commentaire: decode(r.commentaire),
      niveauGravite: r.niveauGravite ?? '',
      niveauVraisemblance: r.niveauVraisemblance ?? '',
      type: 'GENERAL' as TypeRisque,
    })),
    ...props.risques.risquesSpecifiques.map((r) => ({
      ...r,
      intitule: decode(r.intitule),
      commentaire: decode(r.commentaire),
      description: decode(r.description),
      niveauGravite: r.niveauGravite ?? '',
      niveauVraisemblance: r.niveauVraisemblance ?? '',
      type: 'SPECIFIQUE' as TypeRisque,
    })),
  ];
  app = new Risques({
    target: document.getElementById('conteneur-risques')!,
    props: { ...props, risques: tousRisques },
  });
};

const ellipse = (chaine: string, n: number) => {
  return chaine.length > n ? `${chaine.slice(0, n - 1)}...` : chaine;
};

export const intituleRisque = (risque: Risque) =>
  risque.type === 'GENERAL' ? risque.intitule : ellipse(risque.intitule, 100);

export default app!;
