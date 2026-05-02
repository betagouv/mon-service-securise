import { unService } from '../../constructeurs/constructeurService.js';
import { relieServiceEtSuperviseurs } from '../../../src/bus/abonnements/relieServiceEtSuperviseurs.js';
import Service from '../../../src/modeles/service.js';
import ServiceSupervision from '../../../src/supervision/serviceSupervision.ts';

describe("L'abonné en charge de relier un nouveau service à ses superviseurs", () => {
  it('délègue la création du lien au service de supervision', async () => {
    let serviceRecu;
    const serviceSupervision = {
      relieServiceEtSuperviseurs: async (service: Service) => {
        serviceRecu = service;
      },
    } as ServiceSupervision;

    const service = unService().avecId('S1').construis();

    await relieServiceEtSuperviseurs({ serviceSupervision })({
      service,
    });

    expect(serviceRecu!.id).toEqual('S1');
  });
});
