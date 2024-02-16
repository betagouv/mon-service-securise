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
const fabriqueAdaptateurPersistance = require('./src/adaptateurs/fabriqueAdaptateurPersistance');
const adaptateurRechercheEntrepriseAPI = require('./src/adaptateurs/adaptateurRechercheEntrepriseAPI');
const fabriqueAdaptateurTracking = require('./src/adaptateurs/fabriqueAdaptateurTracking');
const adaptateurHorloge = require('./src/adaptateurs/adaptateurHorloge');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = adaptateurEnvironnement.sendinblue().clefAPIEmail()
  ? require('./src/adaptateurs/adaptateurMailSendinblue')
  : require('./src/adaptateurs/adaptateurMailMemoire').fabriqueAdaptateurMailMemoire();
const adaptateurPdf = require('./src/adaptateurs/adaptateurPdf');

const adaptateurPersistance = fabriqueAdaptateurPersistance(
  process.env.NODE_ENV
);
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

const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurTracking = fabriqueAdaptateurTracking();
const adaptateurJournal = fabriqueAdaptateurJournalMSS();
const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
const serviceAnnuaire = fabriqueAnnuaire({
  adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
  adaptateurPersistance,
});
const busEvenements = new BusEvenements({ adaptateurGestionErreur });

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel();
const moteurRegles = new MoteurRegles(referentiel);

const depotDonnees = DepotDonnees.creeDepot({
  adaptateurChiffrement,
  adaptateurJournalMSS: adaptateurJournal,
  busEvenements,
});

cableTousLesAbonnes(busEvenements, {
  adaptateurTracking,
  adaptateurJournal,
  depotDonnees,
});

const middleware = Middleware({
  adaptateurChiffrement,
  adaptateurEnvironnement,
  adaptateurJWT,
  adaptateurProtection,
  depotDonnees,
});

const procedures = fabriqueProcedures({
  depotDonnees,
  adaptateurMail,
  adaptateurTracking,
});

const serveur = MSS.creeServeur(
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
  procedures
);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
