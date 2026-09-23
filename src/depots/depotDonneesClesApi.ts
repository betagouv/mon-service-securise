import { UUID } from '../typesBasiques.js';
import { CleApi, DonneesCleApi } from '../modeles/cleApi.js';
import { ErreurCleApiInexistante } from '../erreurs.js';
import BusEvenements from '../bus/busEvenements.js';
import { EvenementCleApiCreee } from '../bus/evenementCleApiCreee.js';
import { EvenementCleApiRevoquee } from '../bus/evenementCleApiRevoquee.js';

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
  private readonly busEvenements: BusEvenements;

  constructor({
    adaptateurPersistanceTS,
    adaptateurChiffrement,
    busEvenements,
  }: {
    adaptateurPersistanceTS: PersistanceClesApi;
    adaptateurChiffrement: ChiffrementPourClesApi;
    busEvenements: BusEvenements;
  }) {
    this.persistance = adaptateurPersistanceTS;
    this.chiffrement = adaptateurChiffrement;
    this.busEvenements = busEvenements;
  }

  async nouvelleCle(idUtilisateur: UUID, dureeValiditeEnJours: number) {
    const { cle, valeurEnClair } = CleApi.nouvelle(
      idUtilisateur,
      dureeValiditeEnJours,
      (valeur) => this.empreinteDe(valeur)
    );

    await this.persistance.sauvegardeCleApi(cle.donnees());

    await this.busEvenements.publie(
      new EvenementCleApiCreee({ cle, dureeValiditeEnJours })
    );

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

    await this.busEvenements.publie(new EvenementCleApiRevoquee({ cle }));
  }

  private empreinteDe(valeurEnClair: string) {
    return this.chiffrement.hacheSha256(valeurEnClair);
  }
}
