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

    expect(crmDeTest.historiseNombreDeServices).toHaveBeenCalledExactlyOnceWith(
      [
        { siret: 'SIR-1', nombreDeServices: 3 },
        { siret: 'SIR-2', nombreDeServices: 1 },
      ]
    );
  });

  it("logue l'erreur du CRM à l'adaptateur de gestion d'erreur sans la propager", async () => {
    const crmDeTest = fabriqueAdaptateurReportingCrm();
    crmDeTest.historiseNombreDeServices = vi
      .fn()
      .mockRejectedValue(new Error('Échec CRM'));
    const adaptateurGestionErreur = {
      logueErreur: vi.fn(),
    } as unknown as AdaptateurGestionErreur;

    const consigne = new HistoriseNombreDeServicesParEntiteDansCrm({
      adaptateurCrm: crmDeTest,
      adaptateurGestionErreur,
    });

    await consigne.execute([
      unServiceV2().avecOrganisationResponsable({ siret: 'SIR-1' }).construis(),
    ]);

    expect(adaptateurGestionErreur.logueErreur).toHaveBeenCalledExactlyOnceWith(
      new Error('Échec CRM')
    );
  });
});
