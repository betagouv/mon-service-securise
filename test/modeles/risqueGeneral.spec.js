const expect = require('expect.js');

const { ErreurNiveauGraviteInconnu, ErreurRisqueInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');

describe('Un risque général', () => {
  let referentiel;

  beforeEach(() => (
    referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: {} },
      risques: { unRisque: { description: 'Une description' } },
    })
  ));

  it('sait se décrire', () => {
    const risque = new RisqueGeneral({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    }, referentiel);

    expect(risque.id).to.equal('unRisque');
    expect(risque.commentaire).to.equal('Un commentaire');
    expect(risque.niveauGravite).to.equal('unNiveau');
    expect(risque.toJSON()).to.eql({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    });
  });

  it('retourne un JSON partiel si certaines informations sont inexistantes', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON()).to.eql({ id: 'unRisque' });
  });

  it('vérifie que le risque est bien répertorié', (done) => {
    try {
      new RisqueGeneral({ id: 'identifiantInconnu' }, referentiel);
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurRisqueInconnu);
      expect(e.message).to.equal("Le risque \"identifiantInconnu\" n'est pas répertorié");
      done();
    }
  });

  it('vérifie que le niveau de gravité est bien répertorié', (done) => {
    try {
      new RisqueGeneral({ id: 'unRisque', niveauGravite: 'niveauInconnu' }, referentiel);
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurNiveauGraviteInconnu);
      expect(e.message).to.equal("Le niveau de gravité \"niveauInconnu\" n'est pas répertorié");
      done();
    }
  });

  it('connaît son importance', () => {
    referentiel.recharge({
      risques: { unRisque: {} },
      niveauxGravite: { negligeable: { important: false }, significatif: { important: true } },
    });

    const risqueNegligeable = new RisqueGeneral({
      id: 'unRisque', niveauGravite: 'negligeable',
    }, referentiel);
    expect(risqueNegligeable.important()).to.be(false);

    const risqueSignificatif = new RisqueGeneral({
      id: 'unRisque', niveauGravite: 'significatif',
    }, referentiel);
    expect(risqueSignificatif.important()).to.be(true);
  });
});
