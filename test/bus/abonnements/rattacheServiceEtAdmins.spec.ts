import { unService } from '../../constructeurs/constructeurService.js';
import Service from '../../../src/modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../../src/supervision/serviceAdministrationOrganisations.ts';
import { rattacheServiceEtAdmins } from '../../../src/bus/abonnements/rattacheServiceEtAdmins.ts';

describe("L'abonné en charge de rattacher un nouveau service à ses administrateurs", () => {
  it("délègue le rattachement au service d'administration des organisations", async () => {
    let serviceRecu;
    const serviceAdministrationOrganisations = {
      rattacheLesAdministrateursDe: async (service: Service) => {
        serviceRecu = service;
      },
    } as ServiceAdministrationOrganisations;

    const service = unService().avecId('S1').construis();

    await rattacheServiceEtAdmins({ serviceAdministrationOrganisations })({
      service,
    });

    expect(serviceRecu!.id).toEqual('S1');
  });
});
