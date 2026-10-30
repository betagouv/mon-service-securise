import { fabriqueAdaptateurGestionErreur } from '../../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { fabriqueReporting } from '../../src/adaptateurs/adaptateurReporting.interface.js';

const maintenant = () =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date());

const tache = async (): Promise<string[]> => {
  const trace: string[] = [];

  trace.push('👷‍♀️ Il faut envoyer le rapport du mois dernier…');

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
