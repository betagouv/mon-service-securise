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
        servicesParType: expect.any(Object),
        servicesParNiveauSecurite: expect.any(Object),
        evolutionNombreServices: expect.any(Object),
        evolutionNombreOrganisations: expect.any(Object),
      });
    });
  });
});
