import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../../modeles/entite.js';

/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

export class AdaptateurReportingCrmMemoire implements AdaptateurReportingCrm {
  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    console.log('📝 [REPORTING CRM] Import en masse');
    console.dir(data);
  }

  async consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM> {
    const idEntite = crypto.randomUUID();
    console.log('📝 [REPORTING CRM] Entité utilisatrice', idEntite);
    console.dir(entite);
    return idEntite;
  }

  async consigneUtilisateur(
    email: string,
    idEntite?: IdEntiteCRM
  ): Promise<void> {
    console.log('📝 [REPORTING CRM] Utilisateur');
    console.dir({ email, idEntite });
  }

  async consigneNombreDeServicesDeLEntite(
    siret: string,
    nombreDeServices: number
  ): Promise<void> {
    console.log("📝 [REPORTING CRM] Nombre de services de l'entité");
    console.dir({ siret, nombreDeServices });
  }

  async consigneNombreDHomologationsDeLEntite(
    siret: string,
    nombreDHomologations: number
  ): Promise<void> {
    console.log("📝 [REPORTING CRM] Nombre d'homologations de l'entité");
    console.dir({ siret, nombreDHomologations });
  }

  async consigneNombreDeServicesEnProprietaire(
    email: string,
    nombreDeServicesEnProprietaire: number
  ): Promise<void> {
    console.log('📝 [REPORTING CRM] Nombre de services en propriétaire');
    console.dir({ email, nombreDeServicesEnProprietaire });
  }

  async historiseNombreDeServices(
    siret: string,
    nbServiceADate: number
  ): Promise<void> {
    console.log('📝 [REPORTING CRM] Nouveau nombre de services');
    console.dir({ siret, nbServiceADate });
  }
}
