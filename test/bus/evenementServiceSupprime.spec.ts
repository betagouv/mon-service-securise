import EvenementServiceSupprime from '../../src/bus/evenementServiceSupprime.ts';

describe("L'événement 'ServiceSupprimé'", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    const payload = { idService: null, autorisations: [] };

    expect(
      // @ts-expect-error on force une mauvaise payload
      () => new EvenementServiceSupprime(payload)
    ).toThrow("Impossible d'instancier l'événement sans ID de service");
  });
});
