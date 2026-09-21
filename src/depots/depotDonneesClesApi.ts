import { UUID } from '../typesBasiques.js';
import { CleApi, DonneesCleApi } from '../modeles/cleApi.js';
import { ErreurCleApiInexistante } from '../erreurs.js';

export type PersistanceClesApi = {
  lisClesApiDe(idUtilisateur: UUID): Promise<DonneesCleApi[]>;
  lisCleApiParEmpreinte(empreinte: string): Promise<DonneesCleApi | undefined>;
  sauvegardeCleApi(donnees: DonneesCleApi): Promise<void>;
};

type ChiffrementPourClesApi = {
  hacheSha256: (chaine: string) => string;
};

export class DepotDonneesClesApi {
  private readonly persistance: PersistanceClesApi;
  private readonly chiffrement: ChiffrementPourClesApi;

  constructor({
    adaptateurPersistanceTS,
    adaptateurChiffrement,
  }: {
    adaptateurPersistanceTS: PersistanceClesApi;
    adaptateurChiffrement: ChiffrementPourClesApi;
  }) {
    this.persistance = adaptateurPersistanceTS;
    this.chiffrement = adaptateurChiffrement;
  }

  async nouvelleCle(idUtilisateur: UUID) {
    const { cle, valeurEnClair } = CleApi.nouvelle(idUtilisateur, (valeur) =>
      this.empreinteDe(valeur)
    );

    await this.persistance.sauvegardeCleApi(cle.donnees());

    return { cle, valeurEnClair };
  }

  async lisClesDe(idUtilisateur: UUID) {
    const donnees = await this.persistance.lisClesApiDe(idUtilisateur);
    return donnees.map((d) => CleApi.hydrate(d));
  }

  async lisCleParValeur(valeurEnClair: string) {
    const donnees = await this.persistance.lisCleApiParEmpreinte(
      this.empreinteDe(valeurEnClair)
    );
    if (!donnees) return undefined;

    return CleApi.hydrate(donnees);
  }

  async revoqueCle(idCle: UUID, idUtilisateur: UUID) {
    const clesDeLUtilisateur = await this.lisClesDe(idUtilisateur);
    const cle = clesDeLUtilisateur.find((c) => c.donnees().id === idCle);
    if (!cle) throw new ErreurCleApiInexistante();

    cle.revoque(new Date());

    await this.persistance.sauvegardeCleApi(cle.donnees());
  }

  private empreinteDe(valeurEnClair: string) {
    return this.chiffrement.hacheSha256(valeurEnClair);
  }
}
