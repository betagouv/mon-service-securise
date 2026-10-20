import { EvenementAutorisationsServiceModifiees } from '../../src/bus/evenementAutorisationsServiceModifiees.ts';
import { unUUID } from '../constructeurs/UUID.js';

describe("L'événement `AutorisationsServiceModifiees`", () => {
  it("lève une exception s'il est instancié sans ID de service", () => {
    const payload = {
      idService: null,
      autorisations: [{ idUtilisateur: unUUID('U'), droit: 'PROPRIETAIRE' }],
    };

    expect(
      // @ts-expect-error on force une mauvaise payload
      () => new EvenementAutorisationsServiceModifiees(payload)
    ).toThrow("Impossible d'instancier l'événement sans ID de service");
  });

  it("lève une exception s'il est instancié sans autorisations", () => {
    const payload = { idService: unUUID('S'), autorisations: null };

    expect(
      // @ts-expect-error on force une mauvaise payload
      () => new EvenementAutorisationsServiceModifiees(payload)
    ).toThrow("Impossible d'instancier l'événement sans autorisations");
  });
});
