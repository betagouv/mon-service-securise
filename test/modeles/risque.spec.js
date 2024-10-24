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
      expect(e.message).to.equal(
        'Le niveau de gravité "niveauInconnu" n\'est pas répertorié'
      );
      done();
    }
  });

  it('connaît son importance', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: {
        negligeable: { important: false },
        significatif: { important: true },
      },
    });

    const risqueNegligeable = new Risque(
      { niveauGravite: 'negligeable' },
      referentiel
    );
    expect(risqueNegligeable.important()).to.be(false);

    const risqueSignificatif = new Risque(
      { niveauGravite: 'significatif' },
      referentiel
    );
    expect(risqueSignificatif.important()).to.be(true);
  });

  it('connaît la description de son niveau de gravité', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: { description: 'Une description' } },
    });
    const risque = new Risque({ niveauGravite: 'unNiveau' }, referentiel);
    expect(risque.descriptionNiveauGravite()).to.equal('Une description');
  });

  it('sait se décrire', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: { description: 'Une description' } },
    });
    const risque = new Risque(
      { niveauGravite: 'unNiveau', commentaire: 'Un commentaire' },
      referentiel
    );

    expect(risque.toJSON()).to.eql({
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    });
  });

  describe('sait calculer son niveau de risque', () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          nonConcerne: { description: 'Une description', position: 0 },
        },
        niveauxVraisemblance: {
          improbable: { description: 'Une description', position: 0 },
        },
        niveauxRisques: { eleve: [{ gravite: 0, vraisemblance: 0 }] },
      });
    });

    it("quand la gravité n'est pas définie", () => {
      const risque = new Risque({ niveauGravite: undefined });

      const niveauRisque = risque.niveauRisque();

      expect(niveauRisque).to.be('indeterminable');
      expect(Risque.NIVEAU_RISQUE_INDETERMINABLE).to.be('indeterminable');
    });

    it('quand la gravité et la vraisemblance sont définis dans la matrice de risques', () => {
      const risque = new Risque(
        { niveauGravite: 'nonConcerne', niveauVraisemblance: 'improbable' },
        referentiel
      );

      const niveauRisque = risque.niveauRisque();

      expect(niveauRisque).to.be('eleve');
    });
  });
});
