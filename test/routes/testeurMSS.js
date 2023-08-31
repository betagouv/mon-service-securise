const axios = require('axios');
const expect = require('expect.js');

const { depotVide } = require('../depots/depotVide');
const adaptateurGestionErreurVide = require('../../src/adaptateurs/adaptateurGestionErreurVide');
const adaptateurHorlogeParDefaut = require('../../src/adaptateurs/adaptateurHorloge');
const adaptateurMailMemoire = require('../../src/adaptateurs/adaptateurMailMemoire');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');
const middleware = require('../mocks/middleware');
const { fabriqueProcedures } = require('../../src/routes/procedures');

const testeurMss = () => {
  let serviceAnnuaire;
  let adaptateurHorloge;
  let adaptateurMail;
  let adaptateurPdf;
  let adaptateurCsv;
  let adaptateurZip;
  let adaptateurTracking;
  let adaptateurProtection;
  let depotDonnees;
  let moteurRegles;
  let referentiel;
  let procedures;
  let serveur;

  const verifieJetonDepose = (reponse, suite) => {
    const valeurHeader = reponse.headers['set-cookie'][0];
    expect(valeurHeader).to.match(
      /^token=.+; path=\/; expires=.+; samesite=strict; httponly$/
    );
    suite();
  };

  const verifieRequeteGenereErreurHTTP = (
    status,
    messageErreur,
    requete,
    suite
  ) => {
    axios(requete)
      .then(() => suite('Réponse OK inattendue'))
      .catch((erreur) => {
        expect(erreur.response.status).to.equal(status);
        expect(erreur.response.data).to.eql(messageErreur);
        suite();
      })
      .catch(suite);
  };

  const initialise = (done) => {
    serviceAnnuaire = {};
    adaptateurHorloge = adaptateurHorlogeParDefaut;
    adaptateurMail = adaptateurMailMemoire.fabriqueAdaptateurMailMemoire();
    adaptateurPdf = {
      genereAnnexes: () => Promise.resolve('PDF Annexe'),
      genereDossierDecision: () => Promise.resolve('PDF Dossier decision'),
      genereSyntheseSecurite: () => Promise.resolve('PDF Synthese securite'),
    };
    adaptateurCsv = {};
    adaptateurZip = { genereArchive: () => Promise.resolve('Archive ZIP') };
    adaptateurTracking = {
      envoieTrackingConnexion: () => Promise.resolve(),
      envoieTrackingInscription: () => Promise.resolve(),
      envoieTrackingInvitationContributeur: () => Promise.resolve(),
      envoieTrackingNouveauServiceCree: () => Promise.resolve(),
    };
    adaptateurProtection = {
      protectionCsrf: () => (_requete, _reponse, suite) => suite(),
      protectionLimiteTrafic: () => (_requete, _reponse, suite) => suite(),
    };
    middleware.reinitialise({});
    referentiel = Referentiel.creeReferentielVide();
    procedures = fabriqueProcedures({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    });
    moteurRegles = new MoteurRegles(referentiel);
    depotVide()
      .then((depot) => {
        depotDonnees = depot;
        serveur = MSS.creeServeur(
          depotDonnees,
          middleware,
          referentiel,
          moteurRegles,
          adaptateurMail,
          adaptateurPdf,
          adaptateurHorloge,
          adaptateurGestionErreurVide,
          serviceAnnuaire,
          adaptateurCsv,
          adaptateurZip,
          adaptateurTracking,
          adaptateurProtection,
          procedures,
          false,
          false
        );
        serveur.ecoute(1234, done);
      })
      .catch(done);
  };

  const arrete = () => serveur.arreteEcoute();

  return {
    serviceAnnuaire: () => serviceAnnuaire,
    adaptateurHorloge: () => adaptateurHorloge,
    adaptateurMail: () => adaptateurMail,
    adaptateurPdf: () => adaptateurPdf,
    adaptateurCsv: () => adaptateurCsv,
    adaptateurZip: () => adaptateurZip,
    adaptateurTracking: () => adaptateurTracking,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    moteurRegles: () => moteurRegles,
    referentiel: () => referentiel,
    procedures: () => procedures,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieJetonDepose,
  };
};

module.exports = testeurMss;
