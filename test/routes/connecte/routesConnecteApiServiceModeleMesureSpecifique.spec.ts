import { unService } from '../../constructeurs/constructeurService.js';
import {
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
} from '../../../src/erreurs.ts';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe("Les routes d'API des modèles de mesures spécifiques associés aux services", () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête PUT sur `/api/service/:id/modeles/mesureSpecifique`', () => {
    beforeEach(() => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {};

      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('S1')
        .construis();

      testeur.middleware().reinitialise({
        idUtilisateur: 'U1',
        serviceARenvoyer,
      });
    });

    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/S1/modeles/mesureSpecifique',
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/S1/modeles/mesureSpecifique',
          }
        );
    });

    it('jette une erreur 400 si les ID de modèles de mesures sont invalides', async () => {
      const { status } = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique',
        { idsModeles: ['pasUnUUID'] }
      );

      expect(status).toBe(400);
    });

    it("délègue au dépôt de données l'association des modèles au service", async () => {
      let donnesRecues;
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService = async (
        idsModeles: UUID[],
        idService: UUID,
        idUtilisateur: UUID
      ) => {
        donnesRecues = { idsModeles, idService, idUtilisateur };
      };

      const deuxModeles = [unUUIDRandom(), unUUIDRandom()];
      await testeur.put('/api/service/S1/modeles/mesureSpecifique', {
        idsModeles: deuxModeles,
      });

      expect(donnesRecues!.idsModeles).toEqual(deuxModeles);
      expect(donnesRecues!.idService).toBe('S1');
      expect(donnesRecues!.idUtilisateur).toBe('U1');
    });

    it("jette une 403 si l'utilisateur ne possède pas un des modèles", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueIntrouvable('X');
        };

      const { status } = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique',
        { idsModeles: [unUUIDRandom()] }
      );

      expect(status).toBe(403);
    });

    it("jette une 403 si l'utilisateur ne peut pas modifier tous les services passés en paramètres", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
            unUUIDRandom(),
            [unUUIDRandom()],
            tousDroitsEnEcriture()
          );
        };

      const { status } = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique',
        { idsModeles: [unUUIDRandom()] }
      );

      expect(status).toBe(403);
    });

    it("jette une 400 si le service est déjà associé à l'un des modèles", async () => {
      testeur.depotDonnees().associeModelesMesureSpecifiqueAuService =
        async () => {
          throw new ErreurModeleDeMesureSpecifiqueDejaAssociee(
            unUUIDRandom(),
            unUUIDRandom()
          );
        };

      const { status } = await testeur.put(
        '/api/service/S1/modeles/mesureSpecifique',
        { idsModeles: [unUUIDRandom()] }
      );

      expect(status).toBe(400);
    });
  });
});
