const axios = require('axios');
const expect = require('expect.js');

const { depotVide } = require('../depots/depotVide');
const adaptateurGestionErreurVide = require('../../src/adaptateurs/adaptateurGestionErreurVide');
const adaptateurMailMemoire = require('../../src/adaptateurs/adaptateurMailMemoire');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss.ts');
const Referentiel = require('../../src/referentiel');
const middleware = require('../mocks/middleware');
const { fabriqueProcedures } = require('../../src/routes/procedures');
const {
  fabriqueInscriptionUtilisateur,
} = require('../../src/modeles/inscriptionUtilisateur');
const adaptateurJWTParDefaut = require('../../src/adaptateurs/adaptateurJWT');
const adaptateurProfilAnssiParDefaut = require('../../src/adaptateurs/adaptateurProfilAnssiVide');
const { fabriqueServiceCgu } = require('../../src/serviceCgu');
const {
  fabriqueServiceGestionnaireSession,
} = require('../../src/session/serviceGestionnaireSession');

const testeurMss = () => {
  let serviceAnnuaire;
  let serviceGestionnaireSession;
  let serviceSupervision;
  let serviceCgu;
  let adaptateurHorloge;
  let adaptateurCmsCrisp;
  let adaptateurMail;
  let adaptateurGestionErreur;
  let adaptateurPdf;
  let adaptateurCsv;
  let adaptateurZip;
  let adaptateurTracking;
  let adaptateurProtection;
  let adaptateurJournal;
  let adaptateurOidc;
  let adaptateurEnvironnement;
  let adaptateurStatistiques;
  let adaptateurJWT;
  let adaptateurProfilAnssi;
  let adaptateurControleFichier;
  let adaptateurXLS;
  let depotDonnees;
  let moteurRegles;
  let referentiel;
  let procedures;
  let inscriptionUtilisateur;
  let serveur;

  const verifieSessionDeposee = (reponse, suite) => {
    const valeurHeader = reponse.headers['set-cookie'][0];
    expect(valeurHeader).to.match(
      /^session=.+; path=\/; samesite=strict; httponly$/
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
    serviceSupervision = {};
    adaptateurHorloge = {
      maintenant: () => new Date(),
    };
    const contenuCrisp = { contenuMarkdown: 'Un contenu', titre: 'Un titre' };
    adaptateurCmsCrisp = {
      recuperePromouvoir: async () => contenuCrisp,
      recupereDevenirAmbassadeur: async () => contenuCrisp,
      recupereFaireConnaitreMSS: async () => contenuCrisp,
      recupereSectionsBlog: async () => [],
      recupereArticlesBlog: async () => [],
      recupereArticleBlog: async () => contenuCrisp,
      recupereRoadmap: async () => contenuCrisp,
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
    adaptateurEnvironnement = {
      mss: () => ({
        urlBase: () => 'http://localhost:1234',
      }),
      trustProxy: () => 0,
    };
    adaptateurProtection = {
      protectionCsrf: () => (_requete, _reponse, suite) => suite(),
      protectionLimiteTrafic: () => (_requete, _reponse, suite) => suite(),
      protectionLimiteTraficEndpointSensible:
        () => (_requete, _reponse, suite) =>
          suite(),
    };
    adaptateurJournal = {
      consigneEvenement: async () => {},
    };
    adaptateurOidc = {};
    adaptateurStatistiques = {
      recupereStatistiques: async () => {},
    };
    adaptateurJWT = adaptateurJWTParDefaut;
    adaptateurProfilAnssi = adaptateurProfilAnssiParDefaut;
    middleware.reinitialise({});
    referentiel = Referentiel.creeReferentielVide();
    procedures = fabriqueProcedures({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    });
    serviceCgu = fabriqueServiceCgu({ referentiel });
    serviceGestionnaireSession = fabriqueServiceGestionnaireSession();
    adaptateurControleFichier = {
      verifieFichierXls: async () => Buffer.from([]),
    };
    adaptateurXLS = {
      extraisTeleversementServices: async () => {},
    };

    moteurRegles = new MoteurRegles(referentiel);
    depotVide()
      .then((depot) => {
        depotDonnees = depot;
        inscriptionUtilisateur = fabriqueInscriptionUtilisateur({
          adaptateurMail,
          adaptateurTracking,
          depotDonnees,
        });
        serveur = MSS.creeServeur({
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
          adaptateurJournal,
          adaptateurOidc,
          adaptateurEnvironnement,
          adaptateurStatistiques,
          adaptateurJWT,
          adaptateurProfilAnssi,
          adaptateurControleFichier,
          adaptateurXLS,
          serviceSupervision,
          serviceGestionnaireSession,
          serviceCgu,
          procedures,
          inscriptionUtilisateur,
          avecCookieSecurise: false,
          avecPageErreur: false,
        });
        serveur.ecoute(1234, done);
      })
      .catch(done);
  };

  const arrete = () => serveur.arreteEcoute();

  return {
    serviceAnnuaire: () => serviceAnnuaire,
    serviceGestionnaireSession: () => serviceGestionnaireSession,
    serviceSupervision: () => serviceSupervision,
    adaptateurGestionErreur: () => adaptateurGestionErreur,
    adaptateurHorloge: () => adaptateurHorloge,
    adaptateurMail: () => adaptateurMail,
    adaptateurPdf: () => adaptateurPdf,
    adaptateurCsv: () => adaptateurCsv,
    adaptateurZip: () => adaptateurZip,
    adaptateurTracking: () => adaptateurTracking,
    adaptateurJournalMSS: () => adaptateurJournal,
    adaptateurCmsCrisp: () => adaptateurCmsCrisp,
    adaptateurOidc: () => adaptateurOidc,
    adaptateurStatistiques: () => adaptateurStatistiques,
    adaptateurJWT: () => adaptateurJWT,
    adaptateurProfilAnssi: () => adaptateurProfilAnssi,
    adaptateurControleFichier: () => adaptateurControleFichier,
    adaptateurXLS: () => adaptateurXLS,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    moteurRegles: () => moteurRegles,
    referentiel: () => referentiel,
    procedures: () => procedures,
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieSessionDeposee,
  };
};

module.exports = testeurMss;
