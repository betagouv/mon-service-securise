const expect = require('expect.js');
const EvenementMesuresServiceModifiees = require('../../src/bus/evenementMesuresServiceModifiees');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const { unService } = require('../constructeurs/constructeurService');

describe("L'événement `mesuresServiceModifiees", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementMesuresServiceModifiees({
          service: null,
          utilisateur: unUtilisateur().construis(),
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementMesuresServiceModifiees({
          service: unService().construis(),
          utilisateur: null,
        })
    ).to.throwError();
  });
});
