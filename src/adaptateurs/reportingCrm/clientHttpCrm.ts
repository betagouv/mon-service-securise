import axios, { AxiosResponse } from 'axios';
import { ErreurApiTwenty } from '../../erreurs.js';
import { enCadence } from '../../utilitaires/pThrottle.js';

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
