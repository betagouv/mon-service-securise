import { fabriqueAdaptateurProfilAnssi } from './src/adaptateurs/fabriqueAdaptateurProfilAnssi.js';
import CmsCrisp from './src/cms/cmsCrisp.js';
import Middleware from './src/http/middleware.js';
import * as DepotDonnees from './src/depotDonnees.js';
import MoteurRegles from './src/moteurRegles.js';
import * as MSS from './src/mss.js';
import * as Referentiel from './src/referentiel.js';
import { fabriqueAnnuaire } from './src/annuaire/serviceAnnuaire.js';
import * as adaptateurCsv from './src/adaptateurs/adaptateurCsv.js';
import * as adaptateurEnvironnement from './src/adaptateurs/adaptateurEnvironnement.js';
import { fabriqueAdaptateurGestionErreur } from './src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import fabriqueAdaptateurTracking from './src/adaptateurs/fabriqueAdaptateurTracking.js';
import { fabriqueAdaptateurHorloge } from './src/adaptateurs/adaptateurHorloge.js';
import { fabriqueAdaptateurJWT } from './src/adaptateurs/adaptateurJWT.js';
import * as adaptateurMailSendinblue from './src/adaptateurs/adaptateurMailSendinblue.js';
import * as adaptateurPdf from './src/adaptateurs/adaptateurPdf.js';
import * as lecteurDeFormData from './src/http/lecteurDeFormData.js';
import * as adaptateurTeleversementServices from './src/adaptateurs/adaptateurTeleversementServices.xls.js';
import * as adaptateurTeleversementModelesMesureSpecifique from './src/adaptateurs/adaptateurTeleversementModelesMesureSpecifique.xls.js';
import * as adaptateurZip from './src/adaptateurs/adaptateurZip.js';
import { adaptateurProtection } from './src/adaptateurs/adaptateurProtection.js';
import { fabriqueProcedures } from './src/routes/procedures.js';
import BusEvenements from './src/bus/busEvenements.js';
import fabriqueAdaptateurJournalMSS from './src/adaptateurs/fabriqueAdaptateurJournalMSS.js';
import { cableTousLesAbonnes } from './src/bus/cablage.js';
import { fabriqueAdaptateurChiffrement } from './src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import * as adaptateurRechercheEntrepriseAPI from './src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurOidc } from './src/adaptateurs/fabriqueAdaptateurOidc.js';
import { fabriqueInscriptionUtilisateur } from './src/modeles/inscriptionUtilisateur.js';
import fabriqueAdaptateurSupervision from './src/adaptateurs/fabriqueAdaptateurSupervision.js';
import * as adaptateurStatistiques from './src/adaptateurs/adaptateurStatistiquesMetabase.js';
import { fabriqueServiceCgu } from './src/serviceCgu.js';
import ServiceSupervision from './src/supervision/serviceSupervision.js';
import { fabriqueServiceGestionnaireSession } from './src/session/serviceGestionnaireSession.js';
import { fabriqueServiceVerificationCoherenceSels } from './src/sel/serviceVerificationCoherenceSels.js';
import { sendinblue } from './src/adaptateurs/adaptateurEnvironnement.js';
import { fabriqueAdaptateurMailMemoire } from './src/adaptateurs/adaptateurMailMemoire.js';

const adaptateurHorloge = fabriqueAdaptateurHorloge();
const adaptateurProfilAnssi = fabriqueAdaptateurProfilAnssi();
const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurJWT = fabriqueAdaptateurJWT();
const adaptateurTracking = fabriqueAdaptateurTracking();
const adaptateurJournal = fabriqueAdaptateurJournalMSS();
const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
const adaptateurOidc = fabriqueAdaptateurOidc();
const adaptateurSupervision = fabriqueAdaptateurSupervision();
const adaptateurMail = sendinblue().clefAPIEmail()
  ? adaptateurMailSendinblue
  : fabriqueAdaptateurMailMemoire();

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

const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });

serviceVerificationCoherenceSels.verifieLaCoherenceDesSels().then(() => {
  const serveur = MSS.creeServeur({
    depotDonnees,
    busEvenements,
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
    adaptateurTeleversementServices,
    adaptateurTeleversementModelesMesureSpecifique,
    adaptateurProfilAnssi,
    cmsCrisp,
    lecteurDeFormData,
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
