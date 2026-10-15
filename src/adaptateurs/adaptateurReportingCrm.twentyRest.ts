import axios from 'axios';
import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../modeles/entite.js';

export class AdaptateurReportingCrmTwentyRest implements AdaptateurReportingCrm {
  constructor(
    private readonly cleApi: string,
    private readonly urlCrm: URL
  ) {
    if (!cleApi) {
      throw new Error("Impossible de démarrer sans clé d'API du CRM Twenty");
    }
    if (!urlCrm) {
      throw new Error("Impossible de démarrer sans l'URL du CRM Twenty");
    }
  }

  private async poste(chemin: string, corps: object) {
    return axios.post(new URL(chemin, this.urlCrm).toString(), corps, {
      headers: {
        Authorization: `Bearer ${this.cleApi}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    // Oui, il y a bien 2 "s" à la fin
    await this.poste('/rest/donneesMssImportsDeServicess', {
      name: data.emailUtilisateur,
      nombreDeServices: data.nbServices,
    });
  }

  async consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM> {
    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.poste('/rest/donneesMssEntitesUtilisatricess', {
      name: entite.nom,
      siret: entite.siret,
    });
    return reponse.data.data.createDonneesMssEntitesUtilisatrices.id;
  }

  // eslint-disable-next-line class-methods-use-this
  async consigneUtilisateur(): Promise<void> {
    throw new Error('Non implémenté');
  }
}
