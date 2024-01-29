const expect = require('expect.js');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const { unService } = require('../constructeurs/constructeurService');
const EvenementNouveauServiceCree = require('../../src/bus/evenementNouveauServiceCree');

describe("L'événement `nouveauServiceCréé", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementNouveauServiceCree({
          service: null,
          utilisateur: unUtilisateur().construis(),
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementNouveauServiceCree({
          service: unService().construis(),
          utilisateur: null,
        })
    ).to.throwError();
  });
});
