import Superviseur from '../../src/modeles/superviseur.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Entite from '../../src/modeles/entite.ts';

describe('Un superviseur', () => {
  it('représente un utilisateur', () => {
    const superviseur = Superviseur.nouveau(unUUID('U'));

    expect(superviseur.donnees().idUtilisateur).toBe(unUUID('U'));
  });

  describe("sur l'ajout d'une entité supervisée", () => {
    it("supervise l'entité", () => {
      const superviseur = Superviseur.nouveau(unUUID('U'));

      superviseur.supervise(
        new Entite({ siret: 'SIRET-123', nom: 'Un nom', departement: '75' })
      );

      expect(superviseur.donnees().entitesSupervisees[0]).toEqual({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });
    });

    it("accepte silencieusement de superviser une entité deux fois : elle n'est pas doublonnée", () => {
      const superviseur = Superviseur.hydrate({
        idUtilisateur: unUUID('U'),
        entitesSupervisees: [
          { siret: 'SIRET-123', nom: 'Un nom', departement: '75' },
        ],
      });
      const laMeme = new Entite({
        siret: 'SIRET-123',
        nom: 'Un nom',
        departement: '75',
      });

      superviseur.supervise(laMeme);

      expect(superviseur.donnees().entitesSupervisees).toHaveLength(1);
    });
  });
});
