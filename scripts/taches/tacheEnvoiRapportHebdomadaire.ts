import * as DepotDonnees from '../../src/depotDonnees.js';
import { RapportHebdomadaire } from '../../src/notifications/rapportHebdomadaire.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import * as adaptateurRechercheEntrepriseAPI from '../../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { fabriqueReferentiel } from '../../src/fabriqueReferentiel.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { enCadence } from '../../src/utilitaires/pThrottle.js';
import { adaptateurMailSendinblue } from '../../src/adaptateurs/adaptateurMailSendinblue.js';

const main = async () => {
  console.log("Démarrage de l'envoi du rapport hebdomadaire");

  const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
  const adaptateurJWT = fabriqueAdaptateurJWT();
  const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
  const busEvenements = new BusEvenements({ adaptateurGestionErreur });
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

  const serviceRapport = new RapportHebdomadaire({ depotDonnees });
  const rapport = await serviceRapport.donnees();

  console.log(`${Object.keys(rapport).length} email(s) envoyé(s)`);

  const envoieUnRapport = async (destinataire: string, contenu: string) =>
    adaptateurMailSendinblue.envoieRapportHebdomadaire(destinataire, contenu);
  const envoieEnCadence = enCadence(150, envoieUnRapport);

  await Promise.all(
    Object.entries(rapport).map(async ([destinataire, contenu]) => {
      await envoieEnCadence(destinataire, contenu);
    })
  );
  console.log("Fin de l'envoi du rapport hebdomadaire");
  process.exit(0);
};

await main();
