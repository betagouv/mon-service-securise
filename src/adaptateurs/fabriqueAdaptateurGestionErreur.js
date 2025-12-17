import { sentry } from './adaptateurEnvironnement.js';
import * as adaptateurSentry from './adaptateurGestionErreurSentry.js';
import { fabriqueAdaptateurGestionErreurVide } from './adaptateurGestionErreurVide.js';
import { fabriqueAdaptateurGestionErreurMattermost } from './adaptateurGestionErreurMattermost.js';

export const fabriqueAdaptateurGestionErreur = () => {
  const modeDegradeMattermost = Boolean(
    process.env.GESTION_ERREUR_URL_WEBHOOK_MATTERMOST
  );
  if (modeDegradeMattermost) {
    // eslint-disable-next-line no-console
    console.log('ℹ️ 🪶 MODE DÉGRADÉ VIA MATTERMOST ACTIVÉ');
    return fabriqueAdaptateurGestionErreurMattermost();
  }

  return sentry().dsn()
    ? adaptateurSentry
    : fabriqueAdaptateurGestionErreurVide();
};
