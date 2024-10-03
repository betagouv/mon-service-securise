const expect = require('expect.js');

const { ErreurNiveauGraviteInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');

describe('Un risque spécifique', () => {
  let referentiel;

  beforeEach(
    () =>
      (referentiel = Referentiel.creeReferentiel({
        niveauxGravite: { unNiveau: {} },
        categoriesRisques: { C1: {}, C2: {} },
      }))
  );

  it('sait se décrire', () => {
    const risque = new RisqueSpecifique(
      {
        intitule: 'Un intitulé',
        description: 'Un risque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
      },
      referentiel
    );

    expect(risque.intitule).to.equal('Un intitulé');
    expect(risque.description).to.equal('Un risque');
    expect(risque.commentaire).to.equal('Un commentaire');
    expect(risque.niveauGravite).to.equal('unNiveau');
  });

  it("expose son intitulé en cohérence avec l'API des classes sœurs", () => {
    const risque = new RisqueSpecifique({ intitule: 'Un risque' });
    expect(risque.intituleRisque()).to.equal('Un risque');
  });

  it("expose ses catégories en cohérence avec l'API des classes sœurs", () => {
    const risque = new RisqueSpecifique({
      intitule: 'Un risque',
      categories: ['C1', 'C2'],
    });
    expect(risque.categoriesRisque()).to.eql(['C1', 'C2']);
  });

  it('vérifie que le niveau de gravité est bien répertorié', (done) => {
    try {
      new RisqueSpecifique({ niveauGravite: 'niveauInconnu' }, referentiel);
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurNiveauGraviteInconnu);
      expect(e.message).to.equal(
        'Le niveau de gravité "niveauInconnu" n\'est pas répertorié'
      );
      done();
    }
  });
});
