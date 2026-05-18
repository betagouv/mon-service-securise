import { DepotDonneesAdminsOrganisationsOO } from '../../src/depots/depotDonneesAdminsOrganisationsOO.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { AdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe("Le dépôt de données « mode OO » des adminitrateurs d'organisations", () => {
  describe("sur demande de lecture d'un admin", () => {
    it('peut lire un admin via son ID', async () => {
      const idAdmin = unUUID('A');
      const persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesAdminsOrganisationsOO({ persistance });

      const admin = await depot.lisAdminOrganisations(idAdmin);

      expect(admin).toBeInstanceOf(AdminOrganisations);
      expect(admin!.donnees().idUtilisateur).toBe(idAdmin);
    });

    it("ne retourne rien si l'utilisateur demandé n'est pas admin : on ne veut pas instancier d'admin via le dépôt par mégarde", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesAdminsOrganisationsOO({
        persistance: persistanceVide,
      });

      const admin = await depot.lisAdminOrganisations(unUUID('X'));

      expect(admin).toBeUndefined();
    });
  });

  it("peut lire les admins d'une entité", async () => {
    const persistance = unePersistanceMemoireTS()
      .ajouteAdminSurPerimetre(unUUID('A1'), [{ siret: 'siret-A' }])
      .ajouteAdminSurPerimetre(unUUID('A2'), [{ siret: 'siret-B' }])
      .ajouteAdminSurPerimetre(unUUID('A3'), [
        { siret: 'siret-B' },
        { siret: 'siret-A' },
      ])
      .construis();
    const depot = new DepotDonneesAdminsOrganisationsOO({ persistance });

    const admins = await depot.lisAdminsPour('siret-A');

    expect(admins).toHaveLength(2);
    expect(admins[0]).toBeInstanceOf(AdminOrganisations);
    expect(admins[0].donnees().idUtilisateur).toBe(unUUID('A1'));
    expect(admins[1]).toBeInstanceOf(AdminOrganisations);
    expect(admins[1].donnees().idUtilisateur).toBe(unUUID('A3'));
  });
});
