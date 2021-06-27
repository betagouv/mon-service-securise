const expect = require('expect.js');

const Referentiel = require('../src/referentiel');

describe('Le référentiel', () => {
  it("sait décrire la nature du service à partir d'identifiants", () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: { siteInternet: { description: 'Site internet' } },
    });
    expect(referentiel.natureService(['siteInternet'])).to.equal('Site internet');
  });

  it('sait décrire la nature du service à partir de plusieurs identifiants', () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: {
        siteInternet: { description: 'Site internet' },
        api: { description: 'API' },
      },
    });
    expect(referentiel.natureService(['siteInternet', 'api'])).to.equal('Site internet, API');
  });

  it('donne une description par défaut si aucun identifiant de nature service', () => {
    const referentiel = Referentiel.creeReferentiel({});
    expect(referentiel.natureService([])).to.equal('Nature du service non renseignée');
  });

  it('connaît la liste des différentes natures de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({ naturesService: { uneClef: 'une valeur' } });
    expect(referentiel.naturesService()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des différentes provenances de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      provenancesService: { uneClef: 'une valeur' },
    });

    expect(referentiel.provenancesService()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des fonctionnalités possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: { uneClef: 'une valeur' },
    });

    expect(referentiel.fonctionnalites()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: { uneClef: 'une valeur' },
    });

    expect(referentiel.donneesCaracterePersonnel()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des délais avant impact critique', () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { uneClef: 'une valeur' },
    });

    expect(referentiel.delaisAvantImpactCritique()).to.eql({ uneClef: 'une valeur' });
  });
});
