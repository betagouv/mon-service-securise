export type CumulMensuel = {
  mois: string;
  cumul: number;
};

export type MesuresFaitesParMois = {
  mois: string;
  total: number;
};

export type ServicesParNiveauSecurite = {
  niveauSecurite: string;
  total: number;
};

export type DonneesObservatoire = {
  totalServices: number;
  cumulMensuelServices: CumulMensuel[];
  mesuresFaitesParMois: MesuresFaitesParMois[];
  servicesParNiveauSecurite: ServicesParNiveauSecurite[];
  cumulMensuelHomologations: CumulMensuel[];
  dateDerniereExecution: string | null;
  filtresDisponibles: FiltresDisponibles;
};

export type ValeurFiltre = { valeur: string; libelle: string };

export type FiltresDisponibles = {
  regions: ValeurFiltre[];
  departements: ValeurFiltre[];
  secteursActivite: ValeurFiltre[];
  typesOrganisation: ValeurFiltre[];
};

export type FiltresObservatoire = {
  region?: string;
  departement?: string;
  secteurActivite?: string;
  typeOrganisation?: string;
};
