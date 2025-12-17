import axios from 'axios';
import ipFilter from 'express-ipfilter';
import { Request, Response, NextFunction } from 'express';

const descriptionErreur = (
  erreur: Error,
  infosDeContexte: Record<string, unknown>
): string => {
  const env = process.env.SENTRY_ENVIRONNEMENT;
  const stackTrace = `##### 📚 STACK \n\`\`\`\n${erreur?.stack}\n\`\`\``;
  const contexte = `##### 🎶 CONTEXTE \n\`\`\`json\n${JSON.stringify(
    infosDeContexte,
    null,
    2
  )}\n\`\`\``;

  return `#### [${env}] ${erreur?.name} : ${erreur?.message}\n\n-----\n\n${stackTrace}\n\n-----\n\n${contexte}\n`;
};

const logueErreur = async (
  erreur: Error,
  infosDeContexte: Record<string, unknown> = {}
) => {
  // @ts-expect-error Cette méthode `post()` existe bel et bien
  await axios.post(process.env.GESTION_ERREUR_URL_WEBHOOK_MATTERMOST, {
    text: descriptionErreur(erreur, infosDeContexte),
  });
};

const controleurErreurs = (
  erreur: Error,
  requete: Request,
  reponse: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  suite: NextFunction
) => {
  const estErreurDeFiltrageIp = erreur instanceof ipFilter.IpDeniedError;
  if (estErreurDeFiltrageIp) {
    // On termine la connexion directement si qqun nous appelle sans passer par le WAF.
    reponse.status(401).end();
    return;
  }

  const estErreurCSRF = erreur.message === 'CSRF token mismatch';
  if (estErreurCSRF) {
    logueErreur(new Error('Une erreur CSRF mismatch a été détectée'), {
      'Token CSRF du client': requete.headers['x-csrf-token'],
    });
    reponse.status(500).end();
    return;
  }

  const { path, method, body, params, query } = requete;
  logueErreur(erreur, {
    requete: { path, method, body, params, query },
  });
  reponse.status(500).end();
};

const initialise = () => {
  // Mise en place du catch global
  process.on('unhandledRejection', (cause: Error) => {
    logueErreur(cause, { source: 'catchée par le catch global' });
  });
};

const identifieUtilisateur = () => {};

export const fabriqueAdaptateurGestionErreurMattermost = () => ({
  initialise,
  identifieUtilisateur,
  controleurErreurs,
  logueErreur,
});
