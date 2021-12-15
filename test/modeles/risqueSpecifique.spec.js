const expect = require('expect.js');

const { ErreurNiveauGraviteInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');

describe('Un risque spécifique', () => {
  let referentiel;

  beforeEach(() => (
    referentiel = Referentiel.creeReferentiel({ niveauxGravite: { unNiveau: {} } })
  ));

  it('sait se décrire', () => {
    const risque = new RisqueSpecifique({
      description: 'Un risque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    }, referentiel);

    expect(risque.description).to.equal('Un risque');
    expect(risque.commentaire).to.equal('Un commentaire');
    expect(risque.niveauGravite).to.equal('unNiveau');
  });

  it('vérifie que le niveau de gravité est bien répertorié', (done) => {
    try {
      new RisqueSpecifique({ niveauGravite: 'niveauInconnu' }, referentiel);
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurNiveauGraviteInconnu);
      expect(e.message).to.equal("Le niveau de gravité \"niveauInconnu\" n'est pas répertorié");
      done();
    }
  });
});
