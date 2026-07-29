import {
  AdaptateurStatistiquesAdmin,
  LecteurServices,
} from '../../src/adaptateurs/adaptateurStatistiquesAdmin.ts';
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
      const adaptateur = new AdaptateurStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeNiveau('niveau1'),
          unServiceDeNiveau('niveau2'),
          unServiceDeNiveau('niveau2'),
          unServiceDeNiveau('niveau3'),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (await adaptateur.statistiques(unUUIDRandom()))
        .servicesParNiveauSecurite;

      expect(resultat).toEqual({
        niveau1: 1,
        niveau2: 2,
        niveau3: 1,
      });
    });

    it('ne prend pas en compte les niveaux inexistants', async () => {
      const adaptateur = new AdaptateurStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeNiveau('niveau1'),
          unServiceDeNiveau('niveau3'),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (await adaptateur.statistiques(unUUIDRandom()))
        .servicesParNiveauSecurite;

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
      const adaptateur = new AdaptateurStatistiquesAdmin(
        unLecteurDeServices([
          unServiceDeType(['serviceEnLigne', 'api']),
          unServiceDeType(['api']),
          unServiceDeType(['applicationMobile']),
        ]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = (await adaptateur.statistiques(unUUIDRandom()))
        .servicesParType;

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
    const adaptateur = new AdaptateurStatistiquesAdmin(
      unLecteurDeServices([]),
      adaptateurChiffrement,
      adaptateurJournal
    );

    const resultat = (await adaptateur.statistiques(unUUIDRandom()))
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
    const adaptateur = new AdaptateurStatistiquesAdmin(
      unLecteurDeServices([service]),
      adaptateurChiffrement,
      adaptateurJournal
    );

    const resultat = (await adaptateur.statistiques(unUUIDRandom()))
      .evolutionNombreOrganisations;

    expect(recu).toEqual([
      {
        idServiceHache: adaptateurChiffrement.hacheSha256(service.id),
        siretHache: adaptateurChiffrement.hacheSha256('13000766900018'),
      },
    ]);
    expect(resultat).toEqual([{ mois: '2026-01', total: 1 }]);
  });

  describe('sur demande de toutes les statistiques', () => {
    it('retourne toutes les statistiques', async () => {
      const adaptateur = new AdaptateurStatistiquesAdmin(
        unLecteurDeServices([]),
        adaptateurChiffrement,
        adaptateurJournal
      );

      const resultat = await adaptateur.statistiques(unUUIDRandom());

      expect(resultat).toEqual({
        servicesParType: expect.any(Object),
        servicesParNiveauSecurite: expect.any(Object),
        evolutionNombreServices: expect.any(Object),
        evolutionNombreOrganisations: expect.any(Object),
      });
    });
  });
});
