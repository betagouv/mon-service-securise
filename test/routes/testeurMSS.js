import expect from 'expect.js';
import supertest from 'supertest';
import { depotVide } from '../depots/depotVide.js';
import * as adaptateurMailMemoire from '../../src/adaptateurs/adaptateurMailMemoire.js';
import MoteurRegles from '../../src/moteurRegles/v1/moteurRegles.js';
import * as MSS from '../../src/mss.js';
import * as Referentiel from '../../src/referentiel.js';
import middleware from '../mocks/middleware.js';
import { fabriqueProcedures } from '../../src/routes/procedures.js';
import { fabriqueInscriptionUtilisateur } from '../../src/modeles/inscriptionUtilisateur.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { fabriqueServiceGestionnaireSession } from '../../src/session/serviceGestionnaireSession.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import { fabriqueAdaptateurProfilAnssiVide } from '../../src/adaptateurs/adaptateurProfilAnssiVide.js';
import { fabriqueAdaptateurGestionErreurVide } from '../../src/adaptateurs/adaptateurGestionErreurVide.js';
import { fabriqueAdaptateurHorloge } from '../../src/adaptateurs/adaptateurHorloge.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';

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
  let referentielV2;
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

  const initialise = async (
    referentielV1 = Referentiel.creeReferentielVide()
  ) => {
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
      featureFlag: () => ({
        avecDecrireV2: () => false,
      }),
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
    referentiel = referentielV1;
    referentielV2 = creeReferentielV2();
    procedures = fabriqueProcedures({
      depotDonnees,
      adaptateurMail,
      adaptateurTracking,
    });
    serviceCgu = fabriqueServiceCgu({ referentiel });
    serviceGestionnaireSession = fabriqueServiceGestionnaireSession({
      depotDonnees,
    });
    lecteurDeFormData = {
      extraisDonneesXLS: async () => Buffer.from([]),
    };
    adaptateurTeleversementServices = {
      extraisTeleversementServicesV2: async () => {},
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
        referentielV2,
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
      expect().fail(`Erreur à l'initialisation du testeur MSS : ${e}`);
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
    adaptateurEnvironnement: () => adaptateurEnvironnement,
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

export default testeurMss;
