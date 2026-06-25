import EvenementRisqueServiceModifie from '../../src/bus/evenementRisqueServiceModifie.js';

describe("L'événement `risqueServiceModifie", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementRisqueServiceModifie({
          // @ts-expect-error on teste justement qu'une erreur est lancée si vide
          service: null,
        })
    ).toThrow(Error);
  });
});
