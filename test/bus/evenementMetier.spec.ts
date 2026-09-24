import { EvenementMetier } from '../../src/bus/evenementMetier.ts';
import { ErreurDonneesObligatoiresManquantes } from '../../src/erreurs.js';

type Donnees = { idService: string; commentaire?: string };

class EvenementDeTest extends EvenementMetier<Donnees>(['idService']) {}

describe('Un événement métier', () => {
  it('expose les données reçues comme propriétés', () => {
    const evenement = new EvenementDeTest({
      idService: 'S1',
      commentaire: 'un commentaire',
    });

    expect(evenement.idService).toBe('S1');
    expect(evenement.commentaire).toBe('un commentaire');
  });

  it('exige les propriétés requises', () => {
    expect(
      () =>
        // @ts-expect-error On force volontairement une valeur manquante
        new EvenementDeTest({ idService: undefined })
    ).toThrow(ErreurDonneesObligatoiresManquantes);
  });

  it("accepte l'absence d'une propriété non requise", () => {
    expect(() => new EvenementDeTest({ idService: 'S1' })).not.toThrow();
  });

  it('conserve le nom de la sous-classe, sur lequel le bus route les abonnés', () => {
    const evenement = new EvenementDeTest({ idService: 'S1' });

    expect(evenement.constructor.name).toBe('EvenementDeTest');
    expect(evenement).toBeInstanceOf(EvenementDeTest);
  });
});
