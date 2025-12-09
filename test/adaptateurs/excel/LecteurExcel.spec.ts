import { LecteurExcel } from '../../../src/adaptateurs/excel/LecteurExcel.js';

describe('Le lecteur de fichier Excel', () => {
  describe('concernant le contrôle de lignes complètes', () => {
    it('dit que les lignes sont complètes quand toutes les propriétés sont présentes', () => {
      const lecteur = new LecteurExcel(Buffer.from(''));

      const complete = lecteur.lesLignesSontCompletes(
        [{ jour: 'lundi' }],
        ['jour']
      );

      expect(complete).toBe(true);
    });

    it("dit que les lignes sont incomplètes dès qu'il manque une propriété", () => {
      const lecteur = new LecteurExcel(Buffer.from(''));

      const complete = lecteur.lesLignesSontCompletes(
        [{ jour: 'lundi' }],
        ['jour', 'mois']
      );

      expect(complete).toBe(false);
    });
  });
});
