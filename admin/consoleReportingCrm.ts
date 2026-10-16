/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax */
import { crm } from '../src/adaptateurs/adaptateurEnvironnement.js';
import { AdaptateurReportingCrmTwentyRest } from '../src/adaptateurs/adaptateurReportingCrm.twentyRest.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import * as depotDonneesUtilisateurs from '../src/depots/depotDonneesUtilisateurs.js';
import { consigneNouvelUtilisateurDansCrm } from '../src/bus/abonnements/reporting-bizdev/consigneNouvelUtilisateurDansCrm.js';
import Utilisateur from '../src/modeles/utilisateur.js';

type ErreurRattrapage = { email: string; raison: string };

export class ConsoleReportingCrm {
  private readonly reportingCrm: AdaptateurReportingCrmTwentyRest;

  private readonly depotUtilisateurs: {
    tousUtilisateurs: () => Promise<Utilisateur[]>;
  };

  constructor() {
    this.reportingCrm = new AdaptateurReportingCrmTwentyRest(
      crm().cleApi()!,
      crm().urlBase()
    );
    this.depotUtilisateurs = depotDonneesUtilisateurs.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
      adaptateurPersistance: AdaptateurPostgres.nouvelAdaptateur({}),
    });
  }

  async rattrapeUtilisateurs(): Promise<ErreurRattrapage[]> {
    const tousUtilisateurs = await this.depotUtilisateurs.tousUtilisateurs();
    const inscrits = tousUtilisateurs.filter((u) => !u.estUnInvite());

    const consigneDansCrm = consigneNouvelUtilisateurDansCrm({
      reportingCrm: this.reportingCrm,
    });

    const erreurs: ErreurRattrapage[] = [];
    for (const [index, utilisateur] of inscrits.entries()) {
      process.stdout.write(
        `\r\x1b[K${index + 1}/${inscrits.length} ${utilisateur.email}`
      );
      try {
        await consigneDansCrm({ utilisateur });
      } catch (e) {
        erreurs.push({ email: utilisateur.email, raison: String(e) });
      }
    }

    console.log(
      `\n✅ ${inscrits.length - erreurs.length}/${inscrits.length} utilisateurs consignés dans le CRM`
    );
    if (erreurs.length > 0) console.table(erreurs);

    return erreurs;
  }
}
