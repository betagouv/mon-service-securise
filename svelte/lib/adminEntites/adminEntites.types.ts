import type { Entite } from '../ui/types';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-admin-entites': CustomEvent;
  }
}

export type AdminEntitesProps = {
  avecGroupesEntites: boolean;
};

export type AdminSupervise = {
  id: string;
  prenomNom: string;
  initiales: string;
  postes: string;
  estUtilisateurCourant: boolean;
};

export type EntiteSupervisee = Entite & {
  administrateurs: Array<AdminSupervise>;
  nombreServices: number;
  nombreUtilisateurs: number;
};
