const expect = require('expect.js');
const EvenementUtilisateurModifie = require('../../src/bus/evenementUtilisateurModifie');

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
