const expect = require('expect.js');

const Referentiel = require('../src/referentiel');

describe('Le référentiel', () => {
  it("sait décrire la nature du service à partir d'identifiants", () => {
    const referentiel = Referentiel.creeReferentiel({ naturesService: { siteInternet: 'Site internet' } });
    expect(referentiel.natureService(['siteInternet'])).to.equal('Site internet');
  });

  it('sait décrire la nature du service à partir de plusieurs identifiants', () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: { siteInternet: 'Site internet', api: 'API' },
    });
    expect(referentiel.natureService(['siteInternet', 'api'])).to.equal('Site internet, API');
  });

  it('donne une description par défaut si aucun identifiant de nature service', () => {
    const referentiel = Referentiel.creeReferentiel({});
    expect(referentiel.natureService([])).to.equal('Nature du service non renseignée');
  });

  it('connaît la liste des différentes natures de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({ naturesService: { api: 'API' } });
    expect(referentiel.naturesService()).to.eql({ api: 'API' });
  });
});
