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
import { ProcedureSuppressionContributeur } from '../../../src/modeles/autorisations/procedureSuppressionContributeur.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';

describe("La procédure de suppression d'un contributeur", () => {
  const idUtilisateur = unUUID('U');
  const idService = unUUID('S');
  const idActeur = unUUID('A');
  let depotDonnees: DepotDonnees;

  beforeEach(() => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(unServiceV2().avecId(idService).donnees)
      .ajouteUneAutorisation(
        uneAutorisation().deContributeur(idUtilisateur, idService).donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire(idActeur, idService).donnees
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

  it("délègue au dépôt de données la suppression de l'autorisation du contributeur", async () => {
    const procedure = new ProcedureSuppressionContributeur({ depotDonnees });

    await procedure.execute(idUtilisateur, idService, idActeur);

    const autorisationSupprimee = await depotDonnees.autorisationPour(
      idUtilisateur,
      idService
    );
    expect(autorisationSupprimee).toBeUndefined();
  });

  it('délègue au dépôt de données la dissociation des modèles de mesure spécifique pour cet utilisateur et ce service', async () => {
    depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService =
      vi.fn();
    const procedure = new ProcedureSuppressionContributeur({ depotDonnees });

    await procedure.execute(idUtilisateur, idService, idActeur);

    expect(
      depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService
    ).toHaveBeenCalledWith(idUtilisateur, idService);
  });
});
