import * as Sentry from '@sentry/node';
import * as DepotDonnees from '../../src/depotDonnees.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import * as adaptateurMail from '../../src/adaptateurs/adaptateurMailSendinblue.js';
import { envoieMailsNotificationExpirationHomologation } from '../../src/taches/envoieMailsNotificationExpirationHomologation.js';
import { fabriqueAdaptateurHorloge } from '../../src/adaptateurs/adaptateurHorloge.js';

const main = async () => {
  const depotDonnees = DepotDonnees.creeDepot();
  const adaptateurHorloge = fabriqueAdaptateurHorloge();
  return envoieMailsNotificationExpirationHomologation({
    depotDonnees,
    adaptateurHorloge,
    adaptateurMail,
  });
};

const config = adaptateurEnvironnement.sentry();

Sentry.init({ dsn: config.dsn(), environment: config.environnement() });

const checkInId = Sentry.captureCheckIn({
  monitorSlug: 'envoie-mails-notification-expiration',
  status: 'in_progress',
});

main().then((rapport) => {
  Sentry.captureCheckIn({
    checkInId,
    monitorSlug: 'envoie-mails-notification-expiration',
    status: rapport.nbEchecs ? 'error' : 'ok',
  });
  process.exit(0);
});
