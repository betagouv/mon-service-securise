import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import { EvenementNouveauServiceCree } from '../../src/bus/evenementNouveauServiceCree.ts';

describe("L'événement `NouveauServiceCréé", () => {
  it("lève une exception s'il est instancié sans service", () => {
    const payload = {
      service: unService().construis(),
      utilisateur: unUtilisateur().construis(),
    };
    // @ts-expect-error On supprime le service.
    delete payload.service;

    expect(() => new EvenementNouveauServiceCree(payload)).toThrowError();
  });

  it("lève une exception s'il est instancié sans utilisateur", () => {
    const payload = {
      service: unService().construis(),
      utilisateur: unUtilisateur().construis(),
    };
    // @ts-expect-error On supprime l'utilisateur.
    delete payload.utilisateur;

    expect(() => new EvenementNouveauServiceCree(payload)).toThrowError();
  });
});
