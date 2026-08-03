import {
  ServiceStatistiquesAdmin,
  LecteurServices,
} from '../../src/adaptateurs/serviceStatistiquesAdmin.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.ts';
import {
  NiveauSecurite,
  TypeDeService,
} from '../../donneesReferentielMesuresV2.ts';
import Service from '../../src/modeles/service.js';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import * as adaptateurJournalMemoire from '../../src/adaptateurs/adaptateurJournalMSSMemoire.ts';
import { AdaptateurJournalMSS } from '../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { unDossier } from '../constructeurs/constructeurDossier.ts';
import { creeReferentielV2 } from '../../src/referentielV2.ts';

const unLecteurDeServices = (services: Array<Service>): LecteurServices => ({
  servicesDeUtilisateur: async () => services,
});

const sansFiltre = { filtreNiveauxSecurite: [], filtreEntites: [] };

describe("L'adaptateur des statistiques admin", () => {
  let adaptateurJournal: AdaptateurJournalMSS;
  const adaptateurChiffrement = fauxAdaptateurChiffrement();

  beforeEach(() => {
    adaptateurJournal = adaptateurJournalMemoire.nouvelAdaptateur();
  });

  describe('sur demande de la repartition des services par niveau de sécurité', () => {
    const unServiceDeNiveau = (niveau: NiveauSecurite) =>
      unServiceV2()
        .avecDescription(
          uneDescriptionV2Valide()
            .avecNiveauSecurite(niveau)
            .donneesDescription()
        )
        .construis();

    it('retourne la répartition', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeNiveau('niveau1'),
          unServiceDeNiveau('niveau2'),
          unServiceDeNiveau('niveau2'),
          unServiceDeNiveau('niveau3'),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({
        niveau1: 1,
        niveau2: 2,
        niveau3: 1,
      });
    });

    it('ne prend pas en compte les niveaux inexistants', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeNiveau('niveau1'),
          unServiceDeNiveau('niveau3'),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({
        niveau1: 1,
        niveau3: 1,
      });
    });
  });

  describe('sur demande de la repartition des services par type de service', () => {
    const unServiceDeType = (types: TypeDeService[]) =>
      unServiceV2()
        .avecDescription(
          uneDescriptionV2Valide().avecTypesService(types).donneesDescription()
        )
        .construis();

    it('retourne la répartition', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeType(['serviceEnLigne', 'api']),
          unServiceDeType(['api']),
          unServiceDeType(['applicationMobile']),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParType;

      expect(resultat).toEqual({
        serviceEnLigne: 1,
        api: 2,
        applicationMobile: 1,
      });
    });
  });

  describe("sur demande de l'indice cyber moyen", () => {
    const unServiceAvecIndiceCyber = (indiceCyber: number) => {
      const s = unServiceV2().construis();
      s.indiceCyber = () => ({ total: indiceCyber });
      return s;
    };

    it('retourne la moyenne', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceAvecIndiceCyber(1),
          unServiceAvecIndiceCyber(3),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).indiceCyberMoyen;

      expect(resultat).toEqual(2);
    });

    it("reste robuste s'il n'y a aucun service", async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).indiceCyberMoyen;

      expect(resultat).toEqual(0);
    });
  });

  describe('sur demande de la répartition des indices cyber par tranche', () => {
    const unServiceAvecIndiceCyber = (indiceCyber: number) => {
      const s = unServiceV2().construis();
      s.indiceCyber = () => ({ total: indiceCyber });
      return s;
    };

    it('compte les services de chaque tranche', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceAvecIndiceCyber(0),
          unServiceAvecIndiceCyber(1.5),
          unServiceAvecIndiceCyber(2.5),
          unServiceAvecIndiceCyber(2.9),
          unServiceAvecIndiceCyber(3.2),
          unServiceAvecIndiceCyber(4.7),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParTrancheIndiceCyber;

      expect(resultat).toEqual({
        '< 1': 1,
        '< 2': 1,
        '< 3': 2,
        '< 4': 1,
        '≥ 4': 1,
      });
    });

    it('range chaque borne dans la tranche supérieure', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceAvecIndiceCyber(1),
          unServiceAvecIndiceCyber(2),
          unServiceAvecIndiceCyber(3),
          unServiceAvecIndiceCyber(4),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParTrancheIndiceCyber;

      expect(resultat).toEqual({
        '< 1': 0,
        '< 2': 1,
        '< 3': 1,
        '< 4': 1,
        '≥ 4': 1,
      });
    });

    it('conserve les tranches vides', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParTrancheIndiceCyber;

      expect(resultat).toEqual({
        '< 1': 0,
        '< 2': 0,
        '< 3': 0,
        '< 4': 0,
        '≥ 4': 0,
      });
    });
  });

  it("délègue à l'adaptateur journal le calcul de l'évolution du nombre de services", async () => {
    adaptateurJournal.evolutionNombreServices = async () => [
      { mois: '2026-01', total: 1 },
    ];
    const adaptateur = new ServiceStatistiquesAdmin(
      unLecteurDeServices([]),
      adaptateurChiffrement,
      adaptateurJournal
    );

    const resultat = (await adaptateur.statistiques(unUUIDRandom(), sansFiltre))
      .evolutionNombreServices;

    expect(resultat).toEqual([{ mois: '2026-01', total: 1 }]);
  });

  it("transmet au journal le SIRET haché de chaque service pour l'évolution du nombre d'organisations", async () => {
    let recu: Array<{ idServiceHache: string; siretHache: string }> = [];
    adaptateurJournal.evolutionNombreOrganisations = async (services) => {
      recu = services;
      return [{ mois: '2026-01', total: 1 }];
    };
    const service = unServiceV2()
      .avecDescription(
        uneDescriptionV2Valide()
          .avecOrganisationResponsable({ siret: '13000766900018' })
          .donneesDescription()
      )
      .construis();
    const adaptateur = new ServiceStatistiquesAdmin(
      unLecteurDeServices([service]),
      adaptateurChiffrement,
      adaptateurJournal
    );

    const resultat = (await adaptateur.statistiques(unUUIDRandom(), sansFiltre))
      .evolutionNombreOrganisations;

    expect(recu).toEqual([
      {
        idServiceHache: adaptateurChiffrement.hacheSha256(service.id),
        siretHache: adaptateurChiffrement.hacheSha256('13000766900018'),
      },
    ]);
    expect(resultat).toEqual([{ mois: '2026-01', total: 1 }]);
  });

  describe('sur demande de statistiques filtrées', () => {
    const unServiceDe = (niveau: NiveauSecurite, siret: string) =>
      unServiceV2()
        .avecDescription(
          uneDescriptionV2Valide()
            .avecNiveauSecurite(niveau)
            .avecOrganisationResponsable({ siret })
            .donneesDescription()
        )
        .construis();

    const adaptateurAvec = (services: Array<Service>) =>
      new ServiceStatistiquesAdmin(
        unLecteurDeServices(services),
        adaptateurChiffrement,
        adaptateurJournal
      );

    it('ne garde que les services des niveaux de sécurité demandés', async () => {
      const adaptateur = adaptateurAvec([
        unServiceDe('niveau1', '13000766900018'),
        unServiceDe('niveau2', '13000766900018'),
        unServiceDe('niveau3', '13000766900018'),
      ]);

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), {
          filtreNiveauxSecurite: ['niveau1', 'niveau3'],
          filtreEntites: [],
        })
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({ niveau1: 1, niveau3: 1 });
    });

    it('ne garde que les services des entités demandées', async () => {
      const adaptateur = adaptateurAvec([
        unServiceDe('niveau1', '13000766900018'),
        unServiceDe('niveau2', '92050000000009'),
      ]);

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), {
          filtreNiveauxSecurite: [],
          filtreEntites: ['92050000000009'],
        })
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({ niveau2: 1 });
    });

    it('combine les deux filtres', async () => {
      const adaptateur = adaptateurAvec([
        unServiceDe('niveau1', '13000766900018'),
        unServiceDe('niveau1', '92050000000009'),
        unServiceDe('niveau2', '92050000000009'),
      ]);

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), {
          filtreNiveauxSecurite: ['niveau1'],
          filtreEntites: ['92050000000009'],
        })
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({ niveau1: 1 });
    });

    it('ne filtre pas quand les filtres sont vides', async () => {
      const adaptateur = adaptateurAvec([
        unServiceDe('niveau1', '13000766900018'),
        unServiceDe('niveau2', '92050000000009'),
      ]);

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParNiveauSecurite;

      expect(resultat).toEqual({ niveau1: 1, niveau2: 1 });
    });

    it('ne transmet au journal que les services filtrés', async () => {
      let recus: Array<string> = [];
      adaptateurJournal.evolutionNombreServices = async (idsHaches) => {
        recus = idsHaches;
        return [];
      };
      const gardé = unServiceDe('niveau1', '13000766900018');
      const adaptateur = adaptateurAvec([
        gardé,
        unServiceDe('niveau2', '92050000000009'),
      ]);

      await adaptateur.statistiques(unUUIDRandom(), {
        filtreNiveauxSecurite: ['niveau1'],
        filtreEntites: [],
      });

      expect(recus).toEqual([adaptateurChiffrement.hacheSha256(gardé.id)]);
    });
  });

  const unServiceV2AvecDossierActif = () =>
    unServiceV2()
      .avecDossiers([
        unDossier(creeReferentielV2()).quiEstComplet().quiEstActif().donnees,
      ])
      .construis();

  const unServiceV2AvecDossierHomologueLe = (date: Date) =>
    unServiceV2()
      .avecDossiers([
        unDossier(creeReferentielV2())
          .quiEstComplet()
          .avecDateHomologation(date).donnees,
      ])
      .construis();

  const unServiceV2AvecDossierBientotExpire = () =>
    unServiceV2()
      .avecDossiers([
        unDossier(creeReferentielV2())
          .quiEstComplet()
          .quiVaExpirer(2, 'sixMois').donnees,
      ])
      .construis();

  const unServiceV2AvecDossierQuiExpireDans = (
    nombreMoisDiciExpiration: number
  ) =>
    unServiceV2()
      .avecDossiers([
        unDossier(creeReferentielV2())
          .quiEstComplet()
          .quiVaExpirer(nombreMoisDiciExpiration * 30, 'unAn').donnees,
      ])
      .construis();

  describe('sur demande du nombre de services homologués', async () => {
    it('retourne la valeur', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceV2AvecDossierActif(),
          unServiceV2AvecDossierBientotExpire(),
          unServiceV2().construis(),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = await adaptateur.statistiques(
        unUUIDRandom(),
        sansFiltre
      );

      expect(resultat.nombreServicesHomologues).toEqual(2);
    });
  });

  const moisAvecRemplissage = (date: Date) =>
    String(date.getMonth() + 1).padStart(2, '0');

  describe("sur demande de l'évolution du nombre d'homologations", async () => {
    it("cumule les dates d'homologation des dossiers de chaque service", async () => {
      const aujourdhui = new Date();
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceV2AvecDossierHomologueLe(aujourdhui),
          unServiceV2AvecDossierHomologueLe(aujourdhui),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = await adaptateur.statistiques(
        unUUIDRandom(),
        sansFiltre
      );

      expect(resultat.evolutionNombreHomologations).toEqual([
        {
          mois: `${aujourdhui.getFullYear()}-${moisAvecRemplissage(aujourdhui)}`,
          total: 2,
        },
      ]);
    });

    it('génère les mois sans nouveau dossier entre deux dates avec dossier', async () => {
      const aujourdhui = new Date();
      const ilYA1Mois = new Date();
      ilYA1Mois.setMonth(ilYA1Mois.getMonth() - 1);
      const ilYA2Mois = new Date();
      ilYA2Mois.setMonth(ilYA2Mois.getMonth() - 2);
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceV2AvecDossierHomologueLe(aujourdhui),
          unServiceV2AvecDossierHomologueLe(ilYA2Mois),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = await adaptateur.statistiques(
        unUUIDRandom(),
        sansFiltre
      );

      expect(resultat.evolutionNombreHomologations).toEqual([
        {
          mois: `${ilYA2Mois.getFullYear()}-${moisAvecRemplissage(ilYA2Mois)}`,
          total: 1,
        },
        {
          mois: `${ilYA1Mois.getFullYear()}-${moisAvecRemplissage(ilYA1Mois)}`,
          total: 1,
        },
        {
          mois: `${aujourdhui.getFullYear()}-${moisAvecRemplissage(aujourdhui)}`,
          total: 2,
        },
      ]);
    });
  });

  describe("sur demande de la répartition des dates d'expiration d'homologation par tranche", () => {
    it('compte les services de chaque tranche', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([
          unServiceV2AvecDossierQuiExpireDans(-13),
          unServiceV2AvecDossierQuiExpireDans(1),
          unServiceV2AvecDossierQuiExpireDans(7),
          unServiceV2AvecDossierQuiExpireDans(13),
          unServiceV2AvecDossierQuiExpireDans(25),
          unServiceV2AvecDossierQuiExpireDans(37),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParTrancheExpirationHomologation;

      expect(resultat).toEqual({
        expire: 1,
        '< 6': 1,
        '< 12': 1,
        '< 24': 1,
        '< 36': 2,
      });
    });

    it('conserve les tranches vides', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (
        await adaptateur.statistiques(unUUIDRandom(), sansFiltre)
      ).servicesParTrancheExpirationHomologation;

      expect(resultat).toEqual({
        expire: 0,
        '< 6': 0,
        '< 12': 0,
        '< 24': 0,
        '< 36': 0,
      });
    });
  });

  describe('sur demande de toutes les statistiques', () => {
    it('retourne toutes les statistiques', async () => {
      const adaptateur = new ServiceStatistiquesAdmin(
        unLecteurDeServices([]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = await adaptateur.statistiques(
        unUUIDRandom(),
        sansFiltre
      );

      expect(resultat).toEqual({
        nombreServicesHomologues: expect.any(Number),
        evolutionNombreHomologations: expect.any(Array),
        servicesParType: expect.any(Object),
        servicesParNiveauSecurite: expect.any(Object),
        evolutionNombreServices: expect.any(Array),
        evolutionNombreOrganisations: expect.any(Array),
        indiceCyberMoyen: expect.any(Number),
        servicesParTrancheIndiceCyber: expect.any(Object),
        servicesParTrancheExpirationHomologation: expect.any(Object),
      });
    });
  });
});
