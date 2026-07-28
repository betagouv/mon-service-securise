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

  async servicesParType(
    idUtilisateur: UUID
  ): Promise<Partial<Record<TypeDeService | IdTypeService, number>>> {
    const services =
      await this.lecteurServices.servicesDeUtilisateur(idUtilisateur);

    const tousTypes = services.flatMap((s) => s.descriptionService.typeService);
    const parType = Object.groupBy(tousTypes, (t) => t);

    return Object.fromEntries(
      Object.entries(parType).map(([type, occurencesParType]) => [
        type as TypeDeService | IdTypeService,
        occurencesParType.length,
      ])
    );
  }
}
