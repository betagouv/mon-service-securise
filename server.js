const DepotDonnees = require('./src/depotDonnees');
const Middleware = require('./src/middleware');
const MoteurRegles = require('./src/moteurRegles');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurChiffrement = require('./src/adaptateurs/adaptateurChiffrement');
const adaptateurEquations = require('./src/adaptateurs/adaptateurEquations');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = require('./src/adaptateurs/adaptateurMail');

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
const serveur = MSS.creeServeur(
  depotDonnees,
  middleware,
  referentiel,
  moteurRegles,
  adaptateurEquations,
  adaptateurMail,
);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
