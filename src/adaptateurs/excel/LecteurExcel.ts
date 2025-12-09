import xlsx, { WorkBook } from 'xlsx';
import { ErreurFichierXlsInvalide } from '../../erreurs.js';

class LecteurExcel {
  readonly fichierXLS: WorkBook;

  private readonly messagesErreurs: string[] = [
    'is not a spreadsheet',
    'Cannot find Workbook stream',
    'Could not find workbook',
  ];

  constructor(buffer: Buffer) {
    try {
      this.fichierXLS = xlsx.read(buffer, { type: 'buffer' });
    } catch (e) {
      // La validation du type fichier attendu (`xls`) s'opère au moment du parsing, et `throw` en cas d'échec ;
      // _c.f._ https://git.sheetjs.com/sheetjs/sheetjs/src/commit/8a7cfd47bde8258c0d91df6a737bf0136699cdf8/bits/18_cfb.js#L252 ;
      // L'implémentation de la validation effectue une vérification des octets d'en-têtes, spécifiques au format `xls`.
      // Et d'autres fichiers partagent les même octets d'en-têtes : `xls`, `doc`, `ppt`, `pptx` ;
      // _c.f._ https://en.wikipedia.org/wiki/List_of_file_signatures .
      if (
        e instanceof Error &&
        this.messagesErreurs.some((m) => (e as Error).message.includes(m))
      ) {
        throw new ErreurFichierXlsInvalide();
      }
      throw e;
    }
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
