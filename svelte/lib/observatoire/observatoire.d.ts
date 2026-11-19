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
};

export type FiltresObservatoire = {
  region?: string;
  departement?: string;
  secteurActivite?: string;
  typeOrganisation?: string;
};
