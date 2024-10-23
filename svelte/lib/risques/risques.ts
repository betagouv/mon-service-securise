import { decode } from 'html-entities';
import Risques from './Risques.svelte';
import {
  type DonneesRisque,
  NiveauRisque,
  type Risque,
  type RisquesProps,
  type TypeRisque,
} from './risques.d';

document.body.addEventListener(
  'svelte-recharge-risques',
  (e: CustomEvent<RisquesProps>) => rechargeApp({ ...e.detail })
);

let app: Risques;

export const convertisDonneesRisqueGeneral = (
  donneesRisque: DonneesRisque
) => ({
  ...donneesRisque,
  commentaire: decode(donneesRisque.commentaire),
  niveauGravite: donneesRisque.niveauGravite ?? '',
  niveauVraisemblance: donneesRisque.niveauVraisemblance ?? '',
  type: 'GENERAL' as TypeRisque,
});

export const convertisDonneesRisqueSpecifique = (
  donneesRisque: DonneesRisque
) => ({
  ...donneesRisque,
  intitule: decode(donneesRisque.intitule),
  commentaire: decode(donneesRisque.commentaire),
  description: decode(donneesRisque.description),
  niveauGravite: donneesRisque.niveauGravite ?? '',
  niveauVraisemblance: donneesRisque.niveauVraisemblance ?? '',
  type: 'SPECIFIQUE' as TypeRisque,
});

const rechargeApp = (props: RisquesProps) => {
  app?.$destroy();
  const tousRisques: Risque[] = [
    ...props.risques.risquesGeneraux.map(convertisDonneesRisqueGeneral),
    ...props.risques.risquesSpecifiques.map(convertisDonneesRisqueSpecifique),
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

export const risqueAMettreAJour = (risque: Risque) =>
  risque.type === 'SPECIFIQUE' && !risque.categories.length;

const referentielNiveauRisque: NiveauRisque[][] = [
  [
    NiveauRisque.Moyen,
    NiveauRisque.Moyen,
    NiveauRisque.Eleve,
    NiveauRisque.Eleve,
  ],
  [
    NiveauRisque.Faible,
    NiveauRisque.Moyen,
    NiveauRisque.Eleve,
    NiveauRisque.Eleve,
  ],
  [
    NiveauRisque.Faible,
    NiveauRisque.Faible,
    NiveauRisque.Moyen,
    NiveauRisque.Eleve,
  ],
  [
    NiveauRisque.Faible,
    NiveauRisque.Faible,
    NiveauRisque.Moyen,
    NiveauRisque.Moyen,
  ],
];

export const niveauRisqueCellule = (colonne: number, ligne: number) => {
  return referentielNiveauRisque[ligne][colonne];
};

export default app!;
