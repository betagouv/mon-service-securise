const expect = require('expect.js');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const { unService } = require('../constructeurs/constructeurService');
const {
  EvenementDescriptionServiceModifiee,
} = require('../../src/bus/evenementDescriptionServiceModifiee');

describe("L'événement `descriptionServiceModifiee", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: null,
          utilisateur: unUtilisateur().construis(),
          ancienneDescription: { nomService: 'Service 1' },
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: unService().construis(),
          utilisateur: null,
          ancienneDescription: { nomService: 'Service 1' },
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans l'ancienne description", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: unService().construis(),
          utilisateur: unUtilisateur().construis(),
          ancienneDescription: null,
        })
    ).to.throwError();
  });
});
