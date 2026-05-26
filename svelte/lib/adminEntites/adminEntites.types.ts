import type { Entite } from '../ui/types';

export type AdminSupervise = {
  id: string;
  prenomNom: string;
  initiales: string;
  postes: string;
};

export type EntiteSupervisee = Entite & {
  administrateurs: Array<AdminSupervise>;
  nombreServices: number;
  nombreUtilisateurs: number;
};
