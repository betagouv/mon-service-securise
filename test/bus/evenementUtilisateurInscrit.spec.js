import expect from 'expect.js';
import EvenementUtilisateurInscrit from '../../src/bus/evenementUtilisateurInscrit.js';

describe("L'événement `utilisateurInscrit", () => {
  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementUtilisateurInscrit({
          utilisateur: null,
        })
    ).to.throwError();
  });
});
