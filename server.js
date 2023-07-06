const Middleware = require('./src/http/middleware');
const DepotDonnees = require('./src/depotDonnees');
const MoteurRegles = require('./src/moteurRegles');
const MSS = require('./src/mss');
const Referentiel = require('./src/referentiel');
const adaptateurAnnuaire = require('./src/adaptateurs/adaptateurAnnuaire');
const adaptateurChiffrement = require('./src/adaptateurs/adaptateurChiffrement');
const adaptateurCsv = require('./src/adaptateurs/adaptateurCsv');
const adaptateurEnvironnement = require('./src/adaptateurs/adaptateurEnvironnement');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./src/adaptateurs/fabriqueAdaptateurGestionErreur');
const fabriqueAdaptateurTracking = require('./src/adaptateurs/fabriqueAdaptateurTracking');

const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurHorloge = require('./src/adaptateurs/adaptateurHorloge');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const adaptateurMail = adaptateurEnvironnement.sendinblue().clefAPIEmail()
  ? require('./src/adaptateurs/adaptateurMailSendinblue')
  : require('./src/adaptateurs/adaptateurMailMemoire');
const adaptateurPdf = require('./src/adaptateurs/adaptateurPdf');
const adaptateurZip = require('./src/adaptateurs/adaptateurZip');
const {
  adaptateurProtection,
} = require('./src/adaptateurs/adaptateurProtection');

const adaptateurTracking = fabriqueAdaptateurTracking();

const port = process.env.PORT || 3000;
const referentiel = Referentiel.creeReferentiel();
const moteurRegles = new MoteurRegles(referentiel);
const depotDonnees = DepotDonnees.creeDepot();
const middleware = Middleware({
  adaptateurChiffrement,
  adaptateurEnvironnement,
  adaptateurJWT,
  depotDonnees,
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
  adaptateurAnnuaire,
  adaptateurCsv,
  adaptateurZip,
  adaptateurTracking,
  adaptateurProtection
);

serveur.ecoute(port, () => {
  /* eslint-disable no-console */

  console.log(`MonServiceSécurisé est démarré et écoute le port ${port} !…`);

  /* eslint-enable no-console */
});
