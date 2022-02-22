const axios = require('axios');
const expect = require('expect.js');

const DepotDonnees = require('../../src/depotDonnees');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

const testeurMss = () => {
  let adaptateurMail;
  let depotDonnees;
  let referentiel;
  let serveur;

  const verifieJetonDepose = (reponse, suite) => {
    const valeurHeader = reponse.headers['set-cookie'][0];
    expect(valeurHeader).to.match(/^token=.+; path=\/; expires=.+; samesite=strict; httponly$/);
    suite();
  };

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
    adaptateurMail = {};
    middleware.reinitialise();
    referentiel = Referentiel.creeReferentielVide();
    DepotDonnees.creeDepotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, adaptateurMail, false);
        serveur.ecoute(1234, done);
      });
  };

  const arrete = () => (serveur.arreteEcoute());

  return {
    adaptateurMail: () => adaptateurMail,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    referentiel: () => referentiel,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieJetonDepose,
  };
};

module.exports = testeurMss;
