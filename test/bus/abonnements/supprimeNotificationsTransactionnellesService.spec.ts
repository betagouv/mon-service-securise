import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { supprimeNotificationsTransactionnelles } from '../../../src/bus/abonnements/supprimeNotificationsTransactionnellesService.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui supprime (en base de données) les notifications transactionnelles d'un service", () => {
  let depotDonnees: DepotDonnees;

  beforeEach(() => {
    depotDonnees = {
      supprimeNotificationsTransactionnellesDuService: async () => {},
    } as unknown as DepotDonnees;
  });

  it("lève une exception s'il ne reçoit pas l'ID du service", async () => {
    try {
      await supprimeNotificationsTransactionnelles({ depotDonnees })({
        // @ts-expect-error On force un paramètre vide
        idService: null,
      });
      expect.fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect((e as Error).message).toBe(
        "Impossible de supprimer les notifications transactionnelles d'un service sans avoir l'ID du service en paramètre."
      );
    }
  });

  it('demande au dépôt de supprimer les notifications transactionnelles pour ce service', async () => {
    let depotAppele = false;
    depotDonnees.supprimeNotificationsTransactionnellesDuService = async () => {
      depotAppele = true;
    };

    await supprimeNotificationsTransactionnelles({ depotDonnees })({
      idService: unUUIDRandom(),
    });

    expect(depotAppele).toBe(true);
  });
});
