import { metAJourNombreDeServicesDeLEntiteDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/metAJourNombreDeServicesDeLEntiteDansCrm.ts';
import { EvenementNouveauServiceCree } from '../../../../src/bus/evenementNouveauServiceCree.ts';
import EvenementServiceSupprime from '../../../../src/bus/evenementServiceSupprime.js';
import { unService } from '../../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../../../constructeurs/UUID.js';

describe("L'abonné qui met à jour le nombre de services de l'entité dans le CRM", () => {
  const reportingTest = () => ({
    consigneNombreDeServicesDeLEntite: vi.fn(),
  });

  const depotTest = () => ({
    denombreServicesEtUtilisateursParSiret: vi.fn(
      async (sirets: string[]) =>
        new Map(
          sirets.map((siret) => [
            siret,
            { nombreServices: 4, nombreUtilisateurs: 2 },
          ])
        )
    ),
  });

  const uneCreationDeService = (siret?: string) =>
    new EvenementNouveauServiceCree({
      service: unService().avecOrganisationResponsable({ siret }).construis(),
      utilisateur: unUtilisateur().construis(),
    });

  it("consigne le nombre de services de l'entité du service", async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest();

    await metAJourNombreDeServicesDeLEntiteDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneCreationDeService('12345678900011'));

    expect(
      depotDonnees.denombreServicesEtUtilisateursParSiret
    ).toHaveBeenCalledWith(['12345678900011']);
    expect(reportingCrm.consigneNombreDeServicesDeLEntite).toHaveBeenCalledWith(
      '12345678900011',
      4
    );
  });

  it("ne consigne rien quand le service n'a pas de SIRET", async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest();

    await metAJourNombreDeServicesDeLEntiteDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneCreationDeService(undefined));

    expect(
      depotDonnees.denombreServicesEtUtilisateursParSiret
    ).not.toHaveBeenCalled();
    expect(
      reportingCrm.consigneNombreDeServicesDeLEntite
    ).not.toHaveBeenCalled();
  });

  describe('quand un service est supprimé', () => {
    const uneSuppressionDeService = (siret?: string) =>
      new EvenementServiceSupprime({
        idService: unUUID('S'),
        autorisations: [],
        siret,
      });

    it("consigne le nombre de services restant dans l'entité", async () => {
      const reportingCrm = reportingTest();
      const depotDonnees = depotTest();

      await metAJourNombreDeServicesDeLEntiteDansCrm({
        reportingCrm,
        depotDonnees,
      })(uneSuppressionDeService('12345678900011'));

      expect(
        depotDonnees.denombreServicesEtUtilisateursParSiret
      ).toHaveBeenCalledWith(['12345678900011']);
      expect(
        reportingCrm.consigneNombreDeServicesDeLEntite
      ).toHaveBeenCalledWith('12345678900011', 4);
    });

    it("ne consigne rien quand le service supprimé n'avait pas de SIRET", async () => {
      const reportingCrm = reportingTest();
      const depotDonnees = depotTest();

      await metAJourNombreDeServicesDeLEntiteDansCrm({
        reportingCrm,
        depotDonnees,
      })(uneSuppressionDeService(undefined));

      expect(
        reportingCrm.consigneNombreDeServicesDeLEntite
      ).not.toHaveBeenCalled();
    });
  });
});
