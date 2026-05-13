import { DepotDonneesAdminsOrganisationsOO } from '../../src/depots/depotDonneesAdminsOrganisationsOO.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { AdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe("Le dépôt de données « mode OO » des adminitrateurs d'organisations", () => {
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
