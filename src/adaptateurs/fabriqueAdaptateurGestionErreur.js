import { sentry } from './adaptateurEnvironnement.js';
import * as adaptateurSentry from './adaptateurGestionErreurSentry.js';
import * as adaptateurVide from './adaptateurGestionErreurVide.js';

const fabriqueAdaptateurGestionErreur = () =>
  sentry().dsn() ? adaptateurSentry : adaptateurVide;

export { fabriqueAdaptateurGestionErreur };
