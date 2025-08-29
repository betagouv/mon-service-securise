import JSZip from 'jszip';
import { fabriqueAdaptateurGestionErreur } from './fabriqueAdaptateurGestionErreur.js';

const genereArchive = (tableauDeFichiers) => {
  try {
    const zip = new JSZip();
    tableauDeFichiers.forEach(({ nom, buffer }) => {
      zip.file(nom, buffer, { binary: true });
    });
    return zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    return Promise.reject(e);
  }
};

export { genereArchive };
