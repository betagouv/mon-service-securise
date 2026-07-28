import Service from '../modeles/service.js';
import {
  NiveauSecurite,
  TypeDeService,
} from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';
import { IdTypeService } from '../referentiel.types.js';

export interface LecteurServices {
  servicesDeUtilisateur(idUtilisateur: UUID): Promise<Array<Service>>;
}

export class AdaptateurStatistiquesAdmin {
  constructor(private readonly lecteurServices: LecteurServices) {}

  private static async servicesParNiveauSecurite(
    services: Array<Service>
  ): Promise<Partial<Record<NiveauSecurite, number>>> {
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

  private static async servicesParType(
    services: Array<Service>
  ): Promise<Partial<Record<TypeDeService | IdTypeService, number>>> {
    const tousTypes = services.flatMap((s) => s.descriptionService.typeService);
    const parType = Object.groupBy(tousTypes, (t) => t);

    return Object.fromEntries(
      Object.entries(parType).map(([type, occurencesParType]) => [
        type as TypeDeService | IdTypeService,
        occurencesParType.length,
      ])
    );
  }

  async statistiques(idUtilisateur: UUID) {
    const services =
      await this.lecteurServices.servicesDeUtilisateur(idUtilisateur);

    return {
      servicesParType:
        await AdaptateurStatistiquesAdmin.servicesParType(services),
      servicesParNiveauSecurite:
        await AdaptateurStatistiquesAdmin.servicesParNiveauSecurite(services),
    };
  }
}
