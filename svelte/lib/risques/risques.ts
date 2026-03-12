import Risques from './Risques.svelte';
import type {
  DonneesRisque,
  Risque,
  RisquesProps,
  TypeRisque,
} from './risques.d';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-risques',
  async (e: CustomEvent<RisquesProps>) => await rechargeApp({ ...e.detail })
);

let app: Risques;

export const convertisDonneesRisqueGeneral = (
  donneesRisque: DonneesRisque
) => ({
  ...donneesRisque,
  commentaire: donneesRisque.commentaire ?? '',
  niveauGravite: donneesRisque.niveauGravite ?? '',
  niveauVraisemblance: donneesRisque.niveauVraisemblance ?? '',
  type: 'GENERAL' as TypeRisque,
});

export const convertisDonneesRisqueSpecifique = (
  donneesRisque: DonneesRisque
) => ({
  ...donneesRisque,
  intitule: donneesRisque.intitule,
  commentaire: donneesRisque.commentaire ?? '',
  description: donneesRisque.description ?? '',
  niveauGravite: donneesRisque.niveauGravite ?? '',
  niveauVraisemblance: donneesRisque.niveauVraisemblance ?? '',
  type: 'SPECIFIQUE' as TypeRisque,
});

const rechargeApp = async (props: RisquesProps) => {
  if (app) await unmount(app);

  const tousRisques: Risque[] = [
    ...props.risques.risquesGeneraux.map(convertisDonneesRisqueGeneral),
    ...props.risques.risquesSpecifiques.map(convertisDonneesRisqueSpecifique),
  ];
  app = mount(Risques, {
    target: document.getElementById('conteneur-risques')!,
    props: { ...props, risques: tousRisques },
  });
};

const ellipse = (chaine: string, n: number) => {
  return chaine.length > n ? `${chaine.slice(0, n - 1)}...` : chaine;
};

export const intituleRisque = (risque: Risque) =>
  risque.type === 'GENERAL' ? risque.intitule : ellipse(risque.intitule, 100);

export const risqueAMettreAJour = (risque: Risque) =>
  risque.type === 'SPECIFIQUE' && !risque.categories.length;

export default app!;
