import multer from 'multer';
import { ErreurFichierXlsInvalide } from '../erreurs.js';

const UN_MEGA = 1 * 1024 * 1024;

const extraisDonneesXLS = async (requete) => {
  const extracteurFichier = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: UN_MEGA, files: 1 },
    fileFilter: (_req, fichier, suite) => {
      if (
        fichier.originalname.endsWith('.xlsx') &&
        fichier.mimetype ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        suite(null, true);
      } else {
        suite(new ErreurFichierXlsInvalide(), false);
      }
    },
  });

  return new Promise((resolve, reject) => {
    extracteurFichier.single('fichier')(requete, undefined, (erreur) => {
      if (!requete.file) {
        reject(new ErreurFichierXlsInvalide());
        return;
      }

      if (erreur) {
        if (
          erreur.message === 'File too large' ||
          erreur.message === 'Too many files'
        ) {
          reject(new ErreurFichierXlsInvalide());
          return;
        }
        reject(erreur);
        return;
      }

      resolve(requete.file.buffer);
    });
  });
};

export { extraisDonneesXLS };
