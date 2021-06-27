const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const Homologation = require('../../src/modeles/homologation');

describe('Une homologation', () => {
  it('sait se convertir en JSON', () => {
    const referentiel = Referentiel.creeReferentiel({});
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'Super Service',
    }, referentiel);

    expect(homologation.toJSON()).to.eql({
      id: '123', nomService: 'Super Service',
    });
  });

  it('sait décrire la nature du service', () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: { uneNature: 'Une nature', uneAutre: 'Une autre' },
    });
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'nom', natureService: ['uneNature', 'uneAutre'],
    }, referentiel);

    expect(homologation.descriptionNatureService()).to.equal('Une nature, Une autre');
  });

  it("se comporte correctement si la nature du service n'est pas présente", () => {
    const referentiel = Referentiel.creeReferentiel({});
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'nom',
    }, referentiel);

    expect(homologation.descriptionNatureService()).to.equal('Nature du service non renseignée');
  });
});
