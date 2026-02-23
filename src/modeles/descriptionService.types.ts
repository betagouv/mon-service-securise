import { NiveauSecurite } from '../../donneesReferentielMesuresV2.js';
import { DonneesEntite } from './entite.js';

type DonneesAvecDescription = Array<{ description: string }>;

export type NombreOrganisationsUtilisatrices = {
  borneBasse: number;
  borneHaute: number;
};

export type DonneesDescriptionService = {
  delaiAvantImpactCritique: string;
  localisationDonnees: string;
  nomService: string;
  provenanceService: string;
  statutDeploiement: string;
  nombreOrganisationsUtilisatrices: NombreOrganisationsUtilisatrices;
  niveauSecurite: NiveauSecurite;
  presentation: string;
  donneesCaracterePersonnel: string[];
  fonctionnalites: string[];
  typeService: string[];
  donneesSensiblesSpecifiques: DonneesAvecDescription;
  fonctionnalitesSpecifiques: DonneesAvecDescription;
  pointsAcces: DonneesAvecDescription;
  organisationResponsable: DonneesEntite;
};

export type DonneesPourEstimationNiveauSecurite = Pick<
  DonneesDescriptionService,
  'fonctionnalites' | 'donneesCaracterePersonnel' | 'delaiAvantImpactCritique'
>;
