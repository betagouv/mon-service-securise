import expect from 'expect.js';
import EvenementUtilisateurModifie from '../../src/bus/evenementUtilisateurModifie.js';

describe("L'événement `utilisateurModifie", () => {
  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementUtilisateurModifie({
          utilisateur: null,
        })
    ).to.throwError();
  });
});
