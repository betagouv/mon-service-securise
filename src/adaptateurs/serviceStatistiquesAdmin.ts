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
import Dossier from '../modeles/dossier.js';

export interface LecteurServices {
  servicesDeUtilisateur(idUtilisateur: UUID): Promise<Array<Service>>;
}

type FiltresStatistiques = {
  filtreNiveauxSecurite: Array<NiveauSecurite>;
  filtreEntites: Array<string>;
};

const TRANCHES_INDICE_CYBER = ['< 1', '< 2', '< 3', '< 4', '≥ 4'] as const;
type TrancheIndiceCyber = (typeof TRANCHES_INDICE_CYBER)[number];

const TRANCHES_EXPIRATION_HOMOLOGATION = [
  'expire',
  '< 6',
  '< 12',
  '< 24',
  '< 36',
] as const;
type TrancheExpirationHomologation =
  (typeof TRANCHES_EXPIRATION_HOMOLOGATION)[number];

type CleMoisAnnee = `${number}-${number}`;

const moisAvecRemplissage = (date: Date) =>
  String(date.getMonth() + 1).padStart(2, '0');

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

  private static nombreServicesCompletudeSuperieur80(services: Service[]) {
    return services.filter((s) => {
      const completude = s.completudeMesures();

      return (
        completude.nombreMesuresCompletes / completude.nombreTotalMesures > 0.8
      );
    }).length;
  }

  private static clesMois(debut: Date, fin: Date): CleMoisAnnee[] {
    const cles: string[] = [];
    const curseur = new Date(debut.getFullYear(), debut.getMonth(), 1);
    const borne = new Date(fin.getFullYear(), fin.getMonth(), 1);

    while (curseur <= borne) {
      cles.push(`${curseur.getFullYear()}-${moisAvecRemplissage(curseur)}`);
      curseur.setMonth(curseur.getMonth() + 1);
    }
    return cles as CleMoisAnnee[];
  }

  private static evolutionNombreHomologations(services: Service[]) {
    const datesDhomologation = services
      .map((s) => s.dossiers.dossierActif()?.decision.dateHomologation)
      .filter(Boolean)
      .map((d) => new Date(d));
    const premiereHomologation = new Date(
      Math.min(...datesDhomologation.map((d) => d.getTime()))
    );
    const listeMoisAnnee = ServiceStatistiquesAdmin.clesMois(
      premiereHomologation,
      new Date()
    );
    const datesParMoisAnnee = Object.groupBy(
      datesDhomologation,
      (d) => `${d.getFullYear()}-${moisAvecRemplissage(d)}`
    );
    const nombreHomologueeParMoisAnnee = listeMoisAnnee.map((moisAnnee) => ({
      mois: moisAnnee,
      total: datesParMoisAnnee[moisAnnee]?.length || 0,
    }));

    return nombreHomologueeParMoisAnnee.reduce(
      (acc, { mois, total }) => {
        const precedent = acc.at(-1)?.total || 0;
        return [...acc, { mois, total: precedent + total }];
      },
      [] as Array<{ mois: CleMoisAnnee; total: number }>
    );
  }

  private static trancheExpirationHomologationDe(
    dossier: Dossier
  ): TrancheExpirationHomologation {
    if (dossier.estExpire()) return 'expire';

    const dateProchaineHomologation =
      dossier.decision.dateProchaineHomologation();
    const dans6Mois = new Date();
    dans6Mois.setMonth(dans6Mois.getMonth() + 6);
    if (dateProchaineHomologation < dans6Mois) return '< 6';

    const dans12Mois = new Date();
    dans12Mois.setMonth(dans12Mois.getMonth() + 12);
    if (dateProchaineHomologation < dans12Mois) return '< 12';

    const dans24Mois = new Date();
    dans24Mois.setMonth(dans24Mois.getMonth() + 24);
    if (dateProchaineHomologation < dans24Mois) return '< 24';

    return '< 36';
  }

  private static servicesParTrancheExpirationHomologation(
    services: Array<Service>
  ): Record<TrancheExpirationHomologation, number> {
    const tranchesVides = Object.fromEntries(
      TRANCHES_EXPIRATION_HOMOLOGATION.map((tranche) => [tranche, 0])
    ) as Record<TrancheExpirationHomologation, number>;

    return services
      .filter((s) => !!s.dossiers.dossierActif())
      .reduce((repartition, s) => {
        const tranche =
          ServiceStatistiquesAdmin.trancheExpirationHomologationDe(
            s.dossiers.dossierActif()
          );
        // eslint-disable-next-line no-param-reassign
        repartition[tranche] += 1;
        return repartition;
      }, tranchesVides);
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
      evolutionNombreHomologations:
        ServiceStatistiquesAdmin.evolutionNombreHomologations(services),
      servicesParTrancheExpirationHomologation:
        ServiceStatistiquesAdmin.servicesParTrancheExpirationHomologation(
          services
        ),
      nombreServicesCompletudeSuperieur80:
        ServiceStatistiquesAdmin.nombreServicesCompletudeSuperieur80(services),
    };
  }
}
