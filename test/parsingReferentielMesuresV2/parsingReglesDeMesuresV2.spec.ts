import {
  ParsingReglesDeMesuresV2,
  RegleBrut,
} from '../../src/parsingReferentielMesuresV2/parsingReglesDeMesuresV2.js';

describe('Le parsing des règles des mesures v2', () => {
  it('existe', () => {
    const parsing = new ParsingReglesDeMesuresV2([]);
    expect(parsing).toBeDefined();
  });

  it('produit des règles', () => {
    const parsing = new ParsingReglesDeMesuresV2([]);

    expect(parsing.regles()).toEqual([]);
  });

  it('produit une règle par ligne donnée en entrée', () => {
    const ligne: RegleBrut = { ref: 'RECENSEMENT.1' };
    const parsing = new ParsingReglesDeMesuresV2([ligne]);

    expect(parsing.regles()).toHaveLength(1);
  });
});
