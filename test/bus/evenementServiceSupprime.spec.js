const expect = require('expect.js');
const EvenementServiceSupprime = require('../../src/bus/evenementServiceSupprime');

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
