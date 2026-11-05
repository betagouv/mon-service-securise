import { AdaptateurReportingCrm } from '../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';
import Service from '../modeles/service.js';
import { AdaptateurGestionErreur } from '../adaptateurs/adaptateurGestionErreur.interface.js';

export type Configuration = {
  adaptateurCrm: AdaptateurReportingCrm;
  adaptateurGestionErreur: AdaptateurGestionErreur;
};

export class HistoriseNombreDeServicesParEntiteDansCrm {
  private readonly crm: AdaptateurReportingCrm;
  private readonly gestionErreur: AdaptateurGestionErreur;

  constructor(config: Configuration) {
    this.crm = config.adaptateurCrm;
    this.gestionErreur = config.adaptateurGestionErreur;
  }

  async execute(services: Service[]): Promise<void> {
    const parSiret = services.reduce((map, s) => {
      const siret = s.siretDeOrganisation();
      map.set(siret, (map.get(siret) || 0) + 1);
      return map;
    }, new Map<string, number>());

    const historisations = [...parSiret.entries()].map(
      ([siret, nombreDeServices]) => ({ siret, nombreDeServices })
    );

    try {
      await this.crm.historiseNombreDeServices(historisations);
    } catch (erreur) {
      this.gestionErreur.logueErreur(erreur as Error);
    }
  }
}
