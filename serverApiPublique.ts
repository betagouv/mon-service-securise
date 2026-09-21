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

const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
const adaptateurJWT = fabriqueAdaptateurJWT();
const adaptateurChiffrement = fabriqueAdaptateurChiffrement();

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

serviceVerificationCoherenceSels.verifieLaCoherenceDesSels().then(() => {
  adaptateurGestionErreur.initialise();

  const serveur = creeServeurApiPublique({
    depotDonnees,
    adaptateurGestionErreur,
  });

  serveur.ecoute(port, () => {
    /* eslint-disable no-console */
    console.log(
      `L'API publique de MonServiceSécurisé est démarrée et écoute le port ${port} !…`
    );
    /* eslint-enable no-console */
  });
});
