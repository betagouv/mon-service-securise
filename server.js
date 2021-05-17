const MSS = require("./src/mss.js");

const port = process.env.PORT || 3000;
const serveur = MSS.creeServeur();

serveur.ecoute(port, () => {
  console.log(`Mon Service Sécurisé est démarré et écoute le port ${port} !…`);
});
