import { delieServiceEtSuperviseurs } from '../../../src/bus/abonnements/delieServiceEtSuperviseurs.js';
import { UUID } from '../../../src/typesBasiques.ts';
import ServiceSupervision from '../../../src/supervision/serviceSupervision.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("L'abonné en charge de délier un service supprimé à ses superviseurs", () => {
  it('délègue la suppression du lien au service de supervision', async () => {
    let idServiceRecu;
    const serviceSupervision = {
      delieServiceEtSuperviseurs: async (idService: UUID) => {
        idServiceRecu = idService;
      },
    } as ServiceSupervision;

    await delieServiceEtSuperviseurs({ serviceSupervision })({
      idService: unUUID('1'),
    });

    expect(idServiceRecu).toBe(unUUID('1'));
  });
});
