import { EvenementAutorisationsServiceModifiees } from '../../src/bus/evenementAutorisationsServiceModifiees.ts';
import { ErreurDonneesObligatoiresManquantes } from '../../src/erreurs.js';
import { unUUID } from '../constructeurs/UUID.ts';

describe("L'événement `AutorisationsServiceModifiees`", () => {
  it("lève une exception s'il est instancié avec une liste d'autorisations vide", () => {
    expect(
      () =>
        new EvenementAutorisationsServiceModifiees({
          idService: unUUID('S'),
          autorisations: [],
        })
    ).toThrow(ErreurDonneesObligatoiresManquantes);
  });
});
