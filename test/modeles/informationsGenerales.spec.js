const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const InformationsGenerales = require('../../src/modeles/informationsGenerales');

const elles = it;

describe('Les informations générales', () => {
  elles('connaissent leurs constituants', () => {
    const infos = new InformationsGenerales({
      dejaMisEnLigne: 'oui',
      delaiAvantImpactCritique: 'unDelai',
      donneesCaracterePersonnel: ['desDonnees'],
      fonctionnalites: ['uneFonctionnalite'],
      natureService: ['uneNature'],
      nomService: 'Super Service',
      presenceResponsable: 'non',
      provenanceService: ['uneProvenance'],
    });

    expect(infos.dejaMisEnLigne).to.be('oui');
    expect(infos.delaiAvantImpactCritique).to.equal('unDelai');
    expect(infos.donneesCaracterePersonnel).to.eql(['desDonnees']);
    expect(infos.fonctionnalites).to.eql(['uneFonctionnalite']);
    expect(infos.natureService).to.eql(['uneNature']);
    expect(infos.nomService).to.equal('Super Service');
    expect(infos.presenceResponsable).to.be('non');
    expect(infos.provenanceService).to.eql(['uneProvenance']);
  });

  elles('décrivent la nature du service', () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: {
        uneNature: { description: 'Une nature' },
        uneAutre: { description: 'Une autre' },
      },
    });
    const infos = new InformationsGenerales({
      nomService: 'nom', natureService: ['uneNature', 'uneAutre'],
    }, referentiel);

    expect(infos.descriptionNatureService()).to.equal('Une nature, Une autre');
  });

  elles("se comportent correctement si la nature du service n'est pas présente", () => {
    const infos = new InformationsGenerales({ nomService: 'nom' });
    expect(infos.descriptionNatureService()).to.equal('Nature du service non renseignée');
  });
});
