import donneesReferentiel from '../../donneesReferentiel.js';

export type CategorieMesure = keyof typeof donneesReferentiel.categoriesMesures;

type UnIndiceParCategorie = Record<CategorieMesure, number>;
type IndiceTotal = { total: number };
export type DonneesIndiceCyber = UnIndiceParCategorie & IndiceTotal;
