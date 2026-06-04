import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { unePersistanceMemoire } from '../../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { creeDepot as creeDepotComplet } from '../../../src/depotDonnees.ts';
import BusEvenements from '../../../src/bus/busEvenements.js';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import fauxAdaptateurChiffrement from '../../mocks/adaptateurChiffrement.js';
import { AdaptateurPersistance } from '../../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { ProcedureSuppressionContributeurAdmin } from '../../../src/modeles/autorisations/procedureSuppressionContributeurAdmin.ts';

describe("La procédure de suppression d'un contributeur admin", () => {
  const idUtilisateurAdmin = unUUID('U');
  const idService = unUUID('S');
  let depotDonnees: DepotDonnees;

  beforeEach(() => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(unServiceV2().avecId(idService).donnees)
      .ajouteUneAutorisation(
        uneAutorisation().dAdmin(idUtilisateurAdmin, idService).donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().dAdmin(unUUIDRandom(), idService).donnees
      )
      .construis() as AdaptateurPersistance;
    depotDonnees = creeDepotComplet({
      adaptateurPersistance,
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });
  });

  it("délègue au dépôt de données la suppression de l'autorisation du contributeur admin", async () => {
    const procedure = new ProcedureSuppressionContributeurAdmin({
      depotDonnees,
    });

    await procedure.execute(idUtilisateurAdmin, idService);

    const autorisationSupprimee = await depotDonnees.autorisationPour(
      idUtilisateurAdmin,
      idService
    );
    expect(autorisationSupprimee).toBeUndefined();
  });

  it('délègue au dépôt de données la dissociation des modèles de mesure spécifique pour cet utilisateur et ce service', async () => {
    depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
      vi.fn();
    const procedure = new ProcedureSuppressionContributeurAdmin({
      depotDonnees,
    });

    await procedure.execute(idUtilisateurAdmin, idService);

    expect(
      depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService
    ).toHaveBeenCalledWith(idUtilisateurAdmin, idService);
  });
});
