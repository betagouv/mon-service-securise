import rateLimit from 'express-rate-limit';
import { RequeteApiPublique } from './authentificationParCleApi.js';

export const limiteDeDebitParCleApi = ({
  fenetreMs,
  maxParFenetre,
}: {
  fenetreMs: number;
  maxParFenetre: number;
}) =>
  rateLimit({
    windowMs: fenetreMs,
    limit: maxParFenetre,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (requete: RequeteApiPublique) => requete.idCleApiCourante!,
    handler: (_requete, reponse) => {
      reponse.status(429).json({ erreur: 'QUOTA_DEPASSE' });
    },
  });
