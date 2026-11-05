import { AdaptateurReportingCrm } from '../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';
import Service from '../modeles/service.js';

export type Configuration = {
  adaptateurCrm: AdaptateurReportingCrm;
};

export class HistoriseNombreDeServicesParEntiteDansCrm {
  private readonly crm: AdaptateurReportingCrm;

  constructor(config: Configuration) {
    this.crm = config.adaptateurCrm;
  }

  async execute(services: Service[]): Promise<void> {
    const parSiret = services.reduce((map, s) => {
      const siret = s.siretDeOrganisation();
      map.set(siret, (map.get(siret) || 0) + 1);
      return map;
    }, new Map<string, number>());

    await Promise.all(
      [...parSiret.entries()].map(([siret, nbServices]) =>
        this.crm.historiseNombreDeServices(siret, nbServices)
      )
    );
  }
}
