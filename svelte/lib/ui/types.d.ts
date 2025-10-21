import type { StatutMesure } from '../modeles/modeleMesure';

export enum Referentiel {
  ANSSI = 'ANSSI',
  SPECIFIQUE = 'Mesures ajoutées',
  CNIL = 'CNIL',
  RISQUE_SPECIFIQUE = 'Risques ajoutés',
}

export type ReferentielStatut = Record<StatutMesure, string>;

export type TypeNotification = 'nouveaute' | 'tache';

type NotificationBase = {
  id: string;
  titre: string;
  statutLecture: 'lue' | 'nonLue';
  lien: string;
  type: TypeNotification;
  doitNotifierLecture: boolean;
  horodatage?: string;
  canalDiffusion: 'centreNotifications' | 'page';
};

export type NotificationNouveaute = NotificationBase & {
  type: 'nouveaute';
  image: string;
  sousTitre: string;
};

export type NotificationTache = NotificationBase & {
  type: 'tache';
  titreCta: string;
  entete: string;
};

export type Notification = NotificationNouveaute | NotificationTache;

export type PrioriteMesure = 'p1' | 'p2' | 'p3';

export type ReferentielPriorite = Record<PrioriteMesure, LibellePriorite>;

export type LibellePriorite = {
  libelleCourt: string;
  libelleComplet: string;
};

export type EcheanceMesure = string;

export type ResumeNiveauDroit =
  | 'PROPRIETAIRE'
  | 'ECRITURE'
  | 'LECTURE'
  | 'PERSONNALISE';

export enum CategorieMesure {
  GOUVERNANCE = 'gouvernance',
  PROTECTION = 'protection',
  DEFENSE = 'defense',
  RESILIENCE = 'resilience',
}

export type ModeleMesure = {
  id: string;
  description: string;
  descriptionLongue: string;
  categorie: CategorieMesure;
};

export type ModeleMesureGenerale = ModeleMesure & {
  identifiantNumerique: string;
  referentiel: Referentiel;
};

export type ModeleMesureSpecifique = ModeleMesure & {
  idsServicesAssocies: string[];
};

export type MesureSpecifique = {
  id: string;
  categorie: CategorieMesure;
  description: string;
  descriptionLongue?: string;
  idModele?: string;
  responsables: string[];
  statut: StatutMesure;
  modalites: string;
};

export type ObjetDeDonnees = Record<string, any>;

export type IdNiveauDeSecurite = 'niveau1' | 'niveau2' | 'niveau3';

export type IdTypeService = 'api' | 'applicationMobile' | 'siteInternet';

export type ReferentielTypesService = Record<
  IdTypeService,
  { description: string }
>;

export type Entite = {
  nom?: string;
  departement?: string;
  siret: string;
};
