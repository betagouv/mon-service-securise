import ElementsConstructibles from '../../src/modeles/elementsConstructibles.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import InformationsService from '../../src/modeles/informationsService.ts';

class ElementsDuTest extends InformationsService {
  constructor(donnees: Record<string, unknown>) {
    super({
      proprietesAtomiquesRequises: ['v'],
    });
    this.renseigneProprietes(donnees);
  }
}

describe("Une liste d'éléments constructibles", () => {
  it('retourne tous les items sous forme de tableau', () => {
    const items = new ElementsConstructibles(
      ElementsDuTest,
      {
        items: [{ v: 1 }, { v: 2 }, { v: 3 }],
      },
      creeReferentielVide()
    );
    const tousLesItems = items.tous();
    expect(tousLesItems.length).toEqual(3);
    expect(tousLesItems[0].v).toEqual(1);
  });
});
