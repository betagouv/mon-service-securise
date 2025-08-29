const expect = require('expect.js');
const supertest = require('supertest');

const { depotVide } = require('../depots/depotVide');
const {
  fabriqueAdaptateurGestionErreurVide,
} = require('../../src/adaptateurs/adaptateurGestionErreurVide');
const adaptateurMailMemoire = require('../../src/adaptateurs/adaptateurMailMemoire');
const MoteurRegles = require('../../src/moteurRegles');
const MSS = require('../../src/mss.ts');
const Referentiel = require('../../src/referentiel');
const middleware = require('../mocks/middleware');
const { fabriqueProcedures } = require('../../src/routes/procedures');
const {
  fabriqueInscriptionUtilisateur,
} = require('../../src/modeles/inscriptionUtilisateur');
const {
  fabriqueAdaptateurJWT,
} = require('../../src/adaptateurs/adaptateurJWT');
const {
  fabriqueAdaptateurProfilAnssiVide,
} = require('../../src/adaptateurs/adaptateurProfilAnssiVide');
const { fabriqueServiceCgu } = require('../../src/serviceCgu');
const {
  fabriqueServiceGestionnaireSession,
} = require('../../src/session/serviceGestionnaireSession');
const { fabriqueBusPourLesTests } = require('../bus/aides/busPourLesTests');
const {
  fabriqueAdaptateurHorloge,
} = require('../../src/adaptateurs/adaptateurHorloge');

const testeurMss = () => {
  let serviceAnnuaire;
  let serviceGestionnaireSession;
  let serviceSupervision;
  let serviceCgu;
  let adaptateurHorloge;
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
  let lecteurDeFormData;
  let adaptateurTeleversementServices;
  let adaptateurTeleversementModelesMesureSpecifique;
  let depotDonnees;
  let moteurRegles;
  let referentiel;
  let procedures;
  let inscriptionUtilisateur;
  let busEvenements;
  let cmsCrisp;
  let serveur;
  let app;

  const verifieSessionDeposee = (reponse) => {
    const valeurHeader = reponse.headers['set-cookie'][0];
    expect(valeurHeader).to.match(
      /^session=.+; path=\/; samesite=strict; httponly$/
    );
  };

  const verifieRequeteGenereErreurHTTP = async (
    status,
    messageErreur,
    requete
  ) => {
    let url;
    let methode;
    if (typeof requete === 'string') {
      url = requete;
      methode = 'get';
    } else {
      url = requete.url;
      methode = requete.method?.toLowerCase();
    }
    if (!(methode in supertest(app)))
      throw new Error(`La méthode ${methode} n'est pas un verbe HTTP correct`);
    const reponse = await supertest(app)[methode](url).send(requete.data);
    expect(reponse.status).to.equal(status);
    if (reponse.type === 'text/html' || reponse.type === 'text/plain')
      expect(reponse.text).to.eql(messageErreur);
    else expect(reponse.body).to.eql(messageErreur);
  };

  const initialise = async () => {
    serviceAnnuaire = {};
    serviceSupervision = {};
    adaptateurHorloge = fabriqueAdaptateurHorloge();
    const contenuCrisp = {
      contenuMarkdown: 'Un contenu',
      titre: 'Un titre',
      section: {},
      tableDesMatieres: [],
    };
    cmsCrisp = {
      recupereDevenirAmbassadeur: async () => contenuCrisp,
      recupereFaireConnaitre: async () => contenuCrisp,
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
    adaptateurGestionErreur = fabriqueAdaptateurGestionErreurVide();
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
    adaptateurJWT = fabriqueAdaptateurJWT();
    adaptateurProfilAnssi = fabriqueAdaptateurProfilAnssiVide();
    middleware.reinitialise({});
    referentiel = Referentiel.creeReferentielVide();
    procedures = fabriqueProcedures({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    });
    serviceCgu = fabriqueServiceCgu({ referentiel });
    serviceGestionnaireSession = fabriqueServiceGestionnaireSession();
    lecteurDeFormData = {
      extraisDonneesXLS: async () => Buffer.from([]),
    };
    adaptateurTeleversementServices = {
      extraisTeleversementServices: async () => {},
    };
    adaptateurTeleversementModelesMesureSpecifique = {
      extraisDonneesTeleversees: async () => {},
    };
    busEvenements = fabriqueBusPourLesTests();

    moteurRegles = new MoteurRegles(referentiel);
    try {
      depotDonnees = await depotVide();
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
        adaptateurMail,
        adaptateurPdf,
        adaptateurHorloge,
        adaptateurGestionErreur,
        serviceAnnuaire,
        adaptateurCsv,
        adaptateurZip,
        adaptateurProtection,
        adaptateurJournal,
        adaptateurOidc,
        adaptateurEnvironnement,
        adaptateurStatistiques,
        adaptateurJWT,
        adaptateurProfilAnssi,
        lecteurDeFormData,
        adaptateurTeleversementServices,
        adaptateurTeleversementModelesMesureSpecifique,
        cmsCrisp,
        serviceSupervision,
        serviceGestionnaireSession,
        serviceCgu,
        procedures,
        inscriptionUtilisateur,
        busEvenements,
        avecCookieSecurise: false,
        avecPageErreur: false,
      });
      app = serveur.app;
    } catch (e) {
      expect().fail("Erreur à l'initialisation du testeur MSS.");
    }
  };

  const get = async (url) => supertest(app).get(url);
  const patch = async (url, donnees = {}) =>
    supertest(app).patch(url).send(donnees);
  const post = async (url, donnees = {}) =>
    supertest(app).post(url).send(donnees);
  const put = async (url, donnees = {}) =>
    supertest(app).put(url).send(donnees);
  const del = async (url, donnees = {}) =>
    supertest(app).delete(url).send(donnees);
  const copy = async (url, donnees = {}) =>
    supertest(app).copy(url).send(donnees);

  return {
    app: () => app,
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
    adaptateurOidc: () => adaptateurOidc,
    adaptateurStatistiques: () => adaptateurStatistiques,
    adaptateurJWT: () => adaptateurJWT,
    adaptateurProfilAnssi: () => adaptateurProfilAnssi,
    lecteurDeFormData: () => lecteurDeFormData,
    adaptateurTeleversementServices: () => adaptateurTeleversementServices,
    adaptateurTeleversementModelesMesureSpecifique: () =>
      adaptateurTeleversementModelesMesureSpecifique,
    busEvenements: () => busEvenements,
    cmsCrisp: () => cmsCrisp,
    depotDonnees: () => depotDonnees,
    middleware: () => middleware,
    moteurRegles: () => moteurRegles,
    referentiel: () => referentiel,
    procedures: () => procedures,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieSessionDeposee,
    copy,
    get,
    patch,
    put,
    post,
    delete: del,
  };
};

module.exports = testeurMss;
