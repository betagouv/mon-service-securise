import path from 'node:path';
import { readFileSync } from 'node:fs';

import { ErreurFichierXlsInvalide } from '../../../src/erreurs.js';
import { LecteurExcel } from '../../../src/adaptateurs/excel/LecteurExcel.js';

describe('Le lecteur de fichier Excel', () => {
  describe('concernant la construction', () => {
    describe('valide le format du contenu attendu', () => {
      it.each(['anssi.pptx', 'anssi.ppt', 'logo_mss.png'])(
        `lève une exception si le format du fichier %s n'est pas le bon`,
        (fichier: string) => {
          const contenuFichier = readFileSync(
            path.join(__dirname, '..', '..', 'mocks', fichier)
          );

          expect(() => {
            // eslint-disable-next-line no-new
            new LecteurExcel(contenuFichier);
          }).toThrowError(ErreurFichierXlsInvalide);
        }
      );
    });
  });

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
