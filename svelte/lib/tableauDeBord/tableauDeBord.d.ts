declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-tableau-de-bord': CustomEvent;
    'svelte-recharge-rapport-televersement-services': CustomEvent;
    'svelte-recharge-rapport-televersement-services-v2': CustomEvent;
  }
}

export type TableauDeBordProps = {
  estSuperviseur: boolean;
  modeVisiteGuidee: boolean;
  dateInscriptionUtilisateur: Date;
  profilUtilisateurComplet?: boolean;
  avecPromotionDeMsc: boolean;
};

type Contributeur = {
  id: string;
  prenomNom: string;
  initiales: string;
  poste: string;
  estUtilisateurCourant: boolean;
};

export type NiveauSecuriteService = 'niveau1' | 'niveau2' | 'niveau3';

export type Service = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  contributeurs: Contributeur[];
  statutHomologation?: {
    id: string;
    enCoursEdition: boolean;
    libelle: string;
    ordre: number;
    dateExpiration?: string;
  };
  nombreContributeurs: number;
  estProprietaire: boolean;
  documentsPdfDisponibles: string[];
  permissions: {
    gestionContributeurs: boolean;
  };
  aUneSuggestionAction: boolean;
  actionRecommandee?: ActionRecommandee;
  niveauSecurite?: NiveauSecuriteService;
  pourcentageCompletude?: number;
};

export type BrouillonService = {
  id: string;
  nomService: string;
};

export type ReponseApiServices = {
  services: Service[];
  resume: {
    nombreServices: number;
    nombreServicesHomologues: number;
    nombreHomologationsExpirees: number;
  };
  brouillonsService: BrouillonService[];
};

export type IndiceCyber = {
  id: string;
  indiceCyber?: string;
};

export type IndiceCyberMoyen = number | '-';

export type ServiceAvecIndiceCyber = Service & { indiceCyber?: number };

export type ReponseApiIndicesCyber = {
  services: IndiceCyber[];
  resume: {
    indiceCyberMoyen: IndiceCyberMoyen;
  };
};

export type IdActionRecommandee =
  | 'mettreAJour'
  | 'continuerHomologation'
  | 'augmenterIndiceCyber'
  | 'telechargerEncartHomologation'
  | 'homologuerANouveau'
  | 'homologuerService'
  | 'inviterContributeur';

export type ActionRecommandee = {
  id: IdActionRecommandee;
  autorisee: boolean;
};
