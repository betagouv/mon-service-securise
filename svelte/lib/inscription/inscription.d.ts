declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-inscription': CustomEvent;
  }
}

export type EstimationNombreServices = {
  label: string;
  borneBasse: number;
  borneHaute: number;
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
