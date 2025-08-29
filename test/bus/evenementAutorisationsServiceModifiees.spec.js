import expect from 'expect.js';
import { EvenementAutorisationsServiceModifiees } from '../../src/bus/evenementAutorisationsServiceModifiees.js';

describe("L'événement `autorisationsServicesModifiees", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    expect(
      () => new EvenementAutorisationsServiceModifiees({ idService: null })
    ).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier l'événement sans ID de service"
      );
    });
  });

  it("lève une exception s'il est instancié sans autorisations", () => {
    expect(
      () =>
        new EvenementAutorisationsServiceModifiees({
          idService: 'abc',
          autorisations: null,
        })
    ).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier l'événement sans autorisations"
      );
    });
  });
});
