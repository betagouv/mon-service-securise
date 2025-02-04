const Sentry = require('@sentry/node');
const DepotDonnees = require('../../src/depotDonnees');
const adaptateurEnvironnement = require('../../src/adaptateurs/adaptateurEnvironnement');
const adaptateurHorloge = require('../../src/adaptateurs/adaptateurHorloge');
const adaptateurMail = require('../../src/adaptateurs/adaptateurMailSendinblue');
const {
  envoieMailsNotificationExpirationHomologation,
} = require('../../src/taches/envoieMailsNotificationExpirationHomologation');

const main = async () => {
  const depotDonnees = DepotDonnees.creeDepot();
  return envoieMailsNotificationExpirationHomologation({
    depotDonnees,
    adaptateurHorloge,
    adaptateurMail,
  });
};

const config = adaptateurEnvironnement.sentry();
Sentry.init({
  dsn: config.dsn(),
  environment: config.environnement(),
});

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
});
