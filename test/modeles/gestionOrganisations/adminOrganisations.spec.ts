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

      admin.administreCetteEntite(
        new Entite({ siret: 'SIRET-123', nom: 'Un nom', departement: '75' })
      );

      expect(admin.donnees().entitesAdministrees[0]).toEqual({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });
    });

    it("accepte silencieusement d'administrer une entité deux fois : elle n'est pas doublonnée", () => {
      const admin = AdminOrganisations.nouveau(unUUID('U'));

      const entite = new Entite({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });

      admin.administreCetteEntite(entite);
      admin.administreCetteEntite(entite);

      expect(admin.donnees().entitesAdministrees).toHaveLength(1);
    });
  });

  describe("sur le retrait d'une entité administrée", () => {
    it("n'administre plus cette entité", () => {
      const admin = AdminOrganisations.nouveau(unUUID('U'));
      const entite = new Entite({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });

      admin.administreCetteEntite(entite);
      admin.cesseDAdministrer(entite);

      expect(admin.donnees().entitesAdministrees).toHaveLength(0);
    });

    it('accepte silencieusement de retirer un entité non administrée', () => {
      const admin = AdminOrganisations.nouveau(unUUID('U'));
      const entiteA = new Entite({
        siret: 'SIRET-A',
        nom: 'Un nom',
        departement: '75',
      });
      const entiteB = new Entite({
        siret: 'SIRET-B',
        nom: 'Un nom',
        departement: '75',
      });

      admin.administreCetteEntite(entiteA);
      admin.cesseDAdministrer(entiteB);

      expect(admin.donnees().entitesAdministrees).toHaveLength(1);
    });
  });
});
