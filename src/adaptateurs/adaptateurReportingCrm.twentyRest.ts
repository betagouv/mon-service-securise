/* eslint-disable max-classes-per-file */
import axios, { AxiosResponse } from 'axios';
import { enCadence } from '../utilitaires/pThrottle.js';
import {
  AdaptateurReportingCrm,
  CrmImportEnMasse,
  IdEntiteCRM,
} from './adaptateurReportingCrm.interface.js';
import Entite from '../modeles/entite.js';
import { ErreurApiTwenty } from '../erreurs.js';

const rendsExplicite400 = (erreur: unknown): never => {
  if (axios.isAxiosError(erreur) && erreur.response?.status === 400) {
    throw new ErreurApiTwenty(
      erreur.config?.data,
      erreur.response.data?.messages,
      erreur
    );
  }
  throw erreur;
};

// Twenty accepte au plus 100 requêtes par minute : 1 requête toutes les 600 ms.
const INTERVALLE_ENTRE_REQUETES_EN_MS = 600;

export class ClientHttpCrm {
  private readonly cadence = enCadence(
    INTERVALLE_ENTRE_REQUETES_EN_MS,
    (requete: () => Promise<AxiosResponse>) => requete()
  );

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

  get = (chemin: string, params: Record<string, string | number>) =>
    this.cadence(() =>
      axios.get(this.url(chemin), { headers: this.entetes(), params })
    ).catch(rendsExplicite400);

  post = (chemin: string, corps: object) =>
    this.cadence(() =>
      axios.post(this.url(chemin), corps, { headers: this.entetes() })
    ).catch(rendsExplicite400);

  patch = (chemin: string, corps: object) =>
    this.cadence(() =>
      axios.patch(this.url(chemin), corps, { headers: this.entetes() })
    ).catch(rendsExplicite400);
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

  async consigneNombreDeServicesDeLEntite(
    siret: string,
    nombreDeServices: number
  ): Promise<void> {
    const idEntite = await this.idEntiteExistante(siret);
    if (!idEntite) return;

    // Oui, il y a bien 2 "s" à la fin
    await this.client.patch(
      `/rest/donneesMssEntitesUtilisatricess/${idEntite}`,
      { nombreDeServices }
    );
  }

  private async idEntiteExistante(
    siret: string
  ): Promise<IdEntiteCRM | undefined> {
    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.client.get(
      '/rest/donneesMssEntitesUtilisatricess',
      { filter: `siret[eq]:"${siret}"` }
    );
    const [entiteExistante] = reponse.data.data.donneesMssEntitesUtilisatricess;
    return entiteExistante?.id;
  }

  async consigneUtilisateur(
    email: string,
    idEntite?: IdEntiteCRM
  ): Promise<void> {
    if (await this.utilisateurExiste(email)) return;

    // Oui, il y a bien 2 "s" à la fin
    await this.client.post('/rest/donneesMssUtilisateursInscritss', {
      name: email,
      entiteId: idEntite,
    });
  }

  private async utilisateurExiste(email: string): Promise<boolean> {
    // Oui, il y a bien 2 "s" à la fin
    const reponse = await this.client.get(
      '/rest/donneesMssUtilisateursInscritss',
      { filter: `name[eq]:"${email}"` }
    );
    return reponse.data.data.donneesMssUtilisateursInscritss.length > 0;
  }
}
