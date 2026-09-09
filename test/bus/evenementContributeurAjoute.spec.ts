import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unService } from '../constructeurs/constructeurService.js';
import { EvenementContributeurAjoute } from '../../src/bus/evenementContributeurAjoute.ts';

describe("L'événement `ContributeurAjoute", () => {
  it("lève une exception s'il est instancié sans services", () => {
    const payload = {
      acteur: unUtilisateur().construis(),
      destinataire: unUtilisateur().construis(),
    };

    // @ts-expect-error on force une mauvaise payload
    expect(() => new EvenementContributeurAjoute(payload)).toThrowError();
  });

  it("lève une exception s'il est instancié sans destinataire", () => {
    const payload = {
      acteur: unUtilisateur().construis(),
      services: [unService().construis()],
    };

    // @ts-expect-error on force une mauvaise payload
    expect(() => new EvenementContributeurAjoute(payload)).toThrowError();
  });

  it("lève une exception s'il est instancié sans acteur", () => {
    const payload = {
      destinataire: unUtilisateur().construis(),
      services: [unService().construis()],
    };

    // @ts-expect-error on force une mauvaise payload
    expect(() => new EvenementContributeurAjoute(payload)).toThrowError();
  });
});
