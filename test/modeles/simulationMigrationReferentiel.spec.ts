import { SimulationMigrationReferentiel } from '../../src/modeles/simulationMigrationReferentiel.js';
import { unService } from '../constructeurs/constructeurService.js';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.ts';
import uneDescriptionValide from '../constructeurs/constructeurDescriptionService.js';
import { Referentiel, ReferentielV2 } from '../../src/referentiel.interface.js';
import { DescriptionServiceV2 } from '../../src/modeles/descriptionServiceV2.js';
import Service from '../../src/modeles/service.js';
import { fabriqueReferentiel } from '../../src/fabriqueReferentiel.js';

describe('La simulation de migration du référentiel V1 vers V2', () => {
  describe("sur demande de l'évolution des mesures", () => {
    let referentielV1: Referentiel;
    let referentielV2: ReferentielV2;
    let descriptionServiceV2: DescriptionServiceV2;
    let serviceV1: Service;

    beforeEach(() => {
      referentielV1 = fabriqueReferentiel().v1();
      referentielV2 = fabriqueReferentiel().v2();
      descriptionServiceV2 = uneDescriptionV2Valide()
        .avecDureeDysfonctionnementAcceptable('plusDe24h')
        .avecCategoriesDonneesTraitees([])
        .avecNiveauSecurite('niveau1')
        .construis();
      serviceV1 = unService(referentielV1)
        .avecDescription(
          uneDescriptionValide(referentielV1, false).avecTypes([
            'applicationMobile',
          ]).donnees
        )
        .construis();
    });

    it('sait dire combien de mesures sont modifiées', () => {
      const simulation = new SimulationMigrationReferentiel({
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      });

      const evolution = simulation.evolutionMesures();

      // Ce résultat peut être visualisé dans le Grist, en sélectionnant les filtres "Niveau = Basique" & "Évaluation = Modification majeure || Conforme + Split"
      expect(evolution.nbMesuresModifiees).toBe(5);
    });

    it('sait dire combien de mesures restent inchangées', () => {
      const simulation = new SimulationMigrationReferentiel({
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      });

      const evolution = simulation.evolutionMesures();

      // Ce résultat peut être visualisé dans le Grist, en sélectionnant les filtres "Niveau = Basique" & "Évaluation = Conforme || Modification mineure"
      expect(evolution.nbMesuresInchangees).toBe(33);
    });

    it('sait dire combien de mesures sont supprimées', () => {
      const simulation = new SimulationMigrationReferentiel({
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      });

      const evolution = simulation.evolutionMesures();

      // Ce résultat peut être visualisé dans le Grist, en sélectionnant les filtres "Niveau = Basique" & "Évaluation = Split || Réunification || Absente"
      expect(evolution.nbMesuresSupprimees).toBe(9);
    });

    it('sait dire combien de mesures sont présentes au total dans le service v2', () => {
      const simulation = new SimulationMigrationReferentiel({
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      });

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesures).toBe(45);
    });
  });
});
