import Service from '../modeles/service.js';
import { NiveauSecurite } from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';

export interface LecteurServices {
  servicesDeUtilisateur(idUtilisateur: UUID): Promise<Array<Service>>;
}

export class AdaptateurStatistiquesAdmin {
  constructor(private readonly lecteurServices: LecteurServices) {}

  async servicesParNiveauSecurite(
    idUtilisateur: UUID
  ): Promise<Partial<Record<NiveauSecurite, number>>> {
    const services =
      await this.lecteurServices.servicesDeUtilisateur(idUtilisateur);

    const parNiveau = Object.groupBy(
      services,
      (s) => s.descriptionService.niveauSecurite
    );

    return Object.fromEntries(
      Object.entries(parNiveau).map(([niveau, servicesParNiveau]) => [
        niveau as NiveauSecurite,
        servicesParNiveau.length,
      ])
    );
  }
}
