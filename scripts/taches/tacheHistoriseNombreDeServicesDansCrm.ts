import * as DepotDonnees from '../../src/depotDonnees.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import * as adaptateurRechercheEntrepriseAPI from '../../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurReportingCrm } from '../../src/adaptateurs/fabriqueAdaptateurReportingCrm.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { fabriqueReferentiel } from '../../src/fabriqueReferentiel.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { fabriqueReportingTechnique } from '../../src/adaptateurs/adaptateurReportingTechnique.interface.js';
import { HistoriseNombreDeServicesParEntiteDansCrm } from '../../src/crm/historiseNombreDeServicesParEntiteDansCrm.js';

const maintenant = () =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

const tache = async () => {
  const trace: string[] = [];

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

  const services = await depotDonnees.tousLesServices();
  trace.push(`🗂️ ${services.length} service(s) à historiser`);

  const historise = new HistoriseNombreDeServicesParEntiteDansCrm({
    adaptateurCrm: fabriqueAdaptateurReportingCrm(),
    adaptateurGestionErreur,
  });
  await historise.execute(services);

  trace.push('✅ Historisation terminée');

  return trace;
};

const main = async () => {
  const reporting = fabriqueReportingTechnique();
  const rapport: string[] = [];
  let codeRetour = 0;

  try {
    rapport.push(
      "#### 🗒️ Reporting de l'historisation du nombre de services dans le CRM\n---"
    );
    rapport.push(`⏰ Début : ${maintenant()}`);

    const rapportTache = await tache();
    rapport.push(...rapportTache);
  } catch (error: unknown) {
    const e = error as Error;
    fabriqueAdaptateurGestionErreur().logueErreur(e);
    rapport.push(`💥 Erreur ! Elle a été envoyée dans Sentry… : ${e.message}`);
    codeRetour = 1;
  } finally {
    rapport.push(`⏰ Fin : ${maintenant()}`);
    await reporting.envoie(rapport);
  }

  return codeRetour;
};

main().then((code) => process.exit(code));
