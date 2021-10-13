const expect = require('expect.js');

const { ErreurRisqueInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');

describe('Un risque', () => {
  let referentiel;

  beforeEach(() => (
    referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: { description: 'Une description' } },
    })
  ));

  it('sait se décrire', () => {
    const risque = new RisqueGeneral({ id: 'unRisque', commentaire: 'Un commentaire' }, referentiel);

    expect(risque.id).to.equal('unRisque');
    expect(risque.commentaire).to.equal('Un commentaire');
    expect(risque.toJSON()).to.eql({
      id: 'unRisque',
      commentaire: 'Un commentaire',
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

  it('connaît sa description', () => {
    expect(referentiel.risques().unRisque.description).to.equal('Une description');
  });
});
