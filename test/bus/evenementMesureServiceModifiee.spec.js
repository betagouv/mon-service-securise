const expect = require('expect.js');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const { unService } = require('../constructeurs/constructeurService');
const EvenementMesureServiceModifiee = require('../../src/bus/evenementMesureServiceModifiee');

describe("L'événement `mesureServiceModifiee", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementMesureServiceModifiee({
          service: null,
          utilisateur: unUtilisateur().construis(),
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementMesureServiceModifiee({
          service: unService().construis(),
          utilisateur: null,
        })
    ).to.throwError();
  });
});
