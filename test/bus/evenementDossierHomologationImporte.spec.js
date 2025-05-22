const expect = require('expect.js');
const EvenementDossierHomologationImporte = require('../../src/bus/evenementDossierHomologationImporte');

describe("L'événement 'DossierHomologationImporte'", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    expect(
      () =>
        new EvenementDossierHomologationImporte({
          dossier: {},
          idService: null,
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans dossier", () => {
    expect(
      () =>
        new EvenementDossierHomologationImporte({
          dossier: null,
          idService: 'S1',
        })
    ).to.throwError();
  });
});
