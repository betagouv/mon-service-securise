const donnees = require('./jeuDonnees');
const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Middleware = require('./src/middleware');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
const depotDonnees = DepotDonnees.creeDepot(donnees, {
  adaptateurJWT, adaptateurUUID, referentiel,
});
const middleware = Middleware(
  adaptateurJWT,
  process.env.LOGIN_ADMIN,
  process.env.MOT_DE_PASSE_ADMIN
);
const serveur = MSS.creeServeur(depotDonnees, middleware, referentiel);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
