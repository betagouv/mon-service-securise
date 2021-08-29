const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Middleware = require('./src/middleware');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = require('./src/adaptateurs/adaptateurMail');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');

const port = process.env.PORT || 3000;
const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(process.env.NODE_ENV || 'development');
const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
const depotDonnees = DepotDonnees.creeDepot({
  adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel,
});
const middleware = Middleware({
  adaptateurJWT,
  depotDonnees,
  login: process.env.LOGIN_ADMIN,
  motDePasse: process.env.MOT_DE_PASSE_ADMIN,
});
const serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, adaptateurMail);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
