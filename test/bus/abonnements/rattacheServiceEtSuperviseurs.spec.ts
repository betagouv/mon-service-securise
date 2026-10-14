import { unService } from '../../constructeurs/constructeurService.js';
import Service from '../../../src/modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../../src/supervision/serviceAdministrationOrganisations.ts';
import { rattacheServiceEtSuperviseurs } from '../../../src/bus/abonnements/rattacheServiceEtSuperviseurs.ts';

describe("L'abonné en charge de rattacher un nouveau service à ses superviseurs", () => {
  it("délègue le rattachement au service d'administration des organisations", async () => {
    let serviceRecu;
    const serviceAdministrationOrganisations = {
      rattacheLesSuperviseursDe: async (service: Service) => {
        serviceRecu = service;
      },
    } as unknown as ServiceAdministrationOrganisations;

    const service = unService().avecId('S1').construis();

    await rattacheServiceEtSuperviseurs({ serviceAdministrationOrganisations })(
      { service }
    );

    expect(serviceRecu!.id).toEqual('S1');
  });
});
