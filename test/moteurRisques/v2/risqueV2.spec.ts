import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';

describe('Un risque V2', () => {
  describe('concernant sa gravité', () => {
    it('connait son niveau de gravité', () => {
      const risque = new RisqueV2('V1', { OV1: 3 });

      expect(risque.gravite).toBe(3);
    });

    it("retourne la gravité maximale de tous les OV (même s'il devrait tous avoir la même valeur)", () => {
      const risque = new RisqueV2('V1', { OV2: 3, OV3: 3 });

      expect(risque.gravite).toBe(3);
    });
  });
});
