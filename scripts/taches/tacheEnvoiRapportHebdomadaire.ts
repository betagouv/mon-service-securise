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
import { fabriqueReporting } from '../../src/adaptateurs/adaptateurReporting.interface.js';

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

  const serviceRapport = new RapportHebdomadaire({ depotDonnees });
  const rapport = await serviceRapport.donnees();

  trace.push(`✉️ ${Object.keys(rapport).length} email(s) à envoyer`);

  const envoieUnRapport = async (destinataire: string, contenu: string) =>
    adaptateurMailSendinblue.envoieRapportHebdomadaire(destinataire, contenu);
  const envoieEnCadence = enCadence(150, envoieUnRapport);

  await Promise.all(
    Object.entries(rapport).map(async ([destinataire, contenu]) => {
      await envoieEnCadence(destinataire, contenu);
    })
  );

  trace.push('✅ Tout a été envoyé');

  return trace;
};

const main = async () => {
  const reporting = fabriqueReporting();
  const rapport: string[] = [];
  let codeRetour = 0;

  try {
    rapport.push("#### 🗒️ Reporting de l'envoi du rapport hebdomadaire\n---");
    rapport.push(`⏰ Début : ${maintenant()}`);

    const rapportTache = await tache();
    rapport.push(...rapportTache);
  } catch (error: unknown) {
    const e = error as Error;
    rapport.push(`💥 Erreur ! Elle a été envoyée dans Sentry… : ${e.message}`);
    codeRetour = 1;
  } finally {
    rapport.push(`⏰ Fin : ${maintenant()}`);
    await reporting.envoie(rapport);
  }

  return codeRetour;
};

main().then((code) => process.exit(code));
