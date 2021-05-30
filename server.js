const donnees = require('./jeuDonnees');
const DepotDonnees = require('./src/depotDonnees');
const MSS = require('./src/mss');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');

const port = process.env.PORT || 3000;
const depotDonnees = DepotDonnees.creeDepot(donnees, adaptateurJWT);
const serveur = MSS.creeServeur(depotDonnees, adaptateurJWT);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
