const expect = require('expect.js');

const { ErreurRisqueInconnu } = require('../../src/erreurs');
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

  it('retourne un JSON avec incluant la description du risque', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON().description).to.equal('Une description');
  });

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
      description: 'Une description',
      niveauGravite: 'unNiveau',
    });
  });

  it('connaît sa description', () => {
    referentiel.recharge({
      risques: { unRisque: { description: 'Une description' } },
    });
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.descriptionRisque()).to.equal('Une description');
  });

  it('retourne un JSON partiel si certaines informations sont inexistantes', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON()).to.eql({ id: 'unRisque', description: 'Une description' });
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

  it('sait se sérialiser', () => {
    const risque = new RisqueGeneral({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    }, referentiel);

    expect(risque.donneesSerialisees()).to.eql({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    });
  });
});
