import Service from '../modeles/service.js';
import {
  NiveauSecurite,
  TypeDeService,
} from '../../donneesReferentielMesuresV2.js';
import { UUID } from '../typesBasiques.js';
import { IdCategorieMesure, IdTypeService } from '../referentiel.types.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';
import Dossiers from '../modeles/dossiers.js';
import Dossier from '../modeles/dossier.js';
import { StatutMesure } from '../modeles/mesure.js';
import { TousReferentiels } from '../referentiel.interface.js';

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

const TRANCHES_COMPLETUDE_MESURES = [
  '< 25%',
  '< 50%',
  '< 75%',
  '≤ 100%',
] as const;
type TrancheCompletudeMesures = (typeof TRANCHES_COMPLETUDE_MESURES)[number];

const TRANCHES_DATE_DERNIERE_MODIFICATION = [
  '< 1 mois',
  '< 6 mois',
  '< 1 an',
  '≥ 1 an',
] as const;
type TrancheDateDerniereModification =
  (typeof TRANCHES_DATE_DERNIERE_MODIFICATION)[number];

type CleMoisAnnee = `${number}-${number}`;

const moisAvecRemplissage = (date: Date) =>
  String(date.getMonth() + 1).padStart(2, '0');

export class ServiceStatistiquesAdmin {
  constructor(
    private readonly adaptateurChiffrement: AdaptateurChiffrement,
    private readonly adaptateurJournalMSS: AdaptateurJournalMSS,
    private readonly referentiel: TousReferentiels
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

  private static trancheCompletudeMesures(completudeMesure: {
    nombreTotalMesures: number;
    nombreMesuresCompletes: number;
  }): TrancheCompletudeMesures {
    const pourcentage =
      completudeMesure.nombreMesuresCompletes /
      completudeMesure.nombreTotalMesures;
    if (pourcentage < 0.25) return '< 25%';
    if (pourcentage < 0.5) return '< 50%';
    if (pourcentage < 0.75) return '< 75%';
    return '≤ 100%';
  }

  private static servicesParTrancheCompletudeMesures(
    services: Array<Service>
  ): Record<TrancheCompletudeMesures, number> {
    const tranchesVides = Object.fromEntries(
      TRANCHES_COMPLETUDE_MESURES.map((tranche) => [tranche, 0])
    ) as Record<TrancheCompletudeMesures, number>;

    return services.reduce((repartition, s) => {
      const tranche = ServiceStatistiquesAdmin.trancheCompletudeMesures(
        s.completudeMesures()
      );
      // eslint-disable-next-line no-param-reassign
      repartition[tranche] += 1;
      return repartition;
    }, tranchesVides);
  }

  private nombreMesuresParStatutEtCategorie(
    services: Array<Service>
  ): Record<IdCategorieMesure, Record<StatutMesure, number>> {
    const categories = this.referentiel.identifiantsCategoriesMesures();
    const statuts = this.referentiel.identifiantsStatutsMesures();

    const repartitionVide = Object.fromEntries(
      categories.map((categorie) => [
        categorie,
        Object.fromEntries(statuts.map((statut) => [statut, 0])),
      ])
    ) as Record<IdCategorieMesure, Record<StatutMesure, number>>;

    return services.reduce((repartition, service) => {
      const mesuresParStatutEtCategorie = service.mesuresParStatutEtCategorie();
      Object.entries(mesuresParStatutEtCategorie).forEach(
        ([statut, mesuresParCategorie]) => {
          Object.entries(mesuresParCategorie).forEach(
            ([categorie, mesures]) => {
              // eslint-disable-next-line no-param-reassign
              repartition[categorie as IdCategorieMesure][
                statut as StatutMesure
              ] += mesures.length;
            }
          );
        }
      );
      return repartition;
    }, repartitionVide);
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

  private static trancheDateDerniereModification(
    date: Date
  ): TrancheDateDerniereModification {
    const ilYA1Mois = new Date();
    ilYA1Mois.setMonth(ilYA1Mois.getMonth() - 1);
    if (date > ilYA1Mois) return '< 1 mois';

    const ilYA6Mois = new Date();
    ilYA6Mois.setMonth(ilYA6Mois.getMonth() - 6);
    if (date > ilYA6Mois) return '< 6 mois';

    const ilYA12Mois = new Date();
    ilYA12Mois.setMonth(ilYA12Mois.getMonth() - 12);
    if (date > ilYA12Mois) return '< 1 an';

    return '≥ 1 an';
  }

  private async servicesParTrancheDateDerniereModification(
    services: Service[]
  ) {
    const idsHaches = services.map((s) =>
      this.adaptateurChiffrement.hacheSha256(s.id)
    );

    const toutesDates =
      await this.adaptateurJournalMSS.dateDerniereMiseAJourServices(idsHaches);

    const tranchesVides = Object.fromEntries(
      TRANCHES_DATE_DERNIERE_MODIFICATION.map((tranche) => [tranche, 0])
    ) as Record<TrancheDateDerniereModification, number>;

    return toutesDates.reduce((repartition, d) => {
      const tranche =
        ServiceStatistiquesAdmin.trancheDateDerniereModification(d);
      // eslint-disable-next-line no-param-reassign
      repartition[tranche] += 1;
      return repartition;
    }, tranchesVides);
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

  async statistiques(services: Array<Service>, filtres: FiltresStatistiques) {
    const servicesFiltres = ServiceStatistiquesAdmin.filtre(services, filtres);

    return {
      servicesParType:
        ServiceStatistiquesAdmin.servicesParType(servicesFiltres),
      servicesParNiveauSecurite:
        ServiceStatistiquesAdmin.servicesParNiveauSecurite(servicesFiltres),
      evolutionNombreServices:
        await this.evolutionNombreServices(servicesFiltres),
      evolutionNombreOrganisations:
        await this.evolutionNombreOrganisations(servicesFiltres),
      indiceCyberMoyen:
        ServiceStatistiquesAdmin.indiceCyberMoyen(servicesFiltres),
      servicesParTrancheIndiceCyber:
        ServiceStatistiquesAdmin.servicesParTrancheIndiceCyber(servicesFiltres),
      nombreServicesHomologues:
        ServiceStatistiquesAdmin.nombreServicesHomologues(servicesFiltres),
      evolutionNombreHomologations:
        ServiceStatistiquesAdmin.evolutionNombreHomologations(servicesFiltres),
      servicesParTrancheExpirationHomologation:
        ServiceStatistiquesAdmin.servicesParTrancheExpirationHomologation(
          servicesFiltres
        ),
      nombreServicesCompletudeSuperieur80:
        ServiceStatistiquesAdmin.nombreServicesCompletudeSuperieur80(
          servicesFiltres
        ),
      servicesParTrancheCompletudeMesures:
        ServiceStatistiquesAdmin.servicesParTrancheCompletudeMesures(
          servicesFiltres
        ),
      nombreMesuresParStatutEtCategorie:
        this.nombreMesuresParStatutEtCategorie(servicesFiltres),
      servicesParTrancheDateDerniereModification:
        await this.servicesParTrancheDateDerniereModification(servicesFiltres),
    };
  }
}
