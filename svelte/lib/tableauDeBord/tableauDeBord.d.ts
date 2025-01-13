declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-de-bord': CustomEvent;
  }
}

export type TableauDeBordProps = {
  estSuperviseur: boolean;
  modeVisiteGuidee: boolean;
  profilUtilisateurComplet?: boolean;
};

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
  actionRecommandee: ActionRecommandee;
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

export type IndiceCyberMoyen = number | '-';

export type ReponseApiIndicesCyber = {
  services: IndiceCyber[];
  resume: {
    indiceCyberMoyen: IndiceCyberMoyen;
  };
};

export type ActionRecommandee = 'mettreAJour' | undefined;
