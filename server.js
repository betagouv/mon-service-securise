const Middleware = require('./src/http/middleware');
const DepotDonnees = require('./src/depotDonnees');
const MoteurRegles = require('./src/moteurRegles');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurChiffrement = require('./src/adaptateurs/adaptateurChiffrement');
const adaptateurEnvironnement = require('./src/adaptateurs/adaptateurEnvironnement');
const adaptateurGestionErreur = adaptateurEnvironnement.sentry().dsn()
  ? require('./src/adaptateurs/adaptateurGestionErreurSentry')
  : require('./src/adaptateurs/adaptateurGestionErreurVide');
const adaptateurHorloge = require('./src/adaptateurs/adaptateurHorloge');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = adaptateurEnvironnement.sendinblue().clefAPI()
  ? require('./src/adaptateurs/adaptateurMailSendinblue')
  : require('./src/adaptateurs/adaptateurMailSurConsole');
const adaptateurPdf = require('./src/adaptateurs/adaptateurPdf');

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel();
const moteurRegles = new MoteurRegles(referentiel);
const depotDonnees = DepotDonnees.creeDepot();
const middleware = Middleware({
  adaptateurChiffrement,
  adaptateurEnvironnement,
  adaptateurJWT,
  depotDonnees,
  login: process.env.LOGIN_ADMIN,
  motDePasse: process.env.MOT_DE_PASSE_ADMIN,
});

const serveur = MSS.creeServeur(
  depotDonnees,
  middleware,
  referentiel,
  moteurRegles,
  adaptateurMail,
  adaptateurPdf,
  adaptateurHorloge,
  adaptateurGestionErreur,
);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
