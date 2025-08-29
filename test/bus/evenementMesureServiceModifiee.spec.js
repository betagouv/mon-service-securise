import expect from 'expect.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import EvenementMesureServiceModifiee from '../../src/bus/evenementMesureServiceModifiee.js';

describe("L'événement `mesureServiceModifiee", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementMesureServiceModifiee({
          service: null,
          utilisateur: unUtilisateur().construis(),
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementMesureServiceModifiee({
          service: unService().construis(),
          utilisateur: null,
        })
    ).to.throwError();
  });
});
