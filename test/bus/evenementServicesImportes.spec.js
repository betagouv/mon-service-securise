const expect = require('expect.js');
const EvenementServicesImportes = require('../../src/bus/evenementServicesImportes');

describe("L'événement `ServicesImportes`", () => {
  it("lève une exception s'il est instancié sans nombre de services importés", () => {
    expect(
      () =>
        new EvenementServicesImportes({
          nbServicesImportes: null,
        })
    ).to.throwError();
  });
});
