import type {
  DonneesRisque,
  Risque,
  Risques as TousRisques,
  TypeRisque,
} from './risques.d';

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

export const tousRisques = (risques: TousRisques) => {
  return [
    ...risques.risquesGeneraux.map(convertisDonneesRisqueGeneral),
    ...risques.risquesSpecifiques.map(convertisDonneesRisqueSpecifique),
  ];
};

const ellipse = (chaine: string, n: number) => {
  return chaine.length > n ? `${chaine.slice(0, n - 1)}...` : chaine;
};

export const intituleRisque = (risque: Risque) =>
  risque.type === 'GENERAL' ? risque.intitule : ellipse(risque.intitule, 100);

export const risqueAMettreAJour = (risque: Risque) =>
  risque.type === 'SPECIFIQUE' && !risque.categories.length;
