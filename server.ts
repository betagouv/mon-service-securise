import fabriqueAdaptateurProfilAnssi from './src/adaptateurs/fabriqueAdaptateurProfilAnssi';
import CmsCrisp from './src/cms/cmsCrisp';

import Middleware from './src/http/middleware';
import DepotDonnees from './src/depotDonnees';
import MoteurRegles from './src/moteurRegles';
import MSS from './src/mss';
import Referentiel from './src/referentiel';
import { fabriqueAnnuaire } from './src/annuaire/serviceAnnuaire';
import adaptateurCsv from './src/adaptateurs/adaptateurCsv';
import adaptateurEnvironnement from './src/adaptateurs/adaptateurEnvironnement';
import { fabriqueAdaptateurGestionErreur } from './src/adaptateurs/fabriqueAdaptateurGestionErreur';
import fabriqueAdaptateurTracking from './src/adaptateurs/fabriqueAdaptateurTracking';
import adaptateurHorloge from './src/adaptateurs/adaptateurHorloge';
import { fabriqueAdaptateurJWT } from './src/adaptateurs/adaptateurJWT';
import adaptateurMailSendinblue from './src/adaptateurs/adaptateurMailSendinblue';
import adaptateurMailMemoire from './src/adaptateurs/adaptateurMailMemoire';

const adaptateurMail = adaptateurEnvironnement.sendinblue().clefAPIEmail()
  ? adaptateurMailSendinblue
  : adaptateurMailMemoire.fabriqueAdaptateurMailMemoire();
import adaptateurPdf from './src/adaptateurs/adaptateurPdf';
import lecteurDeFormData from './src/http/lecteurDeFormData';
import adaptateurTeleversementServices from './src/adaptateurs/adaptateurTeleversementServices.xls';
import adaptateurTeleversementModelesMesureSpecifique from './src/adaptateurs/adaptateurTeleversementModelesMesureSpecifique.xls';

import adaptateurZip from './src/adaptateurs/adaptateurZip';
import { adaptateurProtection } from './src/adaptateurs/adaptateurProtection';
import { fabriqueProcedures } from './src/routes/procedures';
import BusEvenements from './src/bus/busEvenements';
import fabriqueAdaptateurJournalMSS from './src/adaptateurs/fabriqueAdaptateurJournalMSS';
import { cableTousLesAbonnes } from './src/bus/cablage';
import { fabriqueAdaptateurChiffrement } from './src/adaptateurs/fabriqueAdaptateurChiffrement';
import adaptateurRechercheEntrepriseAPI from './src/adaptateurs/adaptateurRechercheEntrepriseAPI';
import { fabriqueAdaptateurOidc } from './src/adaptateurs/fabriqueAdaptateurOidc';
import { fabriqueInscriptionUtilisateur } from './src/modeles/inscriptionUtilisateur';
import fabriqueAdaptateurSupervision from './src/adaptateurs/fabriqueAdaptateurSupervision';
import adaptateurStatistiques from './src/adaptateurs/adaptateurStatistiquesMetabase';
import { fabriqueServiceCgu } from './src/serviceCgu';
import ServiceSupervision from './src/supervision/serviceSupervision';
import { fabriqueServiceGestionnaireSession } from './src/session/serviceGestionnaireSession';
import { fabriqueServiceVerificationCoherenceSels } from './src/sel/serviceVerificationCoherenceSels';

const adaptateurProfilAnssi = fabriqueAdaptateurProfilAnssi();
const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurJWT = fabriqueAdaptateurJWT();
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
    adaptateurTracking,
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
