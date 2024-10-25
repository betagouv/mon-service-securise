const expect = require('expect.js');

const { ErreurRisqueInconnu } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');
const Risque = require('../../src/modeles/risque');

describe('Un risque général', () => {
  let referentiel;

  beforeEach(
    () =>
      (referentiel = Referentiel.creeReferentiel({
        niveauxGravite: { unNiveau: {} },
        risques: {
          unRisque: {
            description: 'Une description',
            categories: ['CR1'],
            identifiantNumerique: 'R1',
          },
        },
      }))
  );

  it('retourne un JSON avec incluant la description du risque', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON().intitule).to.equal('Une description');
  });

  it('sait se décrire', () => {
    const risque = new RisqueGeneral(
      {
        id: 'unRisque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
        categories: ['CR1'],
      },
      referentiel
    );

    expect(risque.id).to.equal('unRisque');
    expect(risque.commentaire).to.equal('Un commentaire');
    expect(risque.niveauGravite).to.equal('unNiveau');
    expect(risque.toJSON()).to.eql({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      intitule: 'Une description',
      niveauGravite: 'unNiveau',
      categories: ['CR1'],
      identifiantNumerique: 'R1',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
    });
  });

  it('connaît son intitulé', () => {
    referentiel.recharge({
      risques: { unRisque: { description: 'Une description' } },
    });
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.intituleRisque()).to.equal('Une description');
  });

  it('connaît ses catégories', () => {
    referentiel.recharge({
      risques: {
        unRisque: { description: 'Une description', categories: ['C1'] },
      },
      categoriesRisques: { C1: {} },
    });
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.categoriesRisque()).to.eql(['C1']);
  });

  it('retourne un JSON partiel si certaines informations sont inexistantes', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON()).to.eql({
      id: 'unRisque',
      intitule: 'Une description',
      categories: ['CR1'],
      identifiantNumerique: 'R1',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
    });
  });

  it('vérifie que le risque est bien répertorié', (done) => {
    try {
      new RisqueGeneral({ id: 'identifiantInconnu' }, referentiel);
      done('La création du risque aurait dû lever une exception.');
    } catch (e) {
      expect(e).to.be.a(ErreurRisqueInconnu);
      expect(e.message).to.equal(
        'Le risque "identifiantInconnu" n\'est pas répertorié'
      );
      done();
    }
  });

  it('sait se sérialiser', () => {
    const risque = new RisqueGeneral(
      {
        id: 'unRisque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
      },
      referentiel
    );

    expect(risque.donneesSerialisees()).to.eql({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
    });
  });
});
