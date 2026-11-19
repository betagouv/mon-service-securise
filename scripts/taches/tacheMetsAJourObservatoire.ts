import * as DepotDonnees from '../../src/depotDonnees.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import * as adaptateurRechercheEntrepriseAPI from '../../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { fabriqueReferentiel } from '../../src/fabriqueReferentiel.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { fabriqueReportingTechnique } from '../../src/adaptateurs/adaptateurReportingTechnique.interface.js';
import { knexJournalMSS } from '../../src/bdd/knexJournal.js';
import { knexObservatoire } from '../../src/bdd/knexObservatoire.js';
import { MiseAJourObservatoire } from '../../src/taches/metsAJourObservatoire.js';

const maintenant = () =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

const tache = async () => {
  const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
  const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
  const referentiel = fabriqueReferentiel().v1();
  const depotDonnees = DepotDonnees.creeDepot({
    adaptateurChiffrement,
    adaptateurEnvironnement,
    adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
    adaptateurJWT: fabriqueAdaptateurJWT(),
    serviceCgu: fabriqueServiceCgu({ referentiel }),
    busEvenements: new BusEvenements({ adaptateurGestionErreur }),
    referentiel,
    referentielV2: fabriqueReferentiel().v2(),
  });

  return new MiseAJourObservatoire({
    knexObservatoire,
    knexJournal: knexJournalMSS,
    depotDonnees,
    adaptateurChiffrement,
    adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
  }).execute();
};

const main = async () => {
  const reporting = fabriqueReportingTechnique();
  const rapport: string[] = [];
  let codeRetour = 0;

  try {
    rapport.push("#### 🔭 Reporting de la mise à jour de l'observatoire\n---");
    rapport.push(`⏰ Début : ${maintenant()}`);
    rapport.push(...(await tache()));
    rapport.push('✅ Mise à jour terminée');
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
