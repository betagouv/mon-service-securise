const expect = require('expect.js');
const EvenementRisqueServiceModifie = require('../../src/bus/evenementRisqueServiceModifie');

describe("L'événement `risqueServiceModifie", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementRisqueServiceModifie({
          service: null,
        })
    ).to.throwError();
  });
});
