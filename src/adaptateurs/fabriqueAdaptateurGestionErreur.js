import { sentry } from './adaptateurEnvironnement.js';
import adaptateurSentry from './adaptateurGestionErreurSentry.js';
import adaptateurVide from './adaptateurGestionErreurVide.js';

const fabriqueAdaptateurGestionErreur = () =>
  sentry().dsn() ? adaptateurSentry : adaptateurVide;

export { fabriqueAdaptateurGestionErreur };
