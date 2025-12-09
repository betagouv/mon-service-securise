import xlsx, { WorkBook } from 'xlsx';
import { ErreurFichierXlsInvalide } from '../../erreurs.js';

class LecteurExcel {
  readonly fichierXLS: WorkBook;

  constructor(buffer: Buffer) {
    this.fichierXLS = xlsx.read(buffer, { type: 'buffer' });
  }

  donneesDeFeuille(nomFeuille: string, indexLigneDuHeader: number) {
    if (
      Object.keys(this.fichierXLS.Sheets).length > 1 ||
      !this.fichierXLS.Sheets[nomFeuille]
    ) {
      throw new ErreurFichierXlsInvalide();
    }

    const feuille = this.fichierXLS.Sheets[nomFeuille];

    return xlsx.utils.sheet_to_json(feuille, {
      range: indexLigneDuHeader - 1,
      defval: '',
      raw: false,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  lesLignesSontCompletes(
    tableauDeLignes: { [propName: string]: string }[],
    proprietesAttendues: string[]
  ) {
    return tableauDeLignes.every((ligneDonnee) => {
      const proprietesDeLaLigne = new Set(Object.keys(ligneDonnee));
      return proprietesAttendues.every((p) => proprietesDeLaLigne.has(p));
    });
  }
}

export { LecteurExcel };
