const expect = require('expect.js');
const EvenementUtilisateurInscrit = require('../../src/bus/evenementUtilisateurInscrit');

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
