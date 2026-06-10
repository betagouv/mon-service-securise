import { AdminOrganisations } from '../../../src/modeles/gestionOrganisations/adminOrganisations.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import Entite from '../../../src/modeles/entite.ts';

describe("Un admin d'organisations", () => {
  it('représente un utilisateur', () => {
    const admin = AdminOrganisations.nouveau(unUUID('U'));

    expect(admin.donnees().idUtilisateur).toBe(unUUID('U'));
  });

  describe("sur l'ajout d'une entité administrée", () => {
    it("administre l'entité", () => {
      const admin = AdminOrganisations.nouveau(unUUID('U'));

      admin.administre(
        new Entite({ siret: 'SIRET-123', nom: 'Un nom', departement: '75' })
      );

      expect(admin.donnees().entitesAdministrees[0]).toEqual({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });
    });

    it("accepte silencieusement d'administrer une entité deux fois : elle n'est pas doublonnée", () => {
      const admin = AdminOrganisations.hydrate({
        idUtilisateur: unUUID('U'),
        entitesAdministrees: [
          { siret: 'SIRET-123', nom: 'Un nom', departement: '75' },
        ],
      });

      const laMeme = new Entite({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });

      admin.administre(laMeme);

      expect(admin.donnees().entitesAdministrees).toHaveLength(1);
    });
  });

  describe("sur le retrait d'une entité administrée", () => {
    it("n'administre plus cette entité", () => {
      const admin = AdminOrganisations.hydrate({
        idUtilisateur: unUUID('U'),
        entitesAdministrees: [
          { siret: 'SIRET-123', nom: 'Un nom', departement: '75' },
        ],
      });

      const entite = new Entite({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });

      admin.cesseDAdministrer(entite);

      expect(admin.donnees().entitesAdministrees).toHaveLength(0);
    });

    it('accepte silencieusement de retirer un entité non administrée', () => {
      const admin = AdminOrganisations.hydrate({
        idUtilisateur: unUUID('U'),
        entitesAdministrees: [
          { siret: 'SIRET-A', nom: 'Un nom', departement: '75' },
        ],
      });

      const entiteB = new Entite({
        siret: 'SIRET-B',
        nom: 'Un nom',
        departement: '75',
      });

      admin.cesseDAdministrer(entiteB);

      expect(admin.donnees().entitesAdministrees).toHaveLength(1);
    });
  });

  it("sait s'il est admin de tout un périmètre", () => {
    const admin = AdminOrganisations.hydrate({
      idUtilisateur: unUUID('U'),
      entitesAdministrees: [
        { siret: 'SIRET-123', nom: 'Un nom', departement: '75' },
        { siret: 'SIRET-456', nom: 'Un nom', departement: '75' },
      ],
    });

    expect(admin.estAdminDuPerimetre(['SIRET-123'])).toBeTruthy();
    expect(admin.estAdminDuPerimetre(['SIRET-123', 'SIRET-456'])).toBeTruthy();
    expect(admin.estAdminDuPerimetre(['SIRET-123', 'SIRET-124'])).toBeFalsy();
    expect(admin.estAdminDuPerimetre(['SIRET-124'])).toBeFalsy();
  });
});
