declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-inscription': CustomEvent;
  }
}

type Intervalle = {
  borneBasse: string;
  borneHaute: string;
};

export type EstimationNombreServices = Intervalle & {
  label: string;
};

export type Organisation = {
  nom: string;
  siret: string;
  departement: string;
};

export type InformationsProfessionnelles = {
  prenom: string;
  nom: string;
  email: string;
  organisation: Organisation;
};

export type Departement = {
  code: string;
  nom: string;
};

export type InscriptionProps = {
  estimationNombreServices: EstimationNombreServices[];
  informationsProfessionnelles: InformationsProfessionnelles;
  departements: Departement[];
  invite: boolean;
};

export type FormulaireInscription = {
  prenom: string;
  nom: string;
  email: string;
  siretEntite: string;
  telephone: string;
  postes: string[];
  estimationNombreServices: Intervalle | null;
  agentConnect: boolean;
  cguAcceptees: boolean;
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
};
