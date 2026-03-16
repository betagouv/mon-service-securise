import { RisqueV2 } from './risqueV2.js';

export class RisquesV2 {
  constructor(private readonly risques: RisqueV2[]) {}

  donneesSerialisees() {
    return Object.fromEntries(
      this.risques.map((r) => [r.id, r.donneesSerialisees()])
    );
  }
}
