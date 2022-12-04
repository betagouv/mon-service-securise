const DepotDonnees = require('./src/depotDonnees');
const Middleware = require('./src/middleware');
const MoteurRegles = require('./src/moteurRegles');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurChiffrement = require('./src/adaptateurs/adaptateurChiffrement');
const adaptateurEnvironnement = require('./src/adaptateurs/adaptateurEnvironnement');
const adaptateurEquations = require('./src/adaptateurs/adaptateurEquations');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMailSmtp = require('./src/adaptateurs/adaptateurMailSmtp');
const adaptateurMailSendinblue = require('./src/adaptateurs/adaptateurMailSendinblue');
const adaptateurPdfLatex = require('./src/adaptateurs/adaptateurPdfLatex');

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel();
const moteurRegles = new MoteurRegles(referentiel);
const depotDonnees = DepotDonnees.creeDepot();
const middleware = Middleware({
  adaptateurChiffrement,
  adaptateurJWT,
  depotDonnees,
  login: process.env.LOGIN_ADMIN,
  motDePasse: process.env.MOT_DE_PASSE_ADMIN,
});
const adaptateurMail = process.env.AVEC_MAIL_VIA_SENDINBLUE
  ? adaptateurMailSendinblue : adaptateurMailSmtp;

const serveur = MSS.creeServeur(
  depotDonnees,
  middleware,
  referentiel,
  moteurRegles,
  adaptateurEnvironnement,
  adaptateurEquations,
  adaptateurMail,
  adaptateurPdfLatex,
);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
