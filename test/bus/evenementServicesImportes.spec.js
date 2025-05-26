const expect = require('expect.js');
const EvenementServicesImportes = require('../../src/bus/evenementServicesImportes');

describe("L'événement `ServicesImportes`", () => {
  it("lève une exception s'il est instancié sans nombre de services importés", () => {
    expect(
      () =>
        new EvenementServicesImportes({
          nbServicesImportes: null,
          idUtilisateur: 'U1',
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans identifiant utilisateur", () => {
    expect(
      () =>
        new EvenementServicesImportes({
          nbServicesImportes: 42,
          idUtilisateur: null,
        })
    ).to.throwError();
  });
});
