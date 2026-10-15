import type { NodeOptions } from '@sentry/node';
import { sentry } from '../adaptateurEnvironnement.js';
import { scrubEvenementSentry } from './scrubbingEvenementSentry.js';
import { detailleLesErreursAxios } from './enrichissementErreurAxiosSentry.js';

const optionsSentry = (): NodeOptions => {
  const config = sentry();

  return {
    dsn: config.dsn(),
    environment: config.environnement(),
    ignoreTransactions: config.cheminsIgnoresParTracing(),
    tracesSampleRate: config.sampleRateDuTracing(),
    maxValueLength: 50_000,
    beforeSend: (evenement, hint) =>
      scrubEvenementSentry(detailleLesErreursAxios(evenement, hint)),
    beforeSendTransaction: (transaction) => scrubEvenementSentry(transaction),
    beforeBreadcrumb: (breadcrumb) => scrubEvenementSentry(breadcrumb),
  };
};

export { optionsSentry };
