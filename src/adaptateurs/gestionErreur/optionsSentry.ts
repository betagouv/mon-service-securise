import type { NodeOptions } from '@sentry/node';
import { sentry } from '../adaptateurEnvironnement.js';
import { scrubEvenementSentry } from './scrubbingEvenementSentry.js';

const optionsSentry = (): NodeOptions => {
  const config = sentry();

  return {
    dsn: config.dsn(),
    environment: config.environnement(),
    ignoreTransactions: config.cheminsIgnoresParTracing(),
    tracesSampleRate: config.sampleRateDuTracing(),
    maxValueLength: 50_000,
    beforeSend: (evenement) => scrubEvenementSentry(evenement),
    beforeSendTransaction: (transaction) => scrubEvenementSentry(transaction),
    beforeBreadcrumb: (breadcrumb) => scrubEvenementSentry(breadcrumb),
  };
};

export { optionsSentry };
