import { metAJourNombreDHomologationsDeLEntiteDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/metAJourNombreDHomologationsDeLEntiteDansCrm.ts';
import EvenementDossierHomologationFinalise from '../../../../src/bus/evenementDossierHomologationFinalise.js';
import Dossier from '../../../../src/modeles/dossier.js';
import Service from '../../../../src/modeles/service.js';
import { unService } from '../../../constructeurs/constructeurService.js';
import { unUUID } from '../../../constructeurs/UUID.js';

describe("L'abonné qui met à jour le nombre d'homologations de l'entité dans le CRM", () => {
  const reportingTest = () => ({
    consigneNombreDHomologationsDeLEntite: vi.fn(),
  });

  const unServiceDeLEntite = (
    siret: string | undefined,
    dossiers: { id: string; finalise: boolean }[] = []
  ) =>
    unService()
      .avecOrganisationResponsable({ siret })
      .avecDossiers(dossiers)
      .construis();

  const depotTest = (serviceHomologue: Service) => ({
    service: vi.fn(async () => serviceHomologue),
    tousLesServicesAvecSiret: vi.fn(async () => [
      unServiceDeLEntite('12345678900011', [
        { id: unUUID('1'), finalise: true },
      ]),
      unServiceDeLEntite('12345678900011', [
        { id: unUUID('2'), finalise: true },
        { id: unUUID('3'), finalise: true },
      ]),
    ]),
  });

  const uneFinalisationDeDossier = () =>
    new EvenementDossierHomologationFinalise({
      idService: unUUID('S'),
      dossier: new Dossier({ id: unUUID('1') }),
      idUtilisateur: unUUID('U'),
    });

  it("consigne le nombre de dossiers de tous les services de l'entité", async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest(unServiceDeLEntite('12345678900011'));

    await metAJourNombreDHomologationsDeLEntiteDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneFinalisationDeDossier());

    expect(depotDonnees.service).toHaveBeenCalledWith(unUUID('S'));
    expect(depotDonnees.tousLesServicesAvecSiret).toHaveBeenCalledWith(
      '12345678900011'
    );
    expect(
      reportingCrm.consigneNombreDHomologationsDeLEntite
    ).toHaveBeenCalledWith('12345678900011', 3);
  });

  it("ne consigne rien quand le service n'a pas de SIRET", async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest(unServiceDeLEntite(undefined));

    await metAJourNombreDHomologationsDeLEntiteDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneFinalisationDeDossier());

    expect(depotDonnees.tousLesServicesAvecSiret).not.toHaveBeenCalled();
    expect(
      reportingCrm.consigneNombreDHomologationsDeLEntite
    ).not.toHaveBeenCalled();
  });
});
