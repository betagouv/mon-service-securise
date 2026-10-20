import { metAJourNombreDeServicesEnProprietaireDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/metAJourNombreDeServicesEnProprietaireDansCrm.ts';
import { EvenementAutorisationsServiceModifiees } from '../../../../src/bus/evenementAutorisationsServiceModifiees.js';
import EvenementServiceSupprime from '../../../../src/bus/evenementServiceSupprime.js';
import { Autorisation } from '../../../../src/modeles/autorisations/autorisation.js';
import Utilisateur from '../../../../src/modeles/utilisateur.js';
import { uneAutorisation } from '../../../constructeurs/constructeurAutorisation.js';
import { unUtilisateur } from '../../../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../../../constructeurs/UUID.js';

describe("L'abonné qui met à jour le nombre de services en propriétaire des contributeurs dans le CRM", () => {
  const reportingTest = () => ({
    consigneNombreDeServicesEnProprietaire: vi.fn(),
  });

  const jean: Utilisateur = unUtilisateur()
    .avecId(unUUID('1'))
    .avecEmail('jean@beta.gouv.fr')
    .construis();
  const marie: Utilisateur = unUtilisateur()
    .avecId(unUUID('2'))
    .avecEmail('marie@beta.gouv.fr')
    .construis();

  const depotTest = (
    autorisationsParUtilisateur: Record<string, Autorisation[]>
  ) => ({
    utilisateur: vi.fn(async (id: string) => (id === jean.id ? jean : marie)),
    autorisations: vi.fn(async (id: string) => autorisationsParUtilisateur[id]),
  });

  const uneModificationDAutorisations = () =>
    new EvenementAutorisationsServiceModifiees({
      idService: unUUID('S'),
      autorisations: [
        { idUtilisateur: jean.id, droit: 'PROPRIETAIRE' },
        { idUtilisateur: marie.id, droit: 'LECTURE' },
      ],
    });

  it('consigne pour chaque contributeur le nombre de services dont il est propriétaire', async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest({
      [jean.id]: [
        uneAutorisation().deProprietaire(jean.id, unUUID('A')).construis(),
        uneAutorisation().deProprietaire(jean.id, unUUID('B')).construis(),
        uneAutorisation().deContributeur(jean.id, unUUID('C')).construis(),
      ],
      [marie.id]: [
        uneAutorisation().deContributeur(marie.id, unUUID('A')).construis(),
      ],
    });

    await metAJourNombreDeServicesEnProprietaireDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneModificationDAutorisations());

    expect(
      reportingCrm.consigneNombreDeServicesEnProprietaire
    ).toHaveBeenCalledWith('jean@beta.gouv.fr', 2);
    expect(
      reportingCrm.consigneNombreDeServicesEnProprietaire
    ).toHaveBeenCalledWith('marie@beta.gouv.fr', 0);
  });

  it("consigne les autres contributeurs même si l'un d'eux échoue", async () => {
    const reportingCrm = reportingTest();
    reportingCrm.consigneNombreDeServicesEnProprietaire.mockImplementation(
      async (email: string) => {
        if (email === 'jean@beta.gouv.fr') throw new Error('Erreur CRM');
      }
    );
    const depotDonnees = depotTest({ [jean.id]: [], [marie.id]: [] });

    await metAJourNombreDeServicesEnProprietaireDansCrm({
      reportingCrm,
      depotDonnees,
    })(uneModificationDAutorisations());

    expect(
      reportingCrm.consigneNombreDeServicesEnProprietaire
    ).toHaveBeenCalledWith('marie@beta.gouv.fr', 0);
  });

  it("consigne le nombre de services en propriétaire des anciens contributeurs d'un service supprimé", async () => {
    const reportingCrm = reportingTest();
    const depotDonnees = depotTest({
      [jean.id]: [
        uneAutorisation().deProprietaire(jean.id, unUUID('A')).construis(),
      ],
      [marie.id]: [],
    });

    await metAJourNombreDeServicesEnProprietaireDansCrm({
      reportingCrm,
      depotDonnees,
    })(
      new EvenementServiceSupprime({
        idService: unUUID('S'),
        autorisations: [
          { idUtilisateur: jean.id },
          { idUtilisateur: marie.id },
        ],
        siret: '12345678900011',
      })
    );

    expect(
      reportingCrm.consigneNombreDeServicesEnProprietaire
    ).toHaveBeenCalledWith('jean@beta.gouv.fr', 1);
    expect(
      reportingCrm.consigneNombreDeServicesEnProprietaire
    ).toHaveBeenCalledWith('marie@beta.gouv.fr', 0);
  });
});
