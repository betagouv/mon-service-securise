import { HistoriseNombreDeServicesParEntiteDansCrm } from '../../src/crm/historiseNombreDeServicesParEntiteDansCrm.ts';
import { fabriqueAdaptateurReportingCrm } from '../../src/adaptateurs/fabriqueAdaptateurReportingCrm.js';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { AdaptateurGestionErreur } from '../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

describe('La consignation du nombre de services dans le CRM', () => {
  it('consigne en CRM, pour chaque entité, son nombre de services', async () => {
    const crmDeTest = fabriqueAdaptateurReportingCrm();
    crmDeTest.historiseNombreDeServices = vi.fn().mockResolvedValue(undefined);

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
      adaptateurGestionErreur: {
        logueErreur: vi.fn(),
      } as unknown as AdaptateurGestionErreur,
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

  it("logue chaque erreur du CRM à l'adaptateur de gestion d'erreur", async () => {
    const crmDeTest = fabriqueAdaptateurReportingCrm();
    crmDeTest.historiseNombreDeServices = vi
      .fn()
      .mockRejectedValueOnce(new Error('Échec SIR-1'))
      .mockRejectedValueOnce(new Error('Échec SIR-2'));
    const adaptateurGestionErreur = {
      logueErreur: vi.fn(),
    } as unknown as AdaptateurGestionErreur;

    const lesServices = [
      unServiceV2().avecOrganisationResponsable({ siret: 'SIR-1' }).construis(),
      unServiceV2().avecOrganisationResponsable({ siret: 'SIR-2' }).construis(),
    ];

    const consigne = new HistoriseNombreDeServicesParEntiteDansCrm({
      adaptateurCrm: crmDeTest,
      adaptateurGestionErreur,
    });

    await consigne.execute(lesServices);

    expect(adaptateurGestionErreur.logueErreur).toHaveBeenCalledTimes(2);
    expect(adaptateurGestionErreur.logueErreur).toHaveBeenCalledWith(
      new Error('Échec SIR-1'),
      { siret: 'SIR-1' }
    );
    expect(adaptateurGestionErreur.logueErreur).toHaveBeenCalledWith(
      new Error('Échec SIR-2'),
      { siret: 'SIR-2' }
    );
  });
});
