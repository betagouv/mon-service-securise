import Entite from '../modeles/entite.js';
import { UUID } from '../typesBasiques.js';

export type IdEntiteCRM = UUID;

export type CrmImportEnMasse = {
  emailUtilisateur: string;
  nbServices: number;
};

export interface AdaptateurReportingCrm {
  consigneImportEnMasse: (data: CrmImportEnMasse) => Promise<void>;
  consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM>;
  consigneUtilisateur(email: string, idEntite?: IdEntiteCRM): Promise<void>;
}
