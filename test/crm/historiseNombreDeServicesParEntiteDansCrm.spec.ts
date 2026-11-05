import { HistoriseNombreDeServicesParEntiteDansCrm } from '../../src/crm/historiseNombreDeServicesParEntiteDansCrm.ts';
import { fabriqueAdaptateurReportingCrm } from '../../src/adaptateurs/fabriqueAdaptateurReportingCrm.js';
import { unServiceV2 } from '../constructeurs/constructeurService.js';

describe('La consignation du nombre de services dans le CRM', () => {
  it('consigne en CRM, pour chaque entité, son nombre de services', async () => {
    const crmDeTest = fabriqueAdaptateurReportingCrm();
    crmDeTest.historiseNombreDeServices = vi.fn();

    const mairie = { siret: 'SIR-1' };
    const ville = { siret: 'SIR-2' };
    const lesServices = [
      unServiceV2().avecOrganisationResponsable(mairie).construis(),
      unServiceV2().avecOrganisationResponsable(mairie).construis(),
      unServiceV2().avecOrganisationResponsable(mairie).construis(),
      unServiceV2().avecOrganisationResponsable(ville).construis(),
    ];

    const consigne = new HistoriseNombreDeServicesParEntiteDansCrm({
      adaptateurCrm: crmDeTest,
    });

    await consigne.execute(lesServices);

    expect(crmDeTest.historiseNombreDeServices).toHaveBeenCalledWith(
      'SIR-1',
      3
    );
    expect(crmDeTest.historiseNombreDeServices).toHaveBeenCalledWith(
      'SIR-2',
      1
    );
  });
});
