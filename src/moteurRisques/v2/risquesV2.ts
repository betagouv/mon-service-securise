import { RisqueV2 } from './risqueV2.js';
import { DonneesRisqueV2, IdRisqueV2 } from './risquesV2.types.js';
import { RisqueSpecifiqueV2 } from './risqueSpecifiqueV2.js';

type DonneesRisquesV2 = {
  risques: RisqueV2[];
  risquesBruts: RisqueV2[];
  risquesCibles: RisqueV2[];
  risquesSpecifiques: RisqueSpecifiqueV2[];
};

export class RisquesV2 {
  private readonly risques: RisqueV2[];
  private readonly risquesBruts: RisqueV2[];
  private readonly risquesCibles: RisqueV2[];
  private readonly risquesSpecifiques: RisqueSpecifiqueV2[];

  constructor(donnees: DonneesRisquesV2) {
    this.risques = donnees.risques;
    this.risquesBruts = donnees.risquesBruts;
    this.risquesCibles = donnees.risquesCibles;
    this.risquesSpecifiques = donnees.risquesSpecifiques;
  }

  donneesSerialisees() {
    const risquesGeneraux = Object.fromEntries(
      this.risques.map((r) => [r.id, r.donneesSerialisees()])
    );
    const risquesSpecifiques = this.risquesSpecifiques.map((r) =>
      r.donneesSerialisees()
    );
    return { risquesGeneraux, risquesSpecifiques };
  }

  toJSON() {
    return {
      risques: this.risques.map((r) => r.toJSON()),
      risquesBruts: this.risquesBruts.map((r) => r.toJSON()),
      risquesCibles: this.risquesCibles.map((r) => r.toJSON()),
      risquesSpecifiques: this.risquesSpecifiques.map((r) => r.toJSON()),
    };
  }

  metsAJour(idRisque: IdRisqueV2, donnees: DonneesRisqueV2) {
    this.risques.find((r) => r.id === idRisque)?.metsAJour(donnees);
  }
}
