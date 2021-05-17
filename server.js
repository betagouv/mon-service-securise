const MSS = require("./src/mss");

const port = process.env.PORT || 3000;
const serveur = MSS.creeServeur();

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
