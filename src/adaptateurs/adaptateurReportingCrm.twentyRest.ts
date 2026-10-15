/* eslint-disable max-classes-per-file */
import axios from 'axios';
import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../modeles/entite.js';

class ClientHttpCrm {
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

  private url = (chemin: string) => new URL(chemin, this.urlCrm).toString();

  private entetes = () => ({
    Authorization: `Bearer ${this.cleApi}`,
    'Content-Type': 'application/json',
  });

  get = (chemin: string, filtre: string) =>
    axios.get(this.url(chemin), {
      headers: this.entetes(),
      params: { filter: filtre },
    });

  post = (chemin: string, corps: object) =>
    axios.post(this.url(chemin), corps, { headers: this.entetes() });
}

export class AdaptateurReportingCrmTwentyRest implements AdaptateurReportingCrm {
  private readonly client: ClientHttpCrm;

  constructor(cleApi: string, urlCrm: URL) {
    this.client = new ClientHttpCrm(cleApi, urlCrm);
  }

  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    // Oui, il y a bien 2 "s" à la fin
    await this.client.post('/rest/donneesMssImportsDeServicess', {
      name: data.emailUtilisateur,
      nombreDeServices: data.nbServices,
    });
  }

  async consigneEntiteUtilisatrice(entite: Entite): Promise<IdEntiteCRM> {
    const idExistant = await this.idEntiteExistante(entite.siret);
    if (idExistant) return idExistant;

    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.client.post(
      '/rest/donneesMssEntitesUtilisatricess',
      { name: entite.nom, siret: entite.siret }
    );
    return reponse.data.data.createDonneesMssEntitesUtilisatrices.id;
  }

  private async idEntiteExistante(
    siret: string
  ): Promise<IdEntiteCRM | undefined> {
    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.client.get(
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
