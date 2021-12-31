const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');
const Risques = require('../../src/modeles/risques');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');

const ils = it;

describe('Les risques liés à une homologation', () => {
  ils('agrègent des risques spécifiques', () => {
    const risques = new Risques({ risquesSpecifiques: [
      { description: 'Un risque spécifique', commentaire: 'Un commentaire' },
    ] });

    expect(risques.risquesSpecifiques).to.be.a(RisquesSpecifiques);
  });

  describe('sur demande du statut de saisie', () => {
    ils("retournent `A_SAISIR` s'il n'y a encore eu aucune saisie", () => {
      const risques = new Risques({});
      expect(risques.statutSaisie()).to.equal(Risques.A_SAISIR);
    });

    ils('retournent `COMPLETES` si tous les risques spécifiques sont complètement saisis', () => {
      const referentiel = Referentiel.creeReferentiel({ niveauxGravite: { grave: {} } });
      const risques = new Risques({
        risquesSpecifiques: [{ description: 'Un risque spécifique', niveauGravite: 'grave' }],
      }, referentiel);

      expect(risques.statutSaisie()).to.equal(Risques.COMPLETES);
    });

    ils("retournent `A_COMPLETER` si au moins un risque spécifique n'a pas de description", () => {
      const risques = new Risques({
        risquesSpecifiques: [{ commentaire: 'Un commentaire sans description' }],
      });

      expect(risques.statutSaisie()).to.equal(Risques.A_COMPLETER);
    });
  });

  describe('sur demande des risques principaux', () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: {}, unAutreRisque: {} },
      niveauxGravite: {
        negligeable: { position: 0, important: false },
        significatif: { position: 1, important: true },
        critique: { position: 2, important: true },
      },
    });

    ils('conservent les risques généraux importants', () => {
      const risques = new Risques({
        risquesGeneraux: [
          { id: 'unRisque', niveauGravite: 'negligeable' },
          { id: 'unAutreRisque', niveauGravite: 'significatif' },
        ],
      }, referentiel);
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).to.equal(1);
      expect(risquesPrincipaux[0].id).to.equal('unAutreRisque');
    });

    ils('conservent les risques spécifiques importants', () => {
      const risques = new Risques({
        risquesSpecifiques: [
          { description: 'Un risque', niveauGravite: 'negligeable' },
          { description: 'Un autre risque', niveauGravite: 'significatif' },
        ],
      }, referentiel);
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).to.equal(1);
      expect(risquesPrincipaux[0].description).to.equal('Un autre risque');
    });

    ils('trient les risques par ordre décroisant de gravité', () => {
      const risques = new Risques({
        risquesGeneraux: [
          { id: 'unRisque', niveauGravite: 'negligeable' },
          { id: 'unAutreRisque', niveauGravite: 'significatif' },
        ],
        risquesSpecifiques: [
          { description: 'Un risque', niveauGravite: 'negligeable' },
          { description: 'Un autre risque', niveauGravite: 'critique' },
        ],
      }, referentiel);
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).to.equal(2);
      expect(risquesPrincipaux[0]).to.be.a(RisqueSpecifique);
      expect(risquesPrincipaux[1]).to.be.a(RisqueGeneral);
    });
  });

  ils('paginent tous les agrégats', () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: {}, unAutreRisque: {} },
    });

    const risques = new Risques({
      risquesGeneraux: [{ id: 'unRisque' }, { id: 'unAutreRisque' }],
      risquesSpecifiques: [{ description: 'Un risque' }, { description: 'Un autre risque' }],
    }, referentiel);
    const risquesPagines = risques.pagines(3);

    expect(risquesPagines.length).to.equal(2);
    expect(risquesPagines[0].length).to.eql(3);
    expect(risquesPagines[1].length).to.eql(1);
  });
});
