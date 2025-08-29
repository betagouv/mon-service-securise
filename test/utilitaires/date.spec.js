import expect from 'expect.js';
import { ajouteMoisADate } from '../../src/utilitaires/date.js';

const ils = it;

describe('Les utilitaires de date', () => {
  describe("sur demande d'ajout de mois à une date", () => {
    ils('ajoutent un mois à une date en milieu de mois', () => {
      const dateMoisSuivant = ajouteMoisADate(1, new Date('2022-01-15'));
      expect(dateMoisSuivant.toLocaleDateString('fr-FR')).to.equal(
        '15/02/2022'
      );
    });

    ils('gèrent les cas limites', () => {
      const dateMoisSuivant = ajouteMoisADate(1, new Date('2024-01-31'));
      expect(dateMoisSuivant.toLocaleDateString('fr-FR')).to.equal(
        '29/02/2024'
      );
    });
  });
});
