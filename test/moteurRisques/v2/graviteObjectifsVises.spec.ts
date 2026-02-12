import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import {
  Gravite,
  GraviteObjectifsVises,
} from '../../../src/moteurRisques/v2/graviteObjectifsVises.ts';
import {
  AudienceCible,
  DureeDysfonctionnementAcceptable,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.ts';

describe('La gravité des Objectifs Visés', () => {
  describe("pour l'OV1", () => {
    it.each([
      { audienceService: 'limitee', gravite: 1 },
      { audienceService: 'moyenne', gravite: 2 },
      { audienceService: 'large', gravite: 3 },
      { audienceService: 'tresLarge', gravite: 4 },
    ] as Array<{ audienceService: AudienceCible; gravite: Gravite }>)(
      "calcule la gravité de l'OV1 : l'audience $audienceService donne $gravite",
      ({ audienceService, gravite }) => {
        const g = new GraviteObjectifsVises();

        const avecAudience = uneDescriptionV2Valide()
          .avecAudienceCible(audienceService)
          .construis();

        const resultat = g.calculePourService(avecAudience);

        expect(resultat.OV1).toBe(gravite);
      }
    );
  });

  describe("pour l'OV2", () => {
    it.each([
      { volumetrie: 'faible', gravite: 1 },
      { volumetrie: 'moyen', gravite: 2 },
      { volumetrie: 'eleve', gravite: 3 },
      { volumetrie: 'tresEleve', gravite: 4 },
    ] as Array<{ volumetrie: VolumetrieDonneesTraitees; gravite: Gravite }>)(
      "calcule la gravité de l'OV2 : la volumétrie de donnée traitées $volumetrie donne $gravite",
      ({ volumetrie, gravite }) => {
        const g = new GraviteObjectifsVises();

        const avecVolumetrie = uneDescriptionV2Valide()
          .avecVolumeDonneesTraitees(volumetrie)
          .construis();

        const resultat = g.calculePourService(avecVolumetrie);

        expect(resultat.OV2).toBe(gravite);
      }
    );
  });

  describe("pour l'OV3", () => {
    it.each([
      { duree: 'plusDe24h', gravite: 1 },
      { duree: 'moinsDe24h', gravite: 2 },
      { duree: 'moinsDe12h', gravite: 3 },
      { duree: 'moinsDe4h', gravite: 4 },
    ] as Array<{ duree: DureeDysfonctionnementAcceptable; gravite: Gravite }>)(
      "calcule la gravité de l'OV3 : la durée de dysfonctionnement $duree donne $gravite",
      ({ duree, gravite }) => {
        const g = new GraviteObjectifsVises();

        const avecVolumetrie = uneDescriptionV2Valide()
          .avecDureeDysfonctionnementAcceptable(duree)
          .construis();

        const resultat = g.calculePourService(avecVolumetrie);

        expect(resultat.OV3).toBe(gravite);
      }
    );
  });

  describe("pour l'OV4", () => {
    it.each([
      { audienceService: 'limitee', gravite: 1 },
      { audienceService: 'moyenne', gravite: 2 },
      { audienceService: 'large', gravite: 3 },
      { audienceService: 'tresLarge', gravite: 4 },
    ] as Array<{ audienceService: AudienceCible; gravite: Gravite }>)(
      "calcule la gravité de l'OV4, identique à l'OV1 : l'audience $audienceService donne $gravite",
      ({ audienceService, gravite }) => {
        const g = new GraviteObjectifsVises();

        const avecAudience = uneDescriptionV2Valide()
          .avecAudienceCible(audienceService)
          .construis();

        const resultat = g.calculePourService(avecAudience);

        expect(resultat.OV4).toBe(gravite);
      }
    );
  });
});
