import axios from 'axios';
import expect from 'expect.js';
import { depotVide } from '../depots/depotVide.js';
import * as adaptateurGestionErreurVide from '../../src/adaptateurs/adaptateurGestionErreurVide.js';
import * as adaptateurMailMemoire from '../../src/adaptateurs/adaptateurMailMemoire.js';
import MoteurRegles from '../../src/moteurRegles.js';
import * as MSS from '../../src/mss.js';
import * as Referentiel from '../../src/referentiel.js';
import middleware from '../mocks/middleware.js';
import { fabriqueProcedures } from '../../src/routes/procedures.js';
import { fabriqueInscriptionUtilisateur } from '../../src/modeles/inscriptionUtilisateur.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import * as adaptateurProfilAnssiParDefaut from '../../src/adaptateurs/adaptateurProfilAnssiVide.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { fabriqueServiceGestionnaireSession } from '../../src/session/serviceGestionnaireSession.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';

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

  const initialise = async () => {
    try {
      serviceAnnuaire = {};
      serviceSupervision = {};
      adaptateurHorloge = { maintenant: () => new Date() };
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
      adaptateurGestionErreur = adaptateurGestionErreurVide;
      adaptateurTracking = {
        envoieTrackingConnexion: () => Promise.resolve(),
        envoieTrackingInscription: () => Promise.resolve(),
        envoieTrackingInvitationContributeur: () => Promise.resolve(),
        envoieTrackingNouveauServiceCree: () => Promise.resolve(),
      };
      adaptateurEnvironnement = {
        mss: () => ({ urlBase: () => 'http://localhost:1234' }),
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
      adaptateurStatistiques = { recupereStatistiques: async () => {} };
      adaptateurJWT = fabriqueAdaptateurJWT();
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
        adaptateurTracking,
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
      // serveur.ecoute(1234, () => console.log('🦻'));
    } catch (e) {
      expect().fail("Erreur à l'initialisation du testeur MSS.");
    }
  };

  const arrete = () => serveur.arreteEcoute();

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
    arrete,
    initialise,
    verifieRequeteGenereErreurHTTP,
    verifieSessionDeposee,
  };
};

export default testeurMss;
