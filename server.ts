import { fabriqueAdaptateurProfilAnssi } from './src/adaptateurs/fabriqueAdaptateurProfilAnssi';

const Middleware = require('./src/http/middleware');
const DepotDonnees = require('./src/depotDonnees');
const MoteurRegles = require('./src/moteurRegles');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const { fabriqueAnnuaire } = require('./src/annuaire/serviceAnnuaire');
const adaptateurCsv = require('./src/adaptateurs/adaptateurCsv');
const adaptateurEnvironnement = require('./src/adaptateurs/adaptateurEnvironnement');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./src/adaptateurs/fabriqueAdaptateurGestionErreur');
const fabriqueAdaptateurTracking = require('./src/adaptateurs/fabriqueAdaptateurTracking');
const adaptateurHorloge = require('./src/adaptateurs/adaptateurHorloge');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = adaptateurEnvironnement.sendinblue().clefAPIEmail()
  ? require('./src/adaptateurs/adaptateurMailSendinblue')
  : require('./src/adaptateurs/adaptateurMailMemoire').fabriqueAdaptateurMailMemoire();
const adaptateurPdf = require('./src/adaptateurs/adaptateurPdf');
const adaptateurControleFichier = require('./src/adaptateurs/adaptateurControleFichier');

const adaptateurZip = require('./src/adaptateurs/adaptateurZip');
const {
  adaptateurProtection,
} = require('./src/adaptateurs/adaptateurProtection');
const { fabriqueProcedures } = require('./src/routes/procedures');
const BusEvenements = require('./src/bus/busEvenements');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const { cableTousLesAbonnes } = require('./src/bus/cablage');
const {
  fabriqueAdaptateurChiffrement,
} = require('./src/adaptateurs/fabriqueAdaptateurChiffrement');
const adaptateurRechercheEntrepriseAPI = require('./src/adaptateurs/adaptateurRechercheEntrepriseAPI');
const adaptateurCmsCrisp = require('./src/adaptateurs/adaptateurCmsCrisp');
const {
  fabriqueAdaptateurOidc,
} = require('./src/adaptateurs/fabriqueAdaptateurOidc');
const {
  fabriqueInscriptionUtilisateur,
} = require('./src/modeles/inscriptionUtilisateur');
const fabriqueAdaptateurSupervision = require('./src/adaptateurs/fabriqueAdaptateurSupervision');
const adaptateurStatistiques = require('./src/adaptateurs/adaptateurStatistiquesMetabase');
const { fabriqueServiceCgu } = require('./src/serviceCgu');
const ServiceSupervision = require('./src/supervision/serviceSupervision');
const {
  fabriqueServiceGestionnaireSession,
} = require('./src/session/serviceGestionnaireSession');
const {
  fabriqueServiceVerificationCoherenceSels,
} = require('./src/sel/serviceVerificationCoherenceSels');

const adaptateurProfilAnssi = fabriqueAdaptateurProfilAnssi();
const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurTracking = fabriqueAdaptateurTracking();
const adaptateurJournal = fabriqueAdaptateurJournalMSS();
const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
const adaptateurOidc = fabriqueAdaptateurOidc();
const adaptateurSupervision = fabriqueAdaptateurSupervision();
const busEvenements = new BusEvenements({ adaptateurGestionErreur });
const port = process.env.PORT || 3000;

const referentiel = Referentiel.creeReferentiel();
const moteurRegles = new MoteurRegles(referentiel);
const serviceCgu = fabriqueServiceCgu({ referentiel });
const depotDonnees = DepotDonnees.creeDepot({
  adaptateurChiffrement,
  adaptateurEnvironnement,
  adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
  adaptateurJWT,
  serviceCgu,
  busEvenements,
});

const serviceAnnuaire = fabriqueAnnuaire({
  adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
  depotDonnees,
});

const serviceGestionnaireSession = fabriqueServiceGestionnaireSession();

const serviceVerificationCoherenceSels =
  fabriqueServiceVerificationCoherenceSels({
    adaptateurEnvironnement,
    depotDonnees,
  });

cableTousLesAbonnes(busEvenements, {
  adaptateurHorloge,
  adaptateurTracking,
  adaptateurJournal,
  adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
  adaptateurMail,
  adaptateurSupervision,
  depotDonnees,
  referentiel,
});

const middleware = Middleware({
  adaptateurHorloge,
  adaptateurEnvironnement,
  adaptateurJWT,
  adaptateurProtection,
  adaptateurGestionErreur,
  depotDonnees,
  adaptateurChiffrement,
});

const procedures = fabriqueProcedures({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
  busEvenements,
});

const inscriptionUtilisateur = fabriqueInscriptionUtilisateur({
  adaptateurMail,
  adaptateurTracking,
  depotDonnees,
});

const serviceSupervision = new ServiceSupervision({
  depotDonnees,
  adaptateurSupervision,
});

serviceVerificationCoherenceSels.verifieLaCoherenceDesSels().then(() => {
  const serveur = MSS.creeServeur({
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
    adaptateurControleFichier,
    adaptateurProfilAnssi,
    serviceGestionnaireSession,
    serviceSupervision,
    serviceCgu,
    procedures,
    inscriptionUtilisateur,
  });

  serveur.ecoute(port, () => {
    /* eslint-disable no-console */
    console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);
    /* eslint-enable no-console */
  });
});
