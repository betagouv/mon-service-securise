import {
  ajouteMoisADate,
  secondesJusqua23h59m59s,
} from '../../src/utilitaires/date.js';

describe('Les utilitaires de date', () => {
  describe("sur demande d'ajout de mois à une date", () => {
    it('ajoutent un mois à une date en milieu de mois', () => {
      const dateMoisSuivant = ajouteMoisADate(1, new Date('2022-01-15'));
      expect(dateMoisSuivant.toLocaleDateString('fr-FR')).toEqual('15/02/2022');
    });

    it('gèrent les cas limites', () => {
      const dateMoisSuivant = ajouteMoisADate(1, new Date('2024-01-31'));
      expect(dateMoisSuivant.toLocaleDateString('fr-FR')).toEqual('29/02/2024');
    });
  });

  describe("sur demande de calcul des secondes restantes jusqu'à 23:59:59", () => {
    const positionneHeure = (
      heure: number,
      minutes: number,
      secondes: number
    ) => {
      const date = new Date();
      date.setHours(heure);
      date.setMinutes(minutes);
      date.setSeconds(secondes);
      return date;
    };

    it("compte les secondes restantes quand il ne reste que des secondes d'écart", () => {
      const a23h59 = positionneHeure(23, 59, 0);

      const restant = secondesJusqua23h59m59s(a23h59);

      expect(restant).toBe(59);
    });

    it("compte les secondes restantes quand il reste des secondes et des minutes d'écart", () => {
      const a23h58 = positionneHeure(23, 58, 0);

      const restant = secondesJusqua23h59m59s(a23h58);

      const uneMinute = 60;
      expect(restant).toBe(uneMinute + 59);
    });

    it('compte les secondes restantes depuis le milieu de journée', () => {
      const a11h45 = positionneHeure(11, 45, 8);

      const restant = secondesJusqua23h59m59s(a11h45);

      const douzeHeures = 12 * 3600;
      const quatorzeMinutes = 14 * 60;
      expect(restant).toBe(douzeHeures + quatorzeMinutes + 51);
    });
  });
});
