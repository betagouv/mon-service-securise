import type { AxiosResponse } from 'axios';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-groupes': CustomEvent;
  }
}

export type GroupeAffichable = {
  id: string;
  libelle: string;
};

export type Groupe = GroupeAffichable & {
  idServicesAssocies: string[];
};

export type GroupesProps = {
  avecGroupesServices: boolean;
  avecGroupesEntites: boolean;
};

export type ApiGroupes<G extends GroupeAffichable> = {
  lisGroupes: () => Promise<G[]>;
  ajouteGroupe: (libelle: string) => Promise<AxiosResponse<G>>;
  renommeGroupe: (id: string, libelle: string) => Promise<unknown>;
  supprimeGroupe: (id: string) => Promise<unknown>;
};

export type TextesOngletGroupes = {
  exempleLibelle: string;
  aucunGroupe: string;
  explicationListe: string;
  colonneElements: string;
};

export type LienElementsDuGroupe = {
  label: string;
  title: string;
  href: string;
};
