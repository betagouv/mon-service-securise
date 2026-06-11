import { DepotDonneesAdminsOrganisations } from '../../src/depots/depotDonneesAdminsOrganisations.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { AdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';

describe("Le dépôt de données « mode OO » des adminitrateurs d'organisations", () => {
  const idAdmin = unUUID('A');

  describe("sur demande de lecture d'un admin", () => {
    it('peut lire un admin via son ID', async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesAdminsOrganisations({ persistance });

      const admin = await depot.lisAdminOrganisations(idAdmin);

      expect(admin).toBeInstanceOf(AdminOrganisations);
      expect(admin!.donnees().idUtilisateur).toBe(idAdmin);
    });

    it("ne retourne rien si l'utilisateur demandé n'est pas admin : on ne veut pas instancier d'admin via le dépôt par mégarde", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesAdminsOrganisations({
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
    const depot = new DepotDonneesAdminsOrganisations({ persistance });

    const admins = await depot.lisAdminsPour('siret-A');

    expect(admins).toHaveLength(2);
    expect(admins[0]).toBeInstanceOf(AdminOrganisations);
    expect(admins[0].donnees().idUtilisateur).toBe(unUUID('A1'));
    expect(admins[1]).toBeInstanceOf(AdminOrganisations);
    expect(admins[1].donnees().idUtilisateur).toBe(unUUID('A3'));
  });

  it('sauvegarde un admin', async () => {
    const persistance = unePersistanceMemoireTS()
      .ajouteAdminSurPerimetre(idAdmin, [
        { siret: 'siret-B' },
        { siret: 'siret-A' },
      ])
      .construis();
    const depot = new DepotDonneesAdminsOrganisations({ persistance });
    const admin = AdminOrganisations.hydrate({
      idUtilisateur: idAdmin,
      entitesAdministrees: [{ siret: 'siret-B' }, { siret: 'siret-C' }],
    });

    await depot.sauvegardeAdminOrganisations(admin);

    const adminSauvegarde = await depot.lisAdminOrganisations(idAdmin);
    expect(adminSauvegarde!.donnees().idUtilisateur).toBe(unUUID('A'));
    expect(adminSauvegarde!.donnees().entitesAdministrees).toHaveLength(2);
    expect(adminSauvegarde!.donnees().entitesAdministrees[0]).toEqual({
      siret: 'siret-B',
    });
    expect(adminSauvegarde!.donnees().entitesAdministrees[1]).toEqual({
      siret: 'siret-C',
    });
  });

  describe("sur demande de vérification qu'un utilisateur est admin", () => {
    it("retourne vrai si l'admin existe", async () => {
      const persistance = unePersistanceMemoireTS()
        .ajouteAdminSurPerimetre(idAdmin, [{ siret: 'siret-A' }])
        .construis();
      const depot = new DepotDonneesAdminsOrganisations({ persistance });

      expect(await depot.estAdmin(idAdmin)).toBe(true);
    });

    it("retourne faux si l'utilisateur n'est pas superviseur", async () => {
      const persistanceVide = unePersistanceMemoireTS().construis();
      const depot = new DepotDonneesAdminsOrganisations({
        persistance: persistanceVide,
      });

      expect(await depot.estAdmin(unUUID('X'))).toBe(false);
    });
  });
});
