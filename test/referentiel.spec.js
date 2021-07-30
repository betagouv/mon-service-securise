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
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.natureService([])).to.equal('Nature du service non renseignée');
  });

  it('sait décrire la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { france: { description: 'Quelque part en France' } },
    });

    expect(referentiel.localisationDonnees('france')).to.equal('Quelque part en France');
  });

  it('donne une description par défaut si pas de localisation des données', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.localisationDonnees()).to.equal('Localisation des données non renseignée');
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

  it('connaît la liste des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { uneClef: 'une valeur' },
    });

    expect(referentiel.mesures()).to.eql({ uneClef: 'une valeur' });
  });

  it('sait si une mesure est indispensable', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { mesureIndispensable: { indispensable: true }, mesureRecommandee: {} },
    });

    expect(referentiel.mesureIndispensable('mesureIndispensable')).to.be(true);
    expect(referentiel.mesureIndispensable('mesureRecommandee')).to.be(false);
  });

  it('connaît les identifiants des mesures indispensables', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { m1: { indispensable: true }, m2: { indispensable: true }, m3: {} },
    });

    expect(referentiel.identifiantsMesuresIndispensables()).to.eql(['m1', 'm2']);
  });

  it('connaît les identifiants des mesures recommandees', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { m1: { indispensable: true }, m2: { indispensable: true }, m3: {} },
    });

    expect(referentiel.identifiantsMesuresRecommandees()).to.eql(['m3']);
  });

  it('connaît la liste des catégories de mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { uneClef: 'une valeur' },
    });

    expect(referentiel.categoriesMesures()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants de catégories', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { uneClef: 'une valeur' },
    });

    expect(referentiel.identifiantsCategoriesMesures()).to.eql(['uneClef']);
  });

  it('sait décrire une catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { uneCategorie: 'une description' },
    });

    expect(referentiel.descriptionCategorie('uneCategorie')).to.equal('une description');
  });

  it('connaît la liste des risques', () => {
    const referentiel = Referentiel.creeReferentiel({ risques: { uneClef: 'une valeur' } });
    expect(referentiel.risques()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants des risques repertoriés', () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: {}, unAutreRisque: {} },
    });

    expect(referentiel.identifiantsRisques()).to.eql(['unRisque', 'unAutreRisque']);
  });

  it('connaît la liste des identifiants de mesures répertoriées', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { uneMesure: {}, uneAutreMesure: {} },
    });

    expect(referentiel.identifiantsMesures()).to.eql(['uneMesure', 'uneAutreMesure']);
  });

  it('connaît la liste des localisations de données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { uneClef: 'une valeur' },
    });

    expect(referentiel.localisationsDonnees()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants des localisations de données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { uneLocalisation: {}, uneAutreLocalisation: {} },
    });

    expect(referentiel.identifiantsLocalisationsDonnees()).to.eql(
      ['uneLocalisation', 'uneAutreLocalisation']
    );
  });

  it('connaît la liste des échéances de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneClef: 'une valeur' },
    });

    expect(referentiel.echeancesRenouvellement()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants de chaque échéance de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneEch: {}, uneAutreEch: {} },
    });

    expect(referentiel.identifiantsEcheancesRenouvellement()).to.eql(['uneEch', 'uneAutreEch']);
  });

  it("sait décrire l'échéance de l'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneEcheance: { expiration: 'description expiration' } },
    });

    expect(referentiel.descriptionExpiration('uneEcheance')).to.equal('description expiration');
  });

  it("donne une valeur par défaut pour l'échéance d'homologation", () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.descriptionExpiration()).to.equal('Information non renseignée');
  });

  it('peut être construit sans donnée', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.naturesService()).to.eql({});
  });

  it("peut être rechargé avec d'autres données", () => {
    const referentiel = Referentiel.creeReferentielVide();
    referentiel.recharge({ naturesService: { uneClef: 'une valeur' } });
    expect(referentiel.naturesService()).to.eql({ uneClef: 'une valeur' });
  });
});
