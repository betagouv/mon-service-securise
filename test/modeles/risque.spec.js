const expect = require('expect.js');

const { ErreurNiveauGraviteInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const Risque = require('../../src/modeles/risque');

describe('Un risque', () => {
  it('vérifie que le niveau de gravité est bien répertorié', (done) => {
    try {
      new Risque({ niveauGravite: 'niveauInconnu' });
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurNiveauGraviteInconnu);
      expect(e.message).to.equal("Le niveau de gravité \"niveauInconnu\" n'est pas répertorié");
      done();
    }
  });

  it('connaît son importance', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { negligeable: { important: false }, significatif: { important: true } },
    });

    const risqueNegligeable = new Risque({ niveauGravite: 'negligeable' }, referentiel);
    expect(risqueNegligeable.important()).to.be(false);

    const risqueSignificatif = new Risque({ niveauGravite: 'significatif' }, referentiel);
    expect(risqueSignificatif.important()).to.be(true);
  });

  it('connaît la description de son niveau de gravité', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: { description: 'Une description' } },
    });
    const risque = new Risque({ niveauGravite: 'unNiveau' }, referentiel);
    expect(risque.descriptionNiveauGravite()).to.equal('Une description');
  });
});
