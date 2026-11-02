import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueReporting } from '../../src/adaptateurs/adaptateurReporting.interface.js';
import * as DepotDonnees from '../../src/depotDonnees.js';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { fabriqueAdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.js';
import { fabriqueAdaptateurChiffrement } from '../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { fabriqueReferentiel } from '../../src/fabriqueReferentiel.js';
import { fabriqueServiceCgu } from '../../src/serviceCgu.js';
import { RapportMensuel } from '../../src/notifications/rapportMensuel.js';
import * as adaptateurRechercheEntrepriseAPI from '../../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import fabriqueAdaptateurJournalMSS from '../../src/adaptateurs/fabriqueAdaptateurJournalMSS.js';

const maintenant = () =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

const intervalleDuMoisPrecedent = (aujourdhui: Date) => {
  const annee = aujourdhui.getUTCFullYear();
  const mois = aujourdhui.getUTCMonth();

  return {
    debut: new Date(Date.UTC(annee, mois - 1, 1)),
    fin: new Date(Date.UTC(annee, mois, 0)),
  };
};

const tache = async (): Promise<string[]> => {
  const trace: string[] = [];

  const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
  const adaptateurJWT = fabriqueAdaptateurJWT();
  const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
  const busEvenements = new BusEvenements({ adaptateurGestionErreur });
  const referentiel = fabriqueReferentiel().v1();
  const referentielV2 = fabriqueReferentiel().v2();
  const serviceCgu = fabriqueServiceCgu({ referentiel });
  const adaptateurJournal = fabriqueAdaptateurJournalMSS();
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

  const rapportMensuel = new RapportMensuel({
    depotDonnees,
    adaptateurChiffrement,
    adaptateurJournal,
  });

  const donnees = await rapportMensuel.donnees(
    intervalleDuMoisPrecedent(new Date())
  );

  trace.push(`👷‍♀️ Il faut envoyer le rapport avec les données ${donnees}`);

  return trace;
};

const main = async () => {
  const reporting = fabriqueReporting();
  const rapport: string[] = [];
  let codeRetour = 0;

  try {
    rapport.push("#### 🗒️ Reporting de l'envoi du rapport MENSUEL\n---");
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
