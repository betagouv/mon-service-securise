import expect from 'expect.js';
import EvenementRisqueServiceModifie from '../../src/bus/evenementRisqueServiceModifie.js';

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
