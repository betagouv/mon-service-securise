const expect = require('expect.js');

const Referentiel = require('../src/referentiel');

describe('Le référentiel', () => {
  it("sait décrire le type de service à partir d'identifiants", () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: { siteInternet: { description: 'Site internet' } },
    });
    expect(referentiel.typeService(['siteInternet'])).to.equal('Site internet');
  });

  it('sait décrire le type de service à partir de plusieurs identifiants', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        siteInternet: { description: 'Site internet' },
        api: { description: "API mise à disposition par l'organisation" },
      },
    });
    expect(referentiel.typeService(['siteInternet', 'api'])).to.equal("Site internet, API mise à disposition par l'organisation");
  });

  it('donne une description par défaut si aucun identifiant de type de service', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.typeService([])).to.equal('Type de service non renseignée');
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

  it('connaît la liste des différents types de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({ typesService: { uneClef: 'une valeur' } });
    expect(referentiel.typesService()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des différentes provenances de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      provenancesService: { uneClef: 'une valeur' },
    });

    expect(referentiel.provenancesService()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des statuts de déploiement possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsDeploiement: { uneClef: 'une valeur' },
    });

    expect(referentiel.statutsDeploiement()).to.eql({ uneClef: 'une valeur' });
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

  it('sait décrire les statuts des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsMesures: { unStatut: 'Un statut' },
    });

    expect(referentiel.descriptionStatutMesure('unStatut')).to.equal('Un statut');
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

  it('connaît la liste des seuils de criticité', () => {
    const referentiel = Referentiel.creeReferentiel({ seuilsCriticites: ['fort', 'faible'] });
    expect(referentiel.seuilsCriticites()).to.eql(['fort', 'faible']);
  });

  it("connaît le seuil de criticité d'une fonctionnalité du service", () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: { idFonctionnalite: { seuilCriticite: 'unSeuil' } },
    });
    expect(referentiel.criticiteFonctionnalite('idFonctionnalite')).to.equal('unSeuil');
  });

  it('connaît le seuil de criticité des données conservées par le service', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: { idDonnees: { seuilCriticite: 'unSeuil' } },
    });
    expect(referentiel.criticiteDonnees('idDonnees')).to.equal('unSeuil');
  });

  it("connaît le seuil de criticité d'un délai avant impact critique", () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { idDelai: { seuilCriticite: 'unSeuil' } },
    });
    expect(referentiel.criticiteDelai('idDelai')).to.equal('unSeuil');
  });

  it('sait ordonner les criticités suivant leur ordre de déclaration', () => {
    const referentiel = Referentiel.creeReferentiel({
      seuilsCriticites: ['eleve', 'moyen', 'faible'],
    });
    expect(referentiel.criticiteMax('faible', 'eleve')).to.equal('eleve');
  });

  describe('quand demande du seuil de criticité', () => {
    it('tient compte du seuil de criticité max pour les fonctionnalités', () => {
      const referentiel = Referentiel.creeReferentiel({
        seuilsCriticites: ['eleve', 'moyen', 'faible'],
        fonctionnalites: {
          fFaible: { seuilCriticite: 'faible' },
          fMoyen: { seuilCriticite: 'moyen' },
        },
      });

      expect(referentiel.criticite(['fFaible', 'fMoyen'], [], undefined)).to.equal('moyen');
    });

    it('tient compte du seuil de criticité max pour les données sauvegardées', () => {
      const referentiel = Referentiel.creeReferentiel({
        seuilsCriticites: ['eleve', 'moyen', 'faible'],
        donneesCaracterePersonnel: {
          dFaible: { seuilCriticite: 'faible' },
          dEleve: { seuilCriticite: 'eleve' },
        },
      });

      expect(referentiel.criticite([], ['dFaible', 'dEleve'], undefined)).to.equal('eleve');
    });

    it('tient compte du seuil de criticité du délai avant impact', () => {
      const referentiel = Referentiel.creeReferentiel({
        seuilsCriticites: ['eleve', 'moyen', 'faible'],
        donneesCaracterePersonnel: { dFaible: { seuilCriticite: 'faible' } },
        fonctionnalites: { fMoyen: { seuilCriticite: 'moyen' } },
        delaisAvantImpactCritique: { dEleve: { seuilCriticite: 'eleve' } },
      });

      expect(referentiel.criticite(['fMoyen'], ['dFaible'], 'dEleve')).to.equal('eleve');
    });
  });

  it("donne une valeur par défaut pour l'échéance d'homologation", () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.descriptionExpiration()).to.equal('Information non renseignée');
  });

  it('connait les niveaux de gravité des risques', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: { position: 0, description: 'Une description' } },
    });

    expect(referentiel.niveauxGravite()).to.eql({
      unNiveau: { position: 0, description: 'Une description' },
    });
  });

  it('connaît la liste des identifiants des niveaux de gravité des risques', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: {}, unAutreNiveau: {} },
    });

    expect(referentiel.identifiantsNiveauxGravite()).to.eql(['unNiveau', 'unAutreNiveau']);
  });

  it('peut être construit sans donnée', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.typesService()).to.eql({});
  });

  it("peut être rechargé avec d'autres données", () => {
    const referentiel = Referentiel.creeReferentielVide();
    referentiel.recharge({ typesService: { uneClef: 'une valeur' } });
    expect(referentiel.typesService()).to.eql({ uneClef: 'une valeur' });
  });
});
