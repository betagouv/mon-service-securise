import xlsx from 'xlsx';
import { ErreurFichierXlsInvalide } from '../../erreurs.js';

class LecteurExcel {
  readonly buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  donneesDeFeuille(nomFeuille: string, indexLigneDuHeader: number) {
    const fichierXLS = xlsx.read(this.buffer, { type: 'buffer' });

    if (
      Object.keys(fichierXLS.Sheets).length > 1 ||
      !fichierXLS.Sheets[nomFeuille]
    ) {
      throw new ErreurFichierXlsInvalide();
    }

    const feuille = fichierXLS.Sheets[nomFeuille];

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
