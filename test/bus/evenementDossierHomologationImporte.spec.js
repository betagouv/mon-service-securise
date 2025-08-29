import expect from 'expect.js';
import EvenementDossierHomologationImporte from '../../src/bus/evenementDossierHomologationImporte.js';

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
