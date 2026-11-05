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

// Twenty refuse les requêtes qui manipulent plus de 60 enregistrements à la fois.
const TAILLE_MAX_LOT = 60;

const enLots = <T>(elements: T[]): T[][] =>
  Array.from({ length: Math.ceil(elements.length / TAILLE_MAX_LOT) }, (_, i) =>
    elements.slice(i * TAILLE_MAX_LOT, (i + 1) * TAILLE_MAX_LOT)
  );

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

  getBatch = <T>(
    chemin: string,
    valeurs: T[],
    paramsDuLot: (lot: T[]) => Record<string, string | number>
  ) =>
    Promise.all(
      enLots(valeurs).map((lot) =>
        this.get(chemin, { ...paramsDuLot(lot), limit: TAILLE_MAX_LOT })
      )
    );

  postBatch = (chemin: string, enregistrements: object[]) =>
    Promise.all(enLots(enregistrements).map((lot) => this.post(chemin, lot)));
}
