import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../modeles/entite.js';

/* eslint-disable no-console */

export class AdaptateurReportingCrmMemoire implements AdaptateurReportingCrm {
  // eslint-disable-next-line class-methods-use-this
  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    console.log('📝 [REPORTING CRM] Import en masse');
    console.dir(data);
  }

  // eslint-disable-next-line class-methods-use-this
  async consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM> {
    const idEntite = crypto.randomUUID();
    console.log('📝 [REPORTING CRM] Entité utilisatrice', idEntite);
    console.dir(entite);
    return idEntite;
  }

  // eslint-disable-next-line class-methods-use-this
  async consigneUtilisateur(
    email: string,
    idEntite?: IdEntiteCRM
  ): Promise<void> {
    console.log('📝 [REPORTING CRM] Utilisateur');
    console.dir({ email, idEntite });
  }

  // eslint-disable-next-line class-methods-use-this
  async consigneNombreDeServicesDeLEntite(
    siret: string,
    nombreDeServices: number
  ): Promise<void> {
    console.log("📝 [REPORTING CRM] Nombre de services de l'entité");
    console.dir({ siret, nombreDeServices });
  }
}
