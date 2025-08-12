import { describe, expect, it } from 'vitest';
import { triRapportDetaille } from '../../lib/rapportTeleversement/tri';

describe('Le tri du rapport de téléversement', () => {
  it('met toujours les lignes avec erreur en premier', () => {
    const avant = [
      { numeroLigne: 1, erreurs: [] },
      { numeroLigne: 2, erreurs: ['X'] },
    ];

    const apres = avant.toSorted(triRapportDetaille);

    expect(apres).toEqual([
      { numeroLigne: 2, erreurs: ['X'] },
      { numeroLigne: 1, erreurs: [] },
    ]);
  });

  it('tri les lignes en erreur par numéro de ligne croissant', () => {
    const avant = [
      { numeroLigne: 21, erreurs: ['X'] },
      { numeroLigne: 2, erreurs: ['X'] },
    ];

    const apres = avant.toSorted(triRapportDetaille);

    expect(apres).toEqual([
      { numeroLigne: 2, erreurs: ['X'] },
      { numeroLigne: 21, erreurs: ['X'] },
    ]);
  });

  it('sait fait un tri complet', () => {
    const avant = [
      { numeroLigne: 1, erreurs: [] },
      { numeroLigne: 2, erreurs: ['X'] },
      { numeroLigne: 3, erreurs: [] },
      { numeroLigne: 4, erreurs: [] },
      { numeroLigne: 5, erreurs: ['X'] },
      { numeroLigne: 6, erreurs: ['X'] },
      { numeroLigne: 7, erreurs: [] },
    ];

    const apres = avant.toSorted(triRapportDetaille);

    expect(apres).toEqual([
      { numeroLigne: 2, erreurs: ['X'] },
      { numeroLigne: 5, erreurs: ['X'] },
      { numeroLigne: 6, erreurs: ['X'] },
      { numeroLigne: 1, erreurs: [] },
      { numeroLigne: 3, erreurs: [] },
      { numeroLigne: 4, erreurs: [] },
      { numeroLigne: 7, erreurs: [] },
    ]);
  });
});
