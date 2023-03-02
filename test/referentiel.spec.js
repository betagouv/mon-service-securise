const expect = require('expect.js');

const { ErreurDonneesReferentielIncorrectes } = require('../src/erreurs');
const Referentiel = require('../src/referentiel');

describe('Le référentiel', () => {
  describe('à sa création', () => {
    it("valide que la somme des coefficients pour le calcul de l'incide cyber vaut 1", () => {
      expect(() => Referentiel.creeReferentiel({
        indiceCyber: { coefficientIndispensables: 1.2, coefficientRecommandees: 0.8 },
      })).to.throwException((e) => {
        expect(e).to.be.an(ErreurDonneesReferentielIncorrectes);
        expect(e.message).to.equal(
          "La somme des coefficients pour le calcul de l'indice cyber vaut 2, alors qu'elle aurait dû valoir 1."
        );
      });
    });

    it('valide les valeurs par défaut des coefficients', () => {
      expect(() => Referentiel.creeReferentielVide()).to.not.throwException();
    });

    it('valide les valeurs des coefficients après la recharge', () => {
      const referentiel = Referentiel.creeReferentielVide();
      expect(() => referentiel.recharge({
        indiceCyber: { coefficientIndispensables: 1.2, coefficientRecommandees: 0.8 },
      })).to.throwException();
    });
  });

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
    expect(referentiel.typeService(['siteInternet', 'api']))
      .to.equal("Site internet, API mise à disposition par l'organisation");
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

  it('sait décrire un statut de déploiement', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsDeploiement: {
        uneClef: { description: 'Une description' },
      },
    });

    expect(referentiel.descriptionStatutDeploiement('uneClef')).to.equal('Une description');
  });

  it('connaît la liste des fonctionnalités possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: { uneClef: 'une valeur' },
    });

    expect(referentiel.fonctionnalites()).to.eql({ uneClef: 'une valeur' });
  });

  it('sait décrire une fonctionnalité', () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: { uneClef: { description: 'Une description' } },
    });

    expect(referentiel.descriptionFonctionnalite('uneClef')).to.equal('Une description');
  });

  it('sait décrire des fonctionnalités', () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(referentiel.descriptionsFonctionnalites(['clef1', 'clef2'])).to.eql(['Description 1', 'Description 2']);
  });

  it("sait décrire des fonctionnalités en restant robuste quand une fonctionnalité n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionsFonctionnalites(['clef'])).to.eql([]);
  });

  it('connaît la liste des données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: { uneClef: 'une valeur' },
    });

    expect(referentiel.donneesCaracterePersonnel()).to.eql({ uneClef: 'une valeur' });
  });

  it('sait décrire un type de données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: { uneClef: { description: 'Une description' } },
    });

    expect(referentiel.descriptionDonneesCaracterePersonnel('uneClef')).to.equal('Une description');
  });

  it('sait décrire des types de données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(referentiel.descriptionsDonneesCaracterePersonnel(['clef1', 'clef2'])).to.eql(['Description 1', 'Description 2']);
  });

  it("sait décrire des types de données à caractère personnel en restant robuste quand un type n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionsDonneesCaracterePersonnel(['clef'])).to.eql([]);
  });

  it('connaît la liste des délais avant impact critique', () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { uneClef: 'une valeur' },
    });

    expect(referentiel.delaisAvantImpactCritique()).to.eql({ uneClef: 'une valeur' });
  });

  it('sait décrire un délai avant impact critique', () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { uneClef: { description: 'une valeur' } },
    });

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).to.equal('une valeur');
  });

  it("reste robuste quand le délai avant impact critique n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).to.equal(undefined);
  });

  describe('sur demande de la liste des mesures', () => {
    it('retourne la liste', () => {
      const referentiel = Referentiel.creeReferentiel({
        mesures: { uneClef: 'une valeur' },
      });

      expect(referentiel.mesures()).to.eql({ uneClef: 'une valeur' });
    });

    it('retourne toujours la même liste', () => {
      const referentiel = Referentiel.creeReferentiel({
        mesures: { idMesure: { attributModifiable: 'Une valeur de référence' } },
      });

      const mesure = referentiel.mesure('idMesure');
      mesure.attributModifiable = 'Une valeur modifiée';

      expect(referentiel.mesures()).to.eql({ idMesure: { attributModifiable: 'Une valeur de référence' } });
    });
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

  it("connaît la liste des statuts d'avis de dossier d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutAvisDossierHomologation: { favorable: { description: 'Favorable' } },
    });

    expect(referentiel.statutAvisDossierHomologation()).to.eql({ favorable: { description: 'Favorable' } });
  });

  it("connaît la liste des identifiants de statuts d'avis de dossier d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutAvisDossierHomologation: { favorable: { }, defavorable: { } },
    });

    expect(referentiel.identifiantsStatutAvisDossierHomologation()).to.eql(['favorable', 'defavorable']);
  });

  it("sait si un identifiant fait parti de la liste des statuts d'avis de dossier d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutAvisDossierHomologation: { favorable: { } },
    });

    expect(referentiel.estIdentifiantStatutAvisDossierHomologationConnu('favorable')).to.be(true);
    expect(referentiel.estIdentifiantStatutAvisDossierHomologationConnu('unStatutInconnu')).to.be(false);
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

  it('sait si un identifiant fait partie de la liste des échéances de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneEch: {} },
    });

    expect(referentiel.estIdentifiantEcheanceRenouvellementConnu('uneEch')).to.be(true);
    expect(referentiel.estIdentifiantEcheanceRenouvellementConnu('uneInconnue')).to.be(false);
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

  describe('sur demande des infos sur les niveaux de gravité des risques', () => {
    it('retourne les informations', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: { niveauUn: { position: 0 }, niveauDeux: { position: 1 } },
      });

      expect(referentiel.infosNiveauxGravite()).to.eql([
        { identifiant: 'niveauUn', position: 0 },
        { identifiant: 'niveauDeux', position: 1 },
      ]);
    });

    it("sait retourner les informations dans l'ordre inverse", () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: { niveauUn: { position: 0 }, niveauDeux: { position: 1 } },
      });

      expect(referentiel.infosNiveauxGravite(true)).to.eql([
        { identifiant: 'niveauDeux', position: 1 },
        { identifiant: 'niveauUn', position: 0 },
      ]);
    });
  });

  describe('sur demande des infos sur les niveaux de gravité concernés des risques', () => {
    it('sait retourner les infos en ordre inverse', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          niveauUn: { position: 0, nonConcerne: true },
          niveauDeux: { position: 1 },
          niveauTrois: { position: 2 },
        },
      });

      const positions = referentiel.infosNiveauxGraviteConcernes(true).map((info) => info.position);

      expect(positions).to.eql([2, 1]);
    });

    it('inclue les identifiants dans les informations', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
          niveauTrois: { position: 2 },
        },
      });

      const identifiants = referentiel.infosNiveauxGraviteConcernes()
        .map((info) => info.identifiant);
      expect(identifiants).to.eql(['niveauUn', 'niveauDeux', 'niveauTrois']);
    });
  });

  it("connaît l'action de saisie suivante d'une action de saisie donnée", () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: {
        uneAction: { position: 0 }, actionSuivante: { position: 1 },
      },
    });

    expect(referentiel.actionSuivante('uneAction')).to.equal('actionSuivante');
  });

  it("retourne `undefined` s'il n'y a pas d'action de saisie suivante", () => {
    const referentiel = Referentiel.creeReferentiel({
      actionsSaisie: { uneAction: { position: 0 } },
    });

    expect(referentiel.actionSuivante('uneAction')).to.be(undefined);
  });

  it('connaît la liste des départements', () => {
    const referentiel = Referentiel.creeReferentiel({
      departements: [
        { nom: 'Ain', code: '01' },
        { nom: 'Aisne', code: '02' },
      ],
    });

    expect(referentiel.departements()).to.have.length(2);
    expect(referentiel.departements()).to.eql([
      { nom: 'Ain', code: '01' },
      { nom: 'Aisne', code: '02' },
    ]);
  });

  it('connaît la liste des codes des départements', () => {
    const referentiel = Referentiel.creeReferentiel({
      departements: [
        { nom: 'Ain', code: '01' },
        { nom: 'Aisne', code: '02' },
      ],
    });

    expect(referentiel.codeDepartements()).to.eql(['01', '02']);
  });

  it("trouve le nom d'un département grace à son code", () => {
    const referentiel = Referentiel.creeReferentiel({
      departements: [{ nom: 'Ain', code: '01' }],
    });

    expect(referentiel.departement('01')).to.equal('Ain');
  });

  it('reste robuste quand la liste des départements est absente', () => {
    const referentiel = Referentiel.creeReferentiel({});

    expect(referentiel.departements()).to.eql([]);
    expect(referentiel.departement('01')).to.equal(undefined);
    expect(referentiel.codeDepartements()).to.equal(undefined);
  });

  it("connaît la liste des documents d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      documentsHomologation: {
        decision: { description: 'la decision' },
        annexes: { description: 'les annexes' },
      },
    });

    expect(referentiel.tousDocumentsHomologation()).to.eql([
      { id: 'decision', description: 'la decision' },
      { id: 'annexes', description: 'les annexes' }]);
  });

  it('connaît la première étape du parcours Homologation', () => {
    const premiereEtape = { id: 'premiere', numero: 1 };
    const referentiel = Referentiel.creeReferentiel({
      etapesParcoursHomologation: [premiereEtape],
    });

    expect(referentiel.premiereEtapeParcours()).to.equal(premiereEtape);
  });

  describe("sur demande du numéro d'une étape du parcours Homologation", () => {
    it("sait retrouver le numéro d'une étape à partir de son ID", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [{ id: 'premiere', numero: 1 }],
      });

      expect(referentiel.numeroEtape('premiere')).to.be(1);
    });

    it("reste robuste lorsque l'ID de l'étape n'existe pas", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [{ id: 'premiere', numero: 1 }],
      });

      expect(referentiel.numeroEtape('inconnue')).to.be(undefined);
    });
  });

  describe("sur demande de l'ID d'une « étape suivante » du parcours Homologation", () => {
    it("sait retrouver l'ID de l'étape suivant une étape donnée", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [{ id: 'premiere', numero: 1 }, { id: 'deuxieme', numero: 2 }],
      });

      expect(referentiel.idEtapeSuivante('premiere')).to.equal('deuxieme');
    });
  });

  describe("sur demande d'une URL de document d'homologation", () => {
    it("sait construire l'URL d'un document d'homologation", () => {
      const referentiel = Referentiel.creeReferentiel({
        documentsHomologation: {
          decision: { urlTelechargement: '/pdf/:idService/decision.pdf' },
        },
      });

      expect(referentiel.urlDocumentHomologation('decision', '123')).to.eql('/pdf/123/decision.pdf');
    });

    it("reste robuste si l'identifiant du document est inconnu", () => {
      const referentiel = Referentiel.creeReferentiel({
        documentsHomologation: { },
      });

      expect(referentiel.urlDocumentHomologation('decision', '123')).to.be(undefined);
    });

    it("reste robuste si le document n'est pas associé à une URL", () => {
      const referentiel = Referentiel.creeReferentiel({
        documentsHomologation: { decision: { } },
      });

      expect(referentiel.urlDocumentHomologation('decision', '123')).to.be(undefined);
    });
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

  describe("sur une demande de tranche de l'indice cyber", () => {
    it("récupère la tranche dans laquelle l'indice est compris", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = Referentiel.creeReferentiel({ tranchesIndicesCybers: [tranche] });

      expect(referentiel.trancheIndiceCyber(1)).to.eql(tranche);
      expect(referentiel.trancheIndiceCyber(0)).to.eql(tranche);

      expect(referentiel.trancheIndiceCyber(2)).to.not.eql(tranche);
    });

    it("récupère la tranche dans laquelle l'indice est égale à la borne supérieure quand elle est inclue", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2, borneSuperieureIncluse: true };
      const referentiel = Referentiel.creeReferentiel({ tranchesIndicesCybers: [tranche] });

      expect(referentiel.trancheIndiceCyber(2)).to.eql(tranche);
    });

    it("reste robuste quand il n'y a pas d'indice", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = Referentiel.creeReferentiel({ tranchesIndicesCybers: [tranche] });

      expect(referentiel.trancheIndiceCyber()).to.eql({});
    });

    it("reste robuste quand l'indice n'est pas dans une tranche", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = Referentiel.creeReferentiel({ tranchesIndicesCybers: [tranche] });

      expect(referentiel.trancheIndiceCyber(6)).to.eql({});
    });
  });
});
