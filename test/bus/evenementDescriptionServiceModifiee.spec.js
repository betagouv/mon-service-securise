import expect from 'expect.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import { EvenementDescriptionServiceModifiee } from '../../src/bus/evenementDescriptionServiceModifiee.js';

describe("L'événement `descriptionServiceModifiee", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: null,
          utilisateur: unUtilisateur().construis(),
          ancienneDescription: { nomService: 'Service 1' },
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: unService().construis(),
          utilisateur: null,
          ancienneDescription: { nomService: 'Service 1' },
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans l'ancienne description", () => {
    expect(
      () =>
        new EvenementDescriptionServiceModifiee({
          service: unService().construis(),
          utilisateur: unUtilisateur().construis(),
          ancienneDescription: null,
        })
    ).to.throwError();
  });
});
