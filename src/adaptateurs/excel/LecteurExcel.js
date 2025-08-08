const xlsx = require('xlsx');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

class LecteurExcel {
  constructor(buffer) {
    this.buffer = buffer;
  }

  donneesDeFeuille(nomFeuille, indexLigneDuHeader) {
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
}

module.exports = { LecteurExcel };
