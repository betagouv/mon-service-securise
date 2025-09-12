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
    const ligne: RegleBrut = {
      ref: 'RECENSEMENT.1',
      'Statut Initial': 'Absente',
      modificateurs: [],
    };
    const parsing = new ParsingReglesDeMesuresV2([ligne]);

    expect(parsing.regles()).toHaveLength(1);
  });

  it('sait valoriser la présence dans le socle initial', () => {
    const ligne: RegleBrut = {
      ref: 'RECENSEMENT.1',
      'Statut Initial': 'Présente',
      modificateurs: [],
    };
    const parsing = new ParsingReglesDeMesuresV2([ligne]);

    expect(parsing.regles()[0].dansSocleInitial).toBe(true);
  });

  it('sait ajouter un modificateur indispensable sur un champ', () => {
    const ligne: RegleBrut = {
      ref: 'RECENSEMENT.1',
      'Statut Initial': 'Présente',
      modificateurs: [['Niveau de Sécurité', ['Basique', 'Indispensable']]],
    };
    const parsing = new ParsingReglesDeMesuresV2([ligne]);

    const regleUnique = parsing.regles()[0];
    expect(regleUnique.modificateurs).toEqual({
      niveauSecurite: [['niveau1', 'RendreIndispensable']],
    });
  });
});
