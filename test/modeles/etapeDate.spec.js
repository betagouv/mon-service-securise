const expect = require('expect.js');

const EtapeDate = require('../../src/modeles/etapeDate');
const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

describe('Une étape date', () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() => referentiel.recharge({ echeancesRenouvellement: { unAn: {} } }));

  it('sait se convertir en JSON', () => {
    const etapeDate = new EtapeDate(
      { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      referentiel,
    );

    expect(etapeDate.toJSON()).to.eql({ dateHomologation: '2022-12-01', dureeValidite: 'unAn' });
  });

  it('valide la valeur passée pour la durée de validité', (done) => {
    try {
      new EtapeDate({ dureeValidite: 'dureeInvalide' });
      done("la création d'une étape date aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurDureeValiditeInvalide);
      expect(e.message).to.equal('La durée de validité "dureeInvalide" est invalide');
      done();
    }
  });

  it("valide la valeur passée pour la date d'homologation", (done) => {
    try {
      new EtapeDate({ dateHomologation: '2022-13-01' });
      done("la création d'une étape date aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.a(ErreurDateHomologationInvalide);
      expect(e.message).to.equal('La date "2022-13-01" est invalide');
      done();
    }
  });

  it("ne lève pas d'exception si la durée de validité ou la date d'homologation ne sont pas renseignées", (done) => {
    try {
      new EtapeDate();
      done();
    } catch (e) {
      done("la création d'une étape date n'aurait pas dû lever une exception");
    }
  });

  describe('sur demande de la description de la durée de validité', () => {
    it('retourne la description provenant du référentiel', () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { description: '1 an' } } });
      const etapeDate = new EtapeDate({ dureeValidite: 'unAn' }, referentiel);
      expect(etapeDate.descriptionDureeValidite()).to.equal('1 an');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const etapeDate = new EtapeDate();
      expect(etapeDate.descriptionDureeValidite()).to.equal('');
    });
  });

  it("présente la date d'homologation localisée en français", () => {
    const etapeDate = new EtapeDate({ dateHomologation: '2022-11-27' });
    expect(etapeDate.descriptionDateHomologation()).to.equal('27/11/2022');
  });

  it("présente une chaîne vide s'il n'y a pas de date d'homologation renseignée", () => {
    const etapeDate = new EtapeDate();
    expect(etapeDate.descriptionDateHomologation()).to.equal('');
  });

  describe('sur demande de la date de prochaine homologation', () => {
    beforeEach(() => referentiel.recharge(
      { echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } }
    ));

    it('retourne la date localisée en français', () => {
      const etapeDate = new EtapeDate({ dateHomologation: '2022-11-27', dureeValidite: 'unAn' }, referentiel);
      expect(etapeDate.descriptionProchaineDateHomologation()).to.equal('27/11/2023');
    });

    it("retourne une chaîne vide si la date n'est renseignée", () => {
      const etapeDate = new EtapeDate({ dureeValidite: 'unAn' }, referentiel);
      expect(etapeDate.descriptionProchaineDateHomologation()).to.equal('');
    });

    it("retourne une chaîne vide si la durée de validité n'est pas renseignée", () => {
      const etapeDate = new EtapeDate({ dateHomologation: '2022-11-27' });
      expect(etapeDate.descriptionProchaineDateHomologation()).to.equal('');
    });
  });

  describe("sur vérification que l'étape date est complète", () => {
    it("retourne `false` s'il manque la durée de validité", () => {
      const etapeDateIncomplete = new EtapeDate({ dateHomologation: '2022-11-27' });
      expect(etapeDateIncomplete.estComplete()).to.be(false);
    });

    it("retourne `false` s'il manque la date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const etapeDateIncomplete = new EtapeDate({ dureeValidite: 'unAn' }, referentiel);
      expect(etapeDateIncomplete.estComplete()).to.be(false);
    });

    it("retourne `true` s'il ne manque rien", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const etapeDateIncomplete = new EtapeDate({ dateHomologation: '2022-11-27', dureeValidite: 'unAn' }, referentiel);
      expect(etapeDateIncomplete.estComplete()).to.be(true);
    });
  });
});
