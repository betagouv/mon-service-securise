declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-de-bord': CustomEvent;
  }
}

type Contributeur = {
  id: string;
  prenomNom: string;
  initiales: string;
  poste: string;
  estUtilisateurCourant: boolean;
};

export type Service = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  contributeurs: Contributeur[];
  statutHomologation: {
    id: string;
    enCoursEdition: boolean;
    libelle: string;
    ordre: number;
  };
  nombreContributeurs: number;
  estProprietaire: boolean;
  documentsPdfDisponibles: string[];
  permissions: {
    gestionContributeurs: boolean;
  };
  aUneSuggestionAction: boolean;
};

export type ReponseApiServices = {
  services: Service[];
  resume: {
    nombreServices: number;
    nombreServicesHomologues: number;
  };
};

export type IndiceCyber = {
  id: string;
  indiceCyber: number;
};

export type ReponseApiIndicesCyber = {
  services: IndiceCyber[];
  resume: {
    indiceCyberMoyen: number;
  };
};
