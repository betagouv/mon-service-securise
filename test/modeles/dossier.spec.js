const expect = require('expect.js');

const Dossier = require('../../src/modeles/dossier');
const { ErreurDateHomologationInvalide, ErreurDureeValiditeInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

describe("Un dossier d'homologation", () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() => referentiel.recharge({ echeancesRenouvellement: { unAn: {} } }));

  it('sait se convertir en JSON', () => {
    const dossier = new Dossier(
      { id: '123', dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      referentiel,
    );

    expect(dossier.toJSON()).to.eql({ id: '123', dateHomologation: '2022-12-01', dureeValidite: 'unAn' });
  });

  it('valide la valeur passée pour la durée de validité', (done) => {
    try {
      new Dossier({ dureeValidite: 'dureeInvalide' });
      done('la création du dossier aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurDureeValiditeInvalide);
      expect(e.message).to.equal('La durée de validité "dureeInvalide" est invalide');
      done();
    }
  });

  it("valide la valeur passée pour la date d'homologation", (done) => {
    try {
      new Dossier({ dateHomologation: '2022-13-01' });
      done('la création du dossier aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurDateHomologationInvalide);
      expect(e.message).to.equal('La date "2022-13-01" est invalide');
      done();
    }
  });

  it("ne lève pas d'exception si la durée de validité ou la date d'homologation ne sont pas renseignées", (done) => {
    try {
      new Dossier();
      done();
    } catch (e) {
      done("la création du dossier n'aurait pas dû lever une exception");
    }
  });

  it('connaît la description de sa durée de validité', () => {
    referentiel.recharge({ echeancesRenouvellement: { unAn: { description: '1 an' } } });
    const dossier = new Dossier({ dureeValidite: 'unAn' }, referentiel);
    expect(dossier.descriptionDureeValidite()).to.equal('1 an');
  });

  it("présente la date d'homologation localisée en français", () => {
    const dossier = new Dossier({ dateHomologation: '2022-11-27' });
    expect(dossier.descriptionDateHomologation()).to.equal('27/11/2022');
  });

  it("présente une chaîne vide s'il n'y a pas de date d'homologation renseignée", () => {
    const dossier = new Dossier();
    expect(dossier.descriptionDateHomologation()).to.equal('');
  });
});
