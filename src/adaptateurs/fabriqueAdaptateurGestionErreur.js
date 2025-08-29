import { sentry } from './adaptateurEnvironnement.js';
import * as adaptateurSentry from './adaptateurGestionErreurSentry.js';
import { fabriqueAdaptateurGestionErreurVide } from './adaptateurGestionErreurVide.js';

export const fabriqueAdaptateurGestionErreur = () =>
  sentry().dsn() ? adaptateurSentry : fabriqueAdaptateurGestionErreurVide();
