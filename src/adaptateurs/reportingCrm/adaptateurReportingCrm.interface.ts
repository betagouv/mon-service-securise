import Entite from '../../modeles/entite.js';
import { UUID } from '../../typesBasiques.js';

export type IdEntiteCRM = UUID;

export type CrmImportEnMasse = {
  emailUtilisateur: string;
  nbServices: number;
};

export type HistorisationNombreDeServices = {
  siret: string;
  nombreDeServices: number;
};

export interface AdaptateurReportingCrm {
  consigneImportEnMasse: (data: CrmImportEnMasse) => Promise<void>;
  consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM>;
  historiseNombreDeServices(
    historisations: HistorisationNombreDeServices[]
  ): Promise<void>;
  consigneUtilisateur(email: string, idEntite?: IdEntiteCRM): Promise<void>;
  consigneNombreDeServicesDeLEntite(
    siret: string,
    nombreDeServices: number
  ): Promise<void>;
  consigneNombreDHomologationsDeLEntite(
    siret: string,
    nombreDHomologations: number
  ): Promise<void>;
  consigneNombreDeServicesEnProprietaire(
    email: string,
    nombreDeServicesEnProprietaire: number
  ): Promise<void>;
}
