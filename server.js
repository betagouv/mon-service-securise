const MSS = require('./src/mss');
const DepotDonnees = require('./src/depotDonnees');
const donnees = require('./jeuDonnees');

const port = process.env.PORT || 3000;
const depotDonnees = DepotDonnees.creeDepot(donnees);
const serveur = MSS.creeServeur(depotDonnees);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
