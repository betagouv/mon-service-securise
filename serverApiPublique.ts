import * as DepotDonnees from './src/depotDonnees.js';
import * as adaptateurEnvironnement from './src/adaptateurs/adaptateurEnvironnement.js';
import { fabriqueAdaptateurGestionErreur } from './src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueAdaptateurJWT } from './src/adaptateurs/adaptateurJWT.js';
import BusEvenements from './src/bus/busEvenements.js';
import { fabriqueAdaptateurChiffrement } from './src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import * as adaptateurRechercheEntrepriseAPI from './src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueServiceCgu } from './src/serviceCgu.js';
import { fabriqueServiceVerificationCoherenceSels } from './src/sel/serviceVerificationCoherenceSels.js';
import { fabriqueReferentiel } from './src/fabriqueReferentiel.js';
import { creeServeurApiPublique } from './src/apiPublique/mssApiPublique.js';
import { fabriqueAdaptateurAuditApiPublique } from './src/adaptateurs/fabriqueAdaptateurAuditApiPublique.js';

const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurJWT = fabriqueAdaptateurJWT();
const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
const adaptateurAuditApiPublique = fabriqueAdaptateurAuditApiPublique(
  process.env.NODE_ENV!,
  adaptateurChiffrement
);

const busEvenements = new BusEvenements({ adaptateurGestionErreur });
const port = process.env.PORT || 4000;

const referentiel = fabriqueReferentiel().v1();
const referentielV2 = fabriqueReferentiel().v2();
const serviceCgu = fabriqueServiceCgu({ referentiel });
const depotDonnees = DepotDonnees.creeDepot({
  adaptateurChiffrement,
  adaptateurEnvironnement,
  adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
  adaptateurJWT,
  serviceCgu,
  busEvenements,
  referentiel,
  referentielV2,
});

const serviceVerificationCoherenceSels =
  fabriqueServiceVerificationCoherenceSels({
    adaptateurEnvironnement,
    depotDonnees,
  });

const urlBaseMss = adaptateurEnvironnement.mss().urlBase();
if (!urlBaseMss)
  throw new Error(
    "La variable d'environnement URL_BASE_MSS est requise pour la documentation de l'API publique."
  );

const maxRequetesParMinuteParCleApi = Number(
  process.env.NB_REQUETES_MAX_PAR_MINUTE_API_PUBLIQUE
);
const limiteDeDebit =
  maxRequetesParMinuteParCleApi > 0
    ? { fenetreMs: 60_000, maxParFenetre: maxRequetesParMinuteParCleApi }
    : undefined;

serviceVerificationCoherenceSels.verifieLaCoherenceDesSels().then(() => {
  adaptateurGestionErreur.initialise();

  const serveur = creeServeurApiPublique({
    depotDonnees,
    adaptateurGestionErreur,
    adaptateurAuditApiPublique,
    urlBaseMss,
    limiteDeDebit,
    trustProxy: adaptateurEnvironnement.trustProxy(),
    adaptateurEnvironnement,
  });

  serveur.ecoute(port, () => {
    /* eslint-disable no-console */
    console.log(
      `L'API publique de MonServiceSécurisé est démarrée et écoute le port ${port} !…`
    );
    /* eslint-enable no-console */
  });
});
