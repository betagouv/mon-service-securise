import Service from '../modeles/service.js';
import {
  NiveauSecurite,
  TypeDeService,
} from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';
import { IdTypeService } from '../referentiel.types.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';
import Dossiers from '../modeles/dossiers.js';

export interface LecteurServices {
  servicesDeUtilisateur(idUtilisateur: UUID): Promise<Array<Service>>;
}

type FiltresStatistiques = {
  filtreNiveauxSecurite: Array<NiveauSecurite>;
  filtreEntites: Array<string>;
};

const TRANCHES_INDICE_CYBER = ['< 1', '< 2', '< 3', '< 4', '≥ 4'] as const;
type TrancheIndiceCyber = (typeof TRANCHES_INDICE_CYBER)[number];

export class ServiceStatistiquesAdmin {
  constructor(
    private readonly lecteurServices: LecteurServices,
    private readonly adaptateurChiffrement: AdaptateurChiffrement,
    private readonly adaptateurJournalMSS: AdaptateurJournalMSS
  ) {}

  private static servicesParNiveauSecurite(
    services: Array<Service>
  ): Partial<Record<NiveauSecurite, number>> {
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

  private static servicesParType(
    services: Array<Service>
  ): Partial<Record<TypeDeService | IdTypeService, number>> {
    const tousTypes = services.flatMap((s) => s.descriptionService.typeService);
    const parType = Object.groupBy(tousTypes, (t) => t);

    return Object.fromEntries(
      Object.entries(parType).map(([type, occurencesParType]) => [
        type as TypeDeService | IdTypeService,
        occurencesParType.length,
      ])
    );
  }

  private static indiceCyberMoyen(services: Service[]) {
    const indicesCyber = services.map((s) => s.indiceCyber().total);
    if (!indicesCyber.length) return 0;

    return indicesCyber.reduce((acc, i) => acc + i, 0) / indicesCyber.length;
  }

  private static trancheDe(indiceCyber: number): TrancheIndiceCyber {
    if (indiceCyber < 1) return '< 1';
    if (indiceCyber < 2) return '< 2';
    if (indiceCyber < 3) return '< 3';
    if (indiceCyber < 4) return '< 4';
    return '≥ 4';
  }

  private static servicesParTrancheIndiceCyber(
    services: Array<Service>
  ): Record<TrancheIndiceCyber, number> {
    const tranchesVides = Object.fromEntries(
      TRANCHES_INDICE_CYBER.map((tranche) => [tranche, 0])
    ) as Record<TrancheIndiceCyber, number>;

    return services.reduce((repartition, s) => {
      const tranche = ServiceStatistiquesAdmin.trancheDe(s.indiceCyber().total);
      // eslint-disable-next-line no-param-reassign
      repartition[tranche] += 1;
      return repartition;
    }, tranchesVides);
  }

  private static nombreServicesHomologues(services: Service[]) {
    return services.filter(
      (s) =>
        s.dossiers.statutHomologation() === Dossiers.ACTIVEE ||
        s.dossiers.statutHomologation() === Dossiers.BIENTOT_EXPIREE
    ).length;
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
      servicesParType: ServiceStatistiquesAdmin.servicesParType(services),
      servicesParNiveauSecurite:
        ServiceStatistiquesAdmin.servicesParNiveauSecurite(services),
      evolutionNombreServices: await this.evolutionNombreServices(services),
      evolutionNombreOrganisations:
        await this.evolutionNombreOrganisations(services),
      indiceCyberMoyen: ServiceStatistiquesAdmin.indiceCyberMoyen(services),
      servicesParTrancheIndiceCyber:
        ServiceStatistiquesAdmin.servicesParTrancheIndiceCyber(services),
      nombreServicesHomologues:
        ServiceStatistiquesAdmin.nombreServicesHomologues(services),
    };
  }
}
