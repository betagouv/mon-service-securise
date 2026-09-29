import { webhookLogErreur, sentry } from './adaptateurEnvironnement.js';
import * as adaptateurSentry from './adaptateurGestionErreurSentry.js';
import { fabriqueAdaptateurGestionErreurVide } from './adaptateurGestionErreurVide.js';
import { fabriqueAdaptateurGestionErreurAvecDuplicationWebhook } from './adaptateurGestionErreurAvecDuplicationWebhook.js';

export const fabriqueAdaptateurGestionErreur = () => {
  const adaptateurErreur = sentry().dsn()
    ? adaptateurSentry
    : fabriqueAdaptateurGestionErreurVide();
  return webhookLogErreur().actif()
    ? fabriqueAdaptateurGestionErreurAvecDuplicationWebhook(adaptateurErreur)
    : adaptateurErreur;
};
