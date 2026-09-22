import { randomBytes } from 'node:crypto';
import { UUID } from '../typesBasiques.js';

export type DonneesCleApi = {
  id: UUID;
  idUtilisateur: UUID;
  prefixe: string;
  empreinte: string;
  dateCreation: Date;
  dateExpiration: Date;
  dateRevocation?: Date;
};

export type Hacheur = (valeurEnClair: string) => string;

export class CleApi {
  private constructor(private readonly donneesCle: DonneesCleApi) {}

  static nouvelle(
    idUtilisateur: UUID,
    dureeValiditeEnJours: number,
    hache: Hacheur
  ) {
    const prefixe = randomBytes(4).toString('hex');
    const secret = randomBytes(32).toString('base64url');
    const valeurEnClair = `mss_live_${prefixe}_${secret}`;

    const dateCreation = new Date();
    const dateExpiration = new Date(dateCreation);
    dateExpiration.setDate(dateExpiration.getDate() + dureeValiditeEnJours);

    const cle = new CleApi({
      id: crypto.randomUUID(),
      idUtilisateur,
      prefixe,
      empreinte: hache(valeurEnClair),
      dateCreation,
      dateExpiration,
    });

    return { cle, valeurEnClair };
  }

  static hydrate(donnees: DonneesCleApi) {
    return new CleApi(donnees);
  }

  estRevoquee() {
    return this.donneesCle.dateRevocation !== undefined;
  }

  estExpiree(aLaDate: Date = new Date()) {
    return aLaDate >= this.donneesCle.dateExpiration;
  }

  revoque(date: Date) {
    if (this.estRevoquee()) return;

    this.donneesCle.dateRevocation = date;
  }

  donnees(): DonneesCleApi {
    return this.donneesCle;
  }
}
