const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const InformationsGenerales = require('../../src/modeles/informationsGenerales');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

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
    const infos = new InformationsGenerales();
    expect(infos.descriptionNatureService()).to.equal('Nature du service non renseignée');
  });

  elles("détectent qu'elles sont encore à saisir", () => {
    const infos = new InformationsGenerales();
    expect(infos.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  elles("détectent qu'elles sont partiellement saisies", () => {
    const infos = new InformationsGenerales({ nomService: 'Super Service' });
    expect(infos.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
  });

  elles("détectent qu'elles sont complètement saisies", () => {
    const infos = new InformationsGenerales({
      nomService: 'Super Service',
      dejaMisEnLigne: 'non',
      delaiAvantImpactCritique: 'uneJournee',
      presenceResponsable: 'oui',
    });

    expect(infos.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });

  elles('délèguent au référentiel la description des documents complémentaires à fournir', () => {
    const referentiel = {
      documentsComplementaires: (idFonctionnalites, idDonnees, idDelai) => {
        expect(idFonctionnalites).to.eql(['f1', 'f2']);
        expect(idDonnees).to.eql(['d1', 'd2']);
        expect(idDelai).to.equal('unDelai');
        return ['un document', 'un autre'];
      },
    };
    const infos = new InformationsGenerales({
      fonctionnalites: ['f1', 'f2'],
      donneesCaracterePersonnel: ['d1', 'd2'],
      delaiAvantImpactCritique: 'unDelai',
    }, referentiel);

    expect(infos.descriptionsDocumentsComplementaires()).to.eql(['un document', 'un autre']);
  });
});
