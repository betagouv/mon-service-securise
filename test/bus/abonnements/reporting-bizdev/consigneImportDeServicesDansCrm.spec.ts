import EvenementServicesImportes from '../../../../src/bus/evenementServicesImportes.js';
import { unUUID } from '../../../constructeurs/UUID.ts';
import { unUtilisateur } from '../../../constructeurs/constructeurUtilisateur.js';
import { consigneImportDeServicesDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/consigneImportDeServicesDansCrm.ts';

describe("L'abonné qui consigne un import en masse dans le CRM", () => {
  it("consigne l'email de l'utilisateur avec le nombre de services", async () => {
    const reportingTest = { consigneImportEnMasse: vi.fn() };

    const depotTest = {
      utilisateur: vi.fn(async () =>
        unUtilisateur().avecEmail('jean.dujardin@beta.gouv.fr').construis()
      ),
    };

    const unImport = new EvenementServicesImportes({
      idUtilisateur: unUUID('U1'),
      nbServicesImportes: 6,
      versionServicesImportes: 'v2',
    });

    await consigneImportDeServicesDansCrm({
      reportingCrm: reportingTest,
      depotDonnees: depotTest,
    })(unImport);

    expect(depotTest.utilisateur).toHaveBeenCalledWith(unUUID('U1'));
    expect(reportingTest.consigneImportEnMasse).toHaveBeenCalledWith({
      emailUtilisateur: 'jean.dujardin@beta.gouv.fr',
      nbServices: 6,
      versionServices: 'v2',
    });
  });
});
