import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { EvenementContributeurAjoute } from '../../src/bus/evenementContributeurAjoute.ts';
import { ErreurDonneesObligatoiresManquantes } from '../../src/erreurs.js';

describe("L'événement `ContributeurAjoute`", () => {
  it("lève une exception s'il est instancié avec une liste de services vide", () => {
    expect(
      () =>
        new EvenementContributeurAjoute({
          acteur: unUtilisateur().construis(),
          destinataire: unUtilisateur().construis(),
          services: [],
        })
    ).toThrow(ErreurDonneesObligatoiresManquantes);
  });
});
