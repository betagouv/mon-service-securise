const expect = require('expect.js');

const Decision = require('../../../src/modeles/etapes/decision');
const {
  ErreurDateHomologationInvalide,
  ErreurDureeValiditeInvalide,
} = require('../../../src/erreurs');
const Referentiel = require('../../../src/referentiel');

describe('Une étape « Décision »', () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() =>
    referentiel.recharge({ echeancesRenouvellement: { unAn: {} } })
  );

  it('sait se convertir en JSON', () => {
    const decision = new Decision(
      { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      referentiel
    );

    expect(decision.toJSON()).to.eql({
      dateHomologation: '2022-12-01',
      dureeValidite: 'unAn',
    });
  });

  it('valide la valeur passée pour la durée de validité', (done) => {
    try {
      new Decision({ dureeValidite: 'dureeInvalide' });
      done("la création d'une étape date aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurDureeValiditeInvalide);
      expect(e.message).to.equal(
        'La durée de validité "dureeInvalide" est invalide'
      );
      done();
    }
  });

  it("valide la valeur passée pour la date d'homologation", (done) => {
    try {
      new Decision({ dateHomologation: '2022-13-01' });
      done("la création d'une étape date aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurDateHomologationInvalide);
      expect(e.message).to.equal('La date "2022-13-01" est invalide');
      done();
    }
  });

  it("ne lève pas d'exception si la durée de validité ou la date d'homologation ne sont pas renseignées", (done) => {
    try {
      new Decision();
      done();
    } catch (e) {
      done("la création d'une étape date n'aurait pas dû lever une exception");
    }
  });

  describe('sur demande de la description de la durée de validité', () => {
    it('retourne la description provenant du référentiel', () => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { description: '1 an' } },
      });
      const decision = new Decision({ dureeValidite: 'unAn' }, referentiel);
      expect(decision.descriptionDureeValidite()).to.equal('1 an');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const decision = new Decision();
      expect(decision.descriptionDureeValidite()).to.equal('');
    });
  });

  it("présente la date d'homologation localisée en français", () => {
    const decision = new Decision({ dateHomologation: '2022-11-27' });
    expect(decision.descriptionDateHomologation()).to.equal('27/11/2022');
  });

  it("présente une chaîne vide s'il n'y a pas de date d'homologation renseignée", () => {
    const decision = new Decision();
    expect(decision.descriptionDateHomologation()).to.equal('');
  });

  describe('sur demande de la date de prochaine homologation', () => {
    beforeEach(() =>
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      })
    );

    it('retourne la date localisée en français', () => {
      const decision = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decision.descriptionProchaineDateHomologation()).to.equal(
        '27/11/2023'
      );
    });

    it("retourne une chaîne vide si la date n'est renseignée", () => {
      const decision = new Decision({ dureeValidite: 'unAn' }, referentiel);
      expect(decision.descriptionProchaineDateHomologation()).to.equal('');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const decision = new Decision({ dateHomologation: '2022-11-27' });
      expect(decision.descriptionProchaineDateHomologation()).to.equal('');
    });
  });

  describe("sur vérification que l'étape « Décision » est complète", () => {
    it("retourne `false` s'il manque la durée de validité", () => {
      const decisionIncomplete = new Decision({
        dateHomologation: '2022-11-27',
      });
      expect(decisionIncomplete.estComplete()).to.be(false);
    });

    it("retourne `false` s'il manque la date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const decisionIncomplete = new Decision(
        { dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).to.be(false);
    });

    it("retourne `true` s'il ne manque rien", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const decisionIncomplete = new Decision(
        { dateHomologation: '2022-11-27', dureeValidite: 'unAn' },
        referentiel
      );
      expect(decisionIncomplete.estComplete()).to.be(true);
    });
  });
});
