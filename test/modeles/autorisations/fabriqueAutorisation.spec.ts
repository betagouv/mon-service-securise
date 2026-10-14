import { fabrique } from '../../../src/modeles/autorisations/fabriqueAutorisation.js';
import { unUUID } from '../../constructeurs/UUID.js';

describe("La fabrique d'autorisation", () => {
  it('fabrique une autorisation de superviseur', () => {
    const autorisation = fabrique({
      id: unUUID('a'),
      idService: unUUID('s'),
      idUtilisateur: unUUID('u'),
      estProprietaire: true,
      estSuperviseur: true,
      droits: {},
    });

    expect(autorisation.estUnSuperviseur()).toBe(true);
    expect(autorisation.resumeNiveauDroit()).toBe('SUPERVISEUR');
  });
});
