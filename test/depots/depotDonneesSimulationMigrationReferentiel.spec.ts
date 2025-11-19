import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesSimulationMigrationReferentiel from '../../src/depots/depotDonneesSimulationMigrationReferentiel.js';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { unBrouillonComplet } from '../constructeurs/constructeurBrouillonService.js';
import { unUUID } from '../constructeurs/UUID.js';
import { unService } from '../constructeurs/constructeurService.js';
import { DonneesBrouillonService } from '../../src/modeles/brouillonService.js';
import { UUID } from '../../src/typesBasiques.js';

describe('Le dépôt de données des simulations de migration du référentiel v2', () => {
  let persistance: ReturnType<
    typeof AdaptateurPersistanceMemoire.nouvelAdaptateur
  >;

  beforeEach(() => {
    persistance = unePersistanceMemoire().construis();
  });

  describe("sur demande d'ajout d'une simulation si nécessaire", () => {
    it("créé une simulation si elle n'existe pas pour ce service", async () => {
      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          persistance,
        });

      let idRecu: UUID;
      let donneesRecues: DonneesBrouillonService;
      persistance.sauvegardeSimulationMigrationReferentiel = async (
        idService: UUID,
        donnees: DonneesBrouillonService
      ) => {
        idRecu = idService;
        donneesRecues = donnees;
      };

      const service = unService()
        .avecNomService('Mon service en V2')
        .avecId(unUUID('s'))
        .construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);

      expect(idRecu!).toBe(unUUID('s'));
      expect(donneesRecues!.nomService).toBe('Mon service en V2');
    });

    it('ne créé pas de simulation si elle existe déjà pour ce service', async () => {
      persistance = unePersistanceMemoire()
        .ajouteUneSimulationMigrationReferentiel(
          unUUID('s'),
          unBrouillonComplet().donneesBrouillon()
        )
        .construis();

      let peristanceAppelee = false;
      persistance.sauvegardeSimulationMigrationReferentiel = async () => {
        peristanceAppelee = true;
      };

      const leDepot = () =>
        DepotDonneesSimulationMigrationReferentiel.creeDepot({
          persistance,
        });

      const service = unService().avecId(unUUID('s')).construis();

      await leDepot().ajouteSimulationMigrationReferentielSiNecessaire(service);
      expect(peristanceAppelee).toBe(false);
    });
  });
});
