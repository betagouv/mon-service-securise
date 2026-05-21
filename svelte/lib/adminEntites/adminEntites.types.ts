import type { Entite } from '../ui/types';

export type EntiteSupervisee = Entite & {
  administrateurs: Array<{ prenomNom: string }>;
  nombreServices: number;
  nombreUtilisateurs: number;
};
