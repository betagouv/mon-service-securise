const axios = require('axios');
const expect = require('expect.js');

const { depotVide } = require('../depots/depotVide');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');

const middleware = require('../mocks/middleware');

const testeurMss = () => {
  let adaptateurEnvironnement;
  let adaptateurEquations;
  let adaptateurMail;
  let adaptateurPdf;
  let depotDonnees;
  let moteurRegles;
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
    adaptateurEnvironnement = {};
    adaptateurEquations = {};
    adaptateurMail = {};
    adaptateurPdf = {};
    middleware.reinitialise();
    referentiel = Referentiel.creeReferentielVide();
    moteurRegles = new MoteurRegles(referentiel);
    depotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(
          depotDonnees,
          middleware,
          referentiel,
          moteurRegles,
          adaptateurEnvironnement,
          adaptateurEquations,
          adaptateurMail,
          adaptateurPdf,
          false,
        );
        serveur.ecoute(1234, done);
      });
  };

  const arrete = () => (serveur.arreteEcoute());

  return {
    adaptateurEnvironnement: () => adaptateurEnvironnement,
    adaptateurEquations: () => adaptateurEquations,
    adaptateurMail: () => adaptateurMail,
    adaptateurPdf: () => adaptateurPdf,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    moteurRegles: () => moteurRegles,
    referentiel: () => referentiel,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieJetonDepose,
  };
};

module.exports = testeurMss;
