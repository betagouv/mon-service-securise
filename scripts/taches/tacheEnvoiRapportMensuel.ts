import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueReportingTechnique } from '../../src/adaptateurs/adaptateurReportingTechnique.interface.js';
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
import { enCadence } from '../../src/utilitaires/pThrottle.js';
import { ContenuRapportMensuel } from '../../src/adaptateurs/adaptateurMail.interface.js';
import { fabriqueAdaptateurMail } from '../../src/adaptateurs/fabriqueAdaptateurMail.js';
import { ServicesSansMesuresAppliquees } from '../../src/notifications/servicesSansMesuresAppliquees.js';

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

const fabriqueRapport = (): RapportMensuel => {
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

  const servicesSansMesuresAppliquees = new ServicesSansMesuresAppliquees({
    depotDonnees,
  });

  return new RapportMensuel({
    adaptateurChiffrement,
    adaptateurJournal,
    depotDonnees,
    servicesSansMesuresAppliquees,
  });
};

const tache = async (): Promise<string[]> => {
  const trace: string[] = [];

  const rapportMensuel = fabriqueRapport();

  const donnees = await rapportMensuel.donnees(
    intervalleDuMoisPrecedent(new Date())
  );
  trace.push(`✉️ ${donnees.length} email(s) à envoyer`);

  const adaptateurMail = fabriqueAdaptateurMail();
  const envoieUnRapport = async (
    destinataire: string,
    contenu: ContenuRapportMensuel
  ) => adaptateurMail.envoieRapportMensuel(destinataire, contenu);
  const envoieEnCadence = enCadence(150, envoieUnRapport);

  await Promise.all(
    donnees.map((d) =>
      envoieEnCadence(d.email, {
        nbNouveauxServices: d.nbNouveauxServicesDansPerimetre,
        nbNouveauxServicesSansMesuresAppliquees:
          d.nbNouveauxServicesSansTousModelesMesureAppliques || 0,
      })
    )
  );

  trace.push('✅ Tout a été envoyé');

  return trace;
};

const main = async () => {
  const reporting = fabriqueReportingTechnique();
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
