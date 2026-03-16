import { RisqueV2 } from './risqueV2.js';

export class RisquesV2 {
  constructor(
    private readonly risques: RisqueV2[],
    private readonly risquesBruts: RisqueV2[],
    private readonly risquesCibles: RisqueV2[]
  ) {}

  donneesSerialisees() {
    return Object.fromEntries(
      this.risques.map((r) => [r.id, r.donneesSerialisees()])
    );
  }

  toJSON() {
    return {
      risques: this.risques.map((r) => r.toJSON()),
      risquesBruts: this.risquesBruts.map((r) => r.toJSON()),
      risquesCibles: this.risquesCibles.map((r) => r.toJSON()),
    };
  }
}
