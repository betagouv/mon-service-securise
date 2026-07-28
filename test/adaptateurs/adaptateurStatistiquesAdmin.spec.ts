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

const unLecteurDeServices = (services: Array<Service>): LecteurServices => ({
  servicesDeUtilisateur: async () => services,
});

describe("L'adaptateur des statistiques admin", () => {
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
        ])
      );

      const resultat =
        await adaptateur.servicesParNiveauSecurite(unUUIDRandom());

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
        ])
      );

      const resultat =
        await adaptateur.servicesParNiveauSecurite(unUUIDRandom());

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
        ])
      );

      const resultat = await adaptateur.servicesParType(unUUIDRandom());

      expect(resultat).toEqual({
        serviceEnLigne: 1,
        api: 2,
        applicationMobile: 1,
      });
    });
  });
});
