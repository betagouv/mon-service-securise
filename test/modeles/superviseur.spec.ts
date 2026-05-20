import Superviseur from '../../src/modeles/superviseur.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Un superviseur', () => {
  it('représente un utilisateur', () => {
    const superviseur = Superviseur.nouveau(unUUID('U'));

    expect(superviseur.donnees().idUtilisateur).toBe(unUUID('U'));
  });
});
