const axios = require('axios');
const expect = require('expect.js');

const { depotVide } = require('../depots/depotVide');
const adaptateurGestionErreurVide = require('../../src/adaptateurs/adaptateurGestionErreurVide');
const adaptateurMailMemoire = require('../../src/adaptateurs/adaptateurMailMemoire');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss');
const Referentiel = require('../../src/referentiel');
const middleware = require('../mocks/middleware');
const { fabriqueProcedures } = require('../../src/routes/procedures');

const testeurMss = () => {
  let serviceAnnuaire;
  let adaptateurHorloge;
  let adaptateurCmsCrisp;
  let adaptateurMail;
  let adaptateurGestionErreur;
  let adaptateurPdf;
  let adaptateurCsv;
  let adaptateurZip;
  let adaptateurTracking;
  let adaptateurProtection;
  let adaptateurJournalMSS;
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

  const verifieRequeteGenereErreurHTTP = async (
    status,
    messageErreur,
    requete
  ) => {
    try {
      await axios(requete);
      expect().fail('Réponse OK inattendue');
    } catch (erreur) {
      expect(erreur.response?.status).to.equal(status);
      expect(erreur.response?.data).to.eql(messageErreur);
    }
  };

  const initialise = (done) => {
    serviceAnnuaire = {};
    adaptateurHorloge = {
      maintenant: () => new Date(),
    };
    const contenuCrisp = { contenuMarkdown: 'Un contenu', titre: 'Un titre' };
    adaptateurCmsCrisp = {
      recupereNouveautes: async () => contenuCrisp,
      recupereDevenirAmbassadeur: async () => contenuCrisp,
      recupereFaireConnaitreMSS: async () => contenuCrisp,
    };
    adaptateurMail = adaptateurMailMemoire.fabriqueAdaptateurMailMemoire();
    adaptateurPdf = {
      genereAnnexes: async () => 'PDF Annexe',
      genereDossierDecision: async () => 'PDF Dossier decision',
      genereSyntheseSecurite: async () => 'PDF Synthese securite',
      genereTamponHomologation: async () => 'PNG Tampon homologation',
    };
    adaptateurCsv = {};
    adaptateurZip = { genereArchive: () => Promise.resolve('Archive ZIP') };
    adaptateurGestionErreur = adaptateurGestionErreurVide;
    adaptateurTracking = {
      envoieTrackingConnexion: () => Promise.resolve(),
      envoieTrackingInscription: () => Promise.resolve(),
      envoieTrackingInvitationContributeur: () => Promise.resolve(),
      envoieTrackingNouveauServiceCree: () => Promise.resolve(),
    };
    adaptateurProtection = {
      protectionCsrf: () => (_requete, _reponse, suite) => suite(),
      protectionLimiteTrafic: () => (_requete, _reponse, suite) => suite(),
      protectionLimiteTraficEndpointSensible:
        () => (_requete, _reponse, suite) =>
          suite(),
    };
    adaptateurJournalMSS = { consigneEvenement: async () => {} };
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
          adaptateurCmsCrisp,
          adaptateurMail,
          adaptateurPdf,
          adaptateurHorloge,
          adaptateurGestionErreur,
          serviceAnnuaire,
          adaptateurCsv,
          adaptateurZip,
          adaptateurTracking,
          adaptateurProtection,
          adaptateurJournalMSS,
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
    adaptateurGestionErreur: () => adaptateurGestionErreur,
    adaptateurHorloge: () => adaptateurHorloge,
    adaptateurMail: () => adaptateurMail,
    adaptateurPdf: () => adaptateurPdf,
    adaptateurCsv: () => adaptateurCsv,
    adaptateurZip: () => adaptateurZip,
    adaptateurTracking: () => adaptateurTracking,
    adaptateurJournalMSS: () => adaptateurJournalMSS,
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
