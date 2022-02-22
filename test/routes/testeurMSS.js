const axios = require('axios');
const expect = require('expect.js');

const DepotDonnees = require('../../src/depotDonnees');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

const testeurMss = () => {
  let depotDonnees;
  let referentiel;
  let serveur;

  const verifieRequeteGenereErreurHTTP = (status, messageErreur, requete, suite) => {
    axios(requete)
      .then(() => suite('Réponse OK inattendue'))
      .catch((erreur) => {
        expect(erreur.response.status).to.equal(status);
        expect(erreur.response.data).to.equal(messageErreur);
        suite();
      })
      .catch(suite);
  };

  const initialise = (done) => {
    middleware.reinitialise();
    referentiel = Referentiel.creeReferentielVide();
    DepotDonnees.creeDepotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, {}, false);
        serveur.ecoute(1234, done);
      });
  };

  const arrete = () => (serveur.arreteEcoute());

  return {
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    referentiel: () => referentiel,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
  };
};

module.exports = testeurMss;
