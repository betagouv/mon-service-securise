import expect from 'expect.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import EvenementNouveauServiceCree from '../../src/bus/evenementNouveauServiceCree.js';

describe("L'événement `nouveauServiceCréé", () => {
  it("lève une exception s'il est instancié sans service", () => {
    expect(
      () =>
        new EvenementNouveauServiceCree({
          service: null,
          utilisateur: unUtilisateur().construis(),
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    expect(
      () =>
        new EvenementNouveauServiceCree({
          service: unService().construis(),
          utilisateur: null,
        })
    ).to.throwError();
  });
});
