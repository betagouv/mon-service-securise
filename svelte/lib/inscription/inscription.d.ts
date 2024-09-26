declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-inscription': CustomEvent;
  }
}

type Intervalle = {
  borneBasse: number;
  borneHaute: number;
};

export type EstimationNombreServices = Intervalle & {
  label: string;
};

export type Organisation = {
  denomination: string;
  siret: string;
  departement: string;
};

export type InformationsProfessionnelles = {
  prenom: string;
  nom: string;
  email: string;
  organisation: Organisation;
};

export type InscriptionProps = {
  estimationNombreServices: EstimationNombreServices[];
  informationsProfessionnelles: InformationsProfessionnelles;
};
