import { DepotDonneesSuperviseursOO } from '../../src/depots/depotDonneesSuperviseursOO.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Superviseur from '../../src/modeles/superviseur.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe('Le dépôt de données OO des superviseurs', () => {
  const idSuperviseur = unUUID('S');

  describe("sur demande de lecture d'un superviseur", () => {
    it('peut lire un superviseur via son ID', async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteSuperviseurSurPerimetre(idSuperviseur, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesSuperviseursOO({ persistance });

      const superviseur = await depot.lisSuperviseur(idSuperviseur);

      expect(superviseur).toBeInstanceOf(Superviseur);
      expect(superviseur!.donnees().idUtilisateur).toBe(idSuperviseur);
    });

    it("ne retourne rien si l'utilisateur demandé n'est pas superviseur", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesSuperviseursOO({
        persistance: persistanceVide,
      });

      const superviseur = await depot.lisSuperviseur(unUUID('X'));

      expect(superviseur).toBeUndefined();
    });
  });
});
