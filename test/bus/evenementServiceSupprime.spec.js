import expect from 'expect.js';
import EvenementServiceSupprime from '../../src/bus/evenementServiceSupprime.js';

describe("L'événement 'ServiceSupprimé'", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    expect(
      () =>
        new EvenementServiceSupprime({
          idService: null,
        })
    ).to.throwError();
  });
});
