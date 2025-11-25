import { SimulationMigrationReferentiel } from '../../src/modeles/simulationMigrationReferentiel.js';
import { unService } from '../constructeurs/constructeurService.js';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.ts';
import { creeReferentiel } from '../../src/referentiel.js';
import { creeReferentielV2 } from '../../src/referentielV2.ts';
import uneDescriptionValide from '../constructeurs/constructeurDescriptionService.js';

describe('La simulation de migration du référentiel V1 vers V2', () => {
  describe("sur demande de l'évolution des mesures", () => {
    it('sait dire combien de mesures sont modifiées', () => {
      const referentielV1 = creeReferentiel();
      const simulation = new SimulationMigrationReferentiel({
        serviceV1: unService(referentielV1)
          .avecDescription(
            uneDescriptionValide(referentielV1, false).avecTypes([
              'applicationMobile',
            ]).donnees
          )
          .construis(),
        descriptionServiceV2: uneDescriptionV2Valide().construis(),
        referentielV1,
        referentielV2: creeReferentielV2(),
      });

      const evolution = simulation.evolutionMesures();

      // Ce résultat peut être visualisé dans le Grist, en sélectionnant les filtres "Niveau = Basique" & "Évaluation = Modification majeure || Conforme + Split"
      expect(evolution.nbMesuresModifiees).toBe(5);
    });
  });
});
