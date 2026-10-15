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

  private entetes() {
    return {
      Authorization: `Bearer ${this.cleApi}`,
      'Content-Type': 'application/json',
    };
  }

  private async recupere(chemin: string, filtre: string) {
    return axios.get(new URL(chemin, this.urlCrm).toString(), {
      headers: this.entetes(),
      params: { filter: filtre },
    });
  }

  private async poste(chemin: string, corps: object) {
    return axios.post(new URL(chemin, this.urlCrm).toString(), corps, {
      headers: this.entetes(),
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
    const idExistant = await this.idEntiteExistante(entite.siret);
    if (idExistant) return idExistant;

    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.poste('/rest/donneesMssEntitesUtilisatricess', {
      name: entite.nom,
      siret: entite.siret,
    });
    return reponse.data.data.createDonneesMssEntitesUtilisatrices.id;
  }

  private async idEntiteExistante(
    siret: string
  ): Promise<IdEntiteCRM | undefined> {
    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.recupere(
      '/rest/donneesMssEntitesUtilisatricess',
      `siret[eq]:"${siret}"`
    );
    const [entiteExistante] = reponse.data.data.donneesMssEntitesUtilisatricess;
    return entiteExistante?.id;
  }

  // eslint-disable-next-line class-methods-use-this
  async consigneUtilisateur(): Promise<void> {
    throw new Error('Non implémenté');
  }
}
