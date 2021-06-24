const expect = require('expect.js');

const Homologation = require('../../src/modeles/homologation');

describe('Une homologation', () => {
  it('sait se convertir en JSON', () => {
    const referentiel = { natureService: { api: 'API' } };
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'Super Service', natureService: ['api'],
    }, referentiel);

    expect(homologation.toJSON()).to.eql({
      id: '123', nomService: 'Super Service',
    });
  });

  it('sait décrire la nature du service', () => {
    const referentiel = { natureService: { uneNature: 'Une nature', uneAutre: 'Une autre' } };
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'nom', natureService: ['uneNature', 'uneAutre'],
    }, referentiel);

    expect(homologation.descriptionNatureService()).to.equal('Une nature, Une autre');
  });
});
