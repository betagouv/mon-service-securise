import { Gravite } from '../../moteurRisques/v2/graviteObjectifsVises.js';
import { Vraisemblance } from '../../moteurRisques/v2/vraisemblance/vraisemblance.types.js';

export type NiveauDeRisque = 'faible' | 'moyen' | 'eleve' | 'nonEvalue';

export type RisqueCartographie = {
  identifiant: string;
  intitule: string;
  description: string;
  gravite: Gravite;
  vraisemblance: Vraisemblance;
  niveau: NiveauDeRisque;
};

export const COULEURS_DES_NIVEAUX_DE_RISQUE: Record<NiveauDeRisque, string> = {
  faible: '84C14E',
  moyen: 'FAC63C',
  eleve: 'F8785B',
  nonEvalue: 'EEEEEE',
};
