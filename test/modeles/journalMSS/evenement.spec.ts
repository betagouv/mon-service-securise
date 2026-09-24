import Evenement, {
  Hacheur,
} from '../../../src/modeles/journalMSS/evenement.ts';
import { ErreurDonneesObligatoiresManquantes } from '../../../src/erreurs.js';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';

type DonneesDeTest = { idService: string; commentaire?: string };

class EvenementDeTest extends Evenement<DonneesDeTest> {
  protected override typeEvenement() {
    return 'EVENEMENT_DE_TEST';
  }

  protected override proprietesRequises(): (keyof DonneesDeTest)[] {
    return ['idService'];
  }

  protected override donneesAConsigner(
    { idService, commentaire }: DonneesDeTest,
    hache: Hacheur
  ) {
    return { idService: hache(idService), commentaire };
  }
}

describe('Un événement du journal MSS', () => {
  const desDonnees = (): DonneesDeTest => ({
    idService: 'abc',
    commentaire: 'un commentaire',
  });

  it('porte le type déclaré par la sous-classe', () => {
    const evenement = new EvenementDeTest(desDonnees(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.type).toBe('EVENEMENT_DE_TEST');
  });

  it("consigne les données transformées par la sous-classe, hachées avec l'adaptateur de chiffrement fourni", () => {
    const evenement = new EvenementDeTest(desDonnees(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees).toEqual({
      idService: 'ABC',
      commentaire: 'un commentaire',
    });
  });

  it("hache avec l'adaptateur de chiffrement par défaut si aucun n'est fourni", () => {
    const evenement = new EvenementDeTest(desDonnees());

    expect(evenement.donnees.idService).not.toBe('abc');
  });

  it('utilise la date fournie', () => {
    const evenement = new EvenementDeTest(desDonnees(), {
      date: '17/11/2022',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.date).toBe('17/11/2022');
  });

  it("est daté de l'instant courant si aucune date n'est fournie", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-24T10:00:00Z'));

    const evenement = new EvenementDeTest(desDonnees(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.date).toBe(new Date('2026-09-24T10:00:00Z').getTime());
    vi.useRealTimers();
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementDeTest(desDonnees(), {
      date: '17/11/2022',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      type: 'EVENEMENT_DE_TEST',
      donnees: { idService: 'ABC', commentaire: 'un commentaire' },
      date: '17/11/2022',
    });
  });

  it.each([undefined, null])(
    'exige que chaque propriété requise soit renseignée (refuse `%s`)',
    (valeurManquante) => {
      expect(
        () =>
          new EvenementDeTest(
            // @ts-expect-error On force volontairement une valeur manquante
            { ...desDonnees(), idService: valeurManquante },
            { adaptateurChiffrement: hacheEnMajuscules }
          )
      ).toThrow(
        new ErreurDonneesObligatoiresManquantes('Il manque la donnée idService')
      );
    }
  );

  it('exige que les données soient fournies si une propriété est requise', () => {
    expect(
      () =>
        // @ts-expect-error On force volontairement l'absence de données
        new EvenementDeTest(undefined, {
          adaptateurChiffrement: hacheEnMajuscules,
        })
    ).toThrow(ErreurDonneesObligatoiresManquantes);
  });

  it("accepte l'absence d'une propriété non requise", () => {
    const evenement = new EvenementDeTest(
      { idService: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees).toEqual({
      idService: 'ABC',
      commentaire: undefined,
    });
  });
});
