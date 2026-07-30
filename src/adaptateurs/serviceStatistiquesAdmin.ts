import Service from '../modeles/service.js';
import {
  NiveauSecurite,
  TypeDeService,
} from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';
import { IdTypeService } from '../referentiel.types.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';

export interface LecteurServices {
  servicesDeUtilisateur(idUtilisateur: UUID): Promise<Array<Service>>;
}

type FiltresStatistiques = {
  filtreNiveauxSecurite: Array<NiveauSecurite>;
  filtreEntites: Array<string>;
};

export class ServiceStatistiquesAdmin {
  constructor(
    private readonly lecteurServices: LecteurServices,
    private readonly adaptateurChiffrement: AdaptateurChiffrement,
    private readonly adaptateurJournalMSS: AdaptateurJournalMSS
  ) {}

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

  private async evolutionNombreServices(services: Array<Service>) {
    const idsHaches = services.map((s) =>
      this.adaptateurChiffrement.hacheSha256(s.id)
    );

    return this.adaptateurJournalMSS.evolutionNombreServices(idsHaches);
  }

  private async evolutionNombreOrganisations(services: Array<Service>) {
    return this.adaptateurJournalMSS.evolutionNombreOrganisations(
      services.map((s) => ({
        idServiceHache: this.adaptateurChiffrement.hacheSha256(s.id),
        siretHache: this.adaptateurChiffrement.hacheSha256(
          s.siretDeOrganisation()
        ),
      }))
    );
  }

  private static filtre(
    services: Array<Service>,
    { filtreNiveauxSecurite, filtreEntites }: FiltresStatistiques
  ) {
    const estRetenu = (valeur: string, filtre: Array<string>) =>
      filtre.length === 0 || filtre.includes(valeur);

    return services.filter(
      (s) =>
        estRetenu(s.descriptionService.niveauSecurite, filtreNiveauxSecurite) &&
        estRetenu(s.siretDeOrganisation(), filtreEntites)
    );
  }

  async statistiques(idUtilisateur: UUID, filtres: FiltresStatistiques) {
    const services = ServiceStatistiquesAdmin.filtre(
      await this.lecteurServices.servicesDeUtilisateur(idUtilisateur),
      filtres
    );

    return {
      servicesParType: await ServiceStatistiquesAdmin.servicesParType(services),
      servicesParNiveauSecurite:
        await ServiceStatistiquesAdmin.servicesParNiveauSecurite(services),
      evolutionNombreServices: await this.evolutionNombreServices(services),
      evolutionNombreOrganisations:
        await this.evolutionNombreOrganisations(services),
    };
  }
}
