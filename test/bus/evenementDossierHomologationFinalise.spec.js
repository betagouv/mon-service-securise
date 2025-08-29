import expect from 'expect.js';
import EvenementDossierHomologationFinalise from '../../src/bus/evenementDossierHomologationFinalise.js';

describe("L'événement 'DossierHomologationFinalise'", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    expect(
      () =>
        new EvenementDossierHomologationFinalise({
          dossier: {},
          idService: null,
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans dossier", () => {
    expect(
      () =>
        new EvenementDossierHomologationFinalise({
          dossier: null,
        })
    ).to.throwError();
  });
});
