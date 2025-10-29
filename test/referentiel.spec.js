import expect from 'expect.js';
import { ErreurDonneesReferentielIncorrectes } from '../src/erreurs.js';
import * as Referentiel from '../src/referentiel.js';
import donneesDeProd from '../donneesReferentiel.js';
import Risque from '../src/modeles/risque.js';

describe('Le référentiel', () => {
  describe('à sa création', () => {
    it("valide que la somme des coefficients pour le calcul de l'incide cyber vaut 1", () => {
      expect(() =>
        Referentiel.creeReferentiel({
          indiceCyber: {
            coefficientIndispensables: 1.2,
            coefficientRecommandees: 0.8,
          },
        })
      ).to.throwException((e) => {
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
      expect(() =>
        referentiel.recharge({
          indiceCyber: {
            coefficientIndispensables: 1.2,
            coefficientRecommandees: 0.8,
          },
        })
      ).to.throwException();
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
    expect(referentiel.typeService(['siteInternet', 'api'])).to.equal(
      "Site internet, API mise à disposition par l'organisation"
    );
  });

  it('donne une description par défaut si aucun identifiant de type de service', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.typeService([])).to.equal(
      'Type de service non renseignée'
    );
  });

  it('sait décrire la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });

    expect(referentiel.localisationDonnees('france')).to.equal(
      'Quelque part en France'
    );
  });

  it('donne une description par défaut si pas de localisation des données', () => {
    const referentiel = Referentiel.creeReferentielVide();
    expect(referentiel.localisationDonnees()).to.equal(
      'Localisation des données non renseignée'
    );
  });

  it('connaît la liste des différents types de service possibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: { uneClef: 'une valeur' },
    });
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

    expect(referentiel.descriptionStatutDeploiement('uneClef')).to.equal(
      'Une description'
    );
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

    expect(referentiel.descriptionFonctionnalite('uneClef')).to.equal(
      'Une description'
    );
  });

  it('sait décrire des fonctionnalités', () => {
    const referentiel = Referentiel.creeReferentiel({
      fonctionnalites: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(referentiel.descriptionsFonctionnalites(['clef1', 'clef2'])).to.eql([
      'Description 1',
      'Description 2',
    ]);
  });

  it("sait décrire des fonctionnalités en restant robuste quand une fonctionnalité n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionsFonctionnalites(['clef'])).to.eql([]);
  });

  it('connaît la liste des données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: { uneClef: 'une valeur' },
    });

    expect(referentiel.donneesCaracterePersonnel()).to.eql({
      uneClef: 'une valeur',
    });
  });

  it('sait décrire un type de données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: {
        uneClef: { description: 'Une description' },
      },
    });

    expect(
      referentiel.descriptionDonneesCaracterePersonnel('uneClef')
    ).to.equal('Une description');
  });

  it('sait décrire des types de données à caractère personnel', () => {
    const referentiel = Referentiel.creeReferentiel({
      donneesCaracterePersonnel: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(
      referentiel.descriptionsDonneesCaracterePersonnel(['clef1', 'clef2'])
    ).to.eql(['Description 1', 'Description 2']);
  });

  it("sait décrire des types de données à caractère personnel en restant robuste quand un type n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionsDonneesCaracterePersonnel(['clef'])).to.eql(
      []
    );
  });

  it('connaît la liste des délais avant impact critique', () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { uneClef: 'une valeur' },
    });

    expect(referentiel.delaisAvantImpactCritique()).to.eql({
      uneClef: 'une valeur',
    });
  });

  it('sait décrire un délai avant impact critique', () => {
    const referentiel = Referentiel.creeReferentiel({
      delaisAvantImpactCritique: { uneClef: { description: 'une valeur' } },
    });

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).to.equal(
      'une valeur'
    );
  });

  it("reste robuste quand le délai avant impact critique n'est pas dans le référentiel", () => {
    const referentiel = Referentiel.creeReferentielVide();

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).to.equal(
      undefined
    );
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
        mesures: {
          idMesure: { attributModifiable: 'Une valeur de référence' },
        },
      });

      const mesure = referentiel.mesure('idMesure');
      mesure.attributModifiable = 'Une valeur modifiée';

      expect(referentiel.mesures()).to.eql({
        idMesure: { attributModifiable: 'Une valeur de référence' },
      });
    });
  });

  it('sait si une mesure est indispensable', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        mesureIndispensable: { indispensable: true },
        mesureRecommandee: {},
      },
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

    expect(referentiel.descriptionCategorie('uneCategorie')).to.equal(
      'une description'
    );
  });

  it('sait décrire les statuts des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsMesures: { unStatut: 'Un statut' },
    });

    expect(referentiel.descriptionStatutMesure('unStatut')).to.equal(
      'Un statut'
    );
  });

  it('connaît la liste des risques', () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { uneClef: 'une valeur' },
    });
    expect(referentiel.risques()).to.eql({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants des risques répertoriés', () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: {}, unAutreRisque: {} },
    });

    expect(referentiel.identifiantsRisques()).to.eql([
      'unRisque',
      'unAutreRisque',
    ]);
  });

  it("sait retrouver la définition d'un risque répertorié", () => {
    const referentiel = Referentiel.creeReferentiel({
      risques: { unRisque: { definition: 'Une définition' } },
    });

    expect(referentiel.definitionRisque('unRisque')).to.equal('Une définition');
  });

  it('connaît la liste des identifiants de mesures répertoriées', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { uneMesure: {}, uneAutreMesure: {} },
    });

    expect(referentiel.identifiantsMesures()).to.eql([
      'uneMesure',
      'uneAutreMesure',
    ]);
  });

  it('sait dire si un identifiant de mesure fait partie du référentiel', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { uneMesure: {} },
    });

    expect(referentiel.estIdentifiantMesureConnu('xyzMesure')).to.be(false);
    expect(referentiel.estIdentifiantMesureConnu('uneMesure')).to.be(true);
  });

  it('connaît la liste des localisations de données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { uneClef: 'une valeur' },
    });

    expect(referentiel.localisationsDonnees()).to.eql({
      uneClef: 'une valeur',
    });
  });

  it('connaît la liste des identifiants des localisations de données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { uneLocalisation: {}, uneAutreLocalisation: {} },
    });

    expect(referentiel.identifiantsLocalisationsDonnees()).to.eql([
      'uneLocalisation',
      'uneAutreLocalisation',
    ]);
  });

  it("connaît les statuts des avis de dossier d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsAvisDossierHomologation: {
        favorable: { description: 'Favorable' },
        defavorable: { description: 'Défavorable' },
      },
    });

    expect(referentiel.statutsAvisDossierHomologation()).to.eql({
      favorable: { description: 'Favorable' },
      defavorable: { description: 'Défavorable' },
    });
  });

  it("connaît le statut d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsHomologation: {
        expiree: { libelle: 'Expirée' },
      },
    });

    expect(referentiel.statutHomologation('expiree')).to.eql({
      libelle: 'Expirée',
    });
  });

  it("sait si un identifiant fait partie de la liste des statuts d'avis de dossier d'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsAvisDossierHomologation: { favorable: {} },
    });

    expect(
      referentiel.estIdentifiantStatutAvisDossierHomologationConnu('favorable')
    ).to.be(true);
    expect(
      referentiel.estIdentifiantStatutAvisDossierHomologationConnu(
        'unStatutInconnu'
      )
    ).to.be(false);
  });

  it('connaît la liste des échéances de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneClef: 'une valeur' },
    });

    expect(referentiel.echeancesRenouvellement()).to.eql({
      uneClef: 'une valeur',
    });
  });

  it('connaît la liste des identifiants de chaque échéance de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneEch: {}, uneAutreEch: {} },
    });

    expect(referentiel.identifiantsEcheancesRenouvellement()).to.eql([
      'uneEch',
      'uneAutreEch',
    ]);
  });

  it('sait si un identifiant fait partie de la liste des échéances de renouvellement', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { uneEch: {} },
    });

    expect(
      referentiel.estIdentifiantEcheanceRenouvellementConnu('uneEch')
    ).to.be(true);
    expect(
      referentiel.estIdentifiantEcheanceRenouvellementConnu('uneInconnue')
    ).to.be(false);
  });

  it('connait les niveaux de gravité des risques', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: {
        unNiveau: { position: 0, description: 'Une description' },
      },
    });

    expect(referentiel.niveauxGravite()).to.eql({
      unNiveau: { position: 0, description: 'Une description' },
    });
  });

  it('connaît la liste des identifiants des niveaux de gravité des risques', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: { unNiveau: {}, unAutreNiveau: {} },
    });

    expect(referentiel.identifiantsNiveauxGravite()).to.eql([
      'unNiveau',
      'unAutreNiveau',
    ]);
  });

  describe('sur demande des infos sur les niveaux de gravité des risques', () => {
    it('retourne les informations', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
        },
      });

      expect(referentiel.infosNiveauxGravite()).to.eql([
        { identifiant: 'niveauUn', position: 0 },
        { identifiant: 'niveauDeux', position: 1 },
      ]);
    });

    it("sait retourner les informations dans l'ordre inverse", () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
        },
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

      const positions = referentiel
        .infosNiveauxGraviteConcernes(true)
        .map((info) => info.position);

      expect(positions).to.eql([2, 1]);
    });

    it('inclut les identifiants dans les informations', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
          niveauTrois: { position: 2 },
        },
      });

      const identifiants = referentiel
        .infosNiveauxGraviteConcernes()
        .map((info) => info.identifiant);
      expect(identifiants).to.eql(['niveauUn', 'niveauDeux', 'niveauTrois']);
    });
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

  it('sait si un code de département est dans la liste des codes des départements', () => {
    const referentiel = Referentiel.creeReferentiel({
      departements: [{ nom: 'Ain', code: '01' }],
    });

    expect(referentiel.estCodeDepartement('01')).to.eql(true);
    expect(referentiel.estCodeDepartement('02')).to.eql(false);
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

  it('connaît la première étape du parcours Homologation', () => {
    const premiereEtape = { id: 'premiere', numero: 1 };
    const referentiel = Referentiel.creeReferentiel({
      etapesParcoursHomologation: [premiereEtape],
    });

    expect(referentiel.premiereEtapeParcours()).to.equal(premiereEtape);
  });

  describe('sur demande de la derniére étape du parcours Homologation', () => {
    it('connaît la dernière étape du parcours Homologation', () => {
      const premiereEtape = { id: 'premiere', numero: 1 };
      const derniereEtape = { id: 'derniere', numero: 2 };
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [premiereEtape, derniereEtape],
      });

      expect(referentiel.derniereEtapeParcours()).to.equal(derniereEtape);
    });

    it("utilise uniquement les étapes autorisées pour l'utilisateur si il n'a pas le droit d'homologuer", () => {
      const premiereEtape = { id: 'premiere', numero: 1 };
      const derniereEtape = {
        id: 'derniere',
        numero: 2,
        reserveePeutHomologuer: true,
      };
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [premiereEtape, derniereEtape],
      });

      expect(referentiel.derniereEtapeParcours(false)).to.equal(premiereEtape);
    });
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
        etapesParcoursHomologation: [
          { id: 'premiere', numero: 1 },
          { id: 'deuxieme', numero: 2 },
        ],
      });

      expect(referentiel.idEtapeSuivante('premiere')).to.equal('deuxieme');
    });
  });

  it('sait si une étape est suffisante pour obtenir le dossier de décision', () => {
    const referentiel = Referentiel.creeReferentiel({
      etapesParcoursHomologation: [
        { id: 'premiere', numero: 1 },
        { id: 'deuxieme', numero: 2 },
        { id: 'troisieme', numero: 3 },
      ],
      etapeNecessairePourDossierDecision: 'deuxieme',
    });

    expect(referentiel.etapeSuffisantePourDossierDecision('premiere')).to.be(
      false
    );
    expect(referentiel.etapeSuffisantePourDossierDecision('deuxieme')).to.be(
      true
    );
    expect(referentiel.etapeSuffisantePourDossierDecision('troisieme')).to.be(
      true
    );
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
      const referentiel = Referentiel.creeReferentiel({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(1)).to.eql(tranche);
      expect(referentiel.trancheIndiceCyber(0)).to.eql(tranche);

      expect(referentiel.trancheIndiceCyber(2)).to.not.eql(tranche);
    });

    it("récupère la tranche dans laquelle l'indice est égale à la borne supérieure quand elle est inclue", () => {
      const tranche = {
        borneInferieure: 0,
        borneSuperieure: 2,
        borneSuperieureIncluse: true,
      };
      const referentiel = Referentiel.creeReferentiel({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(2)).to.eql(tranche);
    });

    it("reste robuste quand il n'y a pas d'indice", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = Referentiel.creeReferentiel({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber()).to.eql({});
    });

    it("reste robuste quand l'indice n'est pas dans une tranche", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = Referentiel.creeReferentiel({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(6)).to.eql({});
    });
  });

  describe("sur une demande des descriptions des tranches de l'indice cyber", () => {
    let referentiel;

    beforeEach(() => {
      const tranche1 = {
        borneInferieure: 0,
        borneSuperieure: 1,
        description: 'Indice cyber 0-1',
      };
      const tranche2 = {
        borneInferieure: 1,
        borneSuperieure: 2,
        description: 'Indice cyber 1-2',
      };
      referentiel = Referentiel.creeReferentiel({
        tranchesIndicesCybers: [tranche2, tranche1],
      });
    });

    it("renvoie les descriptions dans l'ordre croissant", () => {
      const resultat = referentiel.descriptionsTranchesIndiceCyber(1);
      expect(resultat[0].description).to.eql('Indice cyber 0-1');
      expect(resultat[1].description).to.eql('Indice cyber 1-2');
    });

    it("indique dans quel tranche se situe l'indice cyber passé en paramètre", () => {
      const resultat = referentiel.descriptionsTranchesIndiceCyber(0.5);
      expect(resultat[0]).to.eql({
        description: 'Indice cyber 0-1',
        trancheCourante: true,
      });
      expect(resultat[1]).to.eql({
        description: 'Indice cyber 1-2',
        trancheCourante: false,
      });
    });
  });

  describe("sur demande des etapes du parcours d'homologation", () => {
    it("inclut toutes les étapes s'il n'y a pas de paramètres", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [{ numero: 1 }, { numero: 2 }],
      });

      const etapes = referentiel.etapesParcoursHomologation();
      expect(etapes.length).to.equal(2);
    });

    it('inclut toutes les étapes si `peutHomologuer` est vrai', () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [{ numero: 1 }, { numero: 2 }],
      });
      const peutHomologuer = true;

      const etapes = referentiel.etapesParcoursHomologation(peutHomologuer);
      expect(etapes.length).to.equal(2);
    });

    it("n'inclut pas les étapes réservée à l'homologation si `peutHomologuer` est faux", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [
          { numero: 1 },
          { numero: 2, reserveePeutHomologuer: true },
        ],
      });
      const nePeutPasHomologuer = false;

      const etapes =
        referentiel.etapesParcoursHomologation(nePeutPasHomologuer);
      expect(etapes.length).to.equal(1);
    });
  });

  describe("sur demande de l'étape autorisée du dossier", () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        etapesParcoursHomologation: [
          { numero: 1, id: 'id-autorisee-pour-tous' },
          {
            numero: 2,
            id: 'id-autorisee-seulement-homologation',
            reserveePeutHomologuer: true,
          },
        ],
      });
    });

    it("renvoie l'id de la même étape s'il s'agit d'un homologateur car il peut voir toutes les étapes", () => {
      expect(
        referentiel.etapeDossierAutorisee(
          'id-autorisee-seulement-homologation',
          true
        )
      ).to.be('id-autorisee-seulement-homologation');
    });

    it("renvoie l'id de l'étape maximale autorisée s'il s'agit d'un non-homologateur car il n'a pas le droit d'accès aux étapes d'homologation", () => {
      expect(
        referentiel.etapeDossierAutorisee(
          'id-autorisee-seulement-homologation',
          false
        )
      ).to.be('id-autorisee-pour-tous');
    });

    it("renvoie l'id de la même étape si l'étape demandée n'est pas reservée aux homologateurs", () => {
      expect(
        referentiel.etapeDossierAutorisee('id-autorisee-pour-tous', false)
      ).to.be('id-autorisee-pour-tous');
    });
  });

  describe("sur demande de formattage d'une liste de référentiels", () => {
    it('utilise les articles définis devant les référentiels', () => {
      const referentiel = Referentiel.creeReferentiel({
        articlesDefinisReferentielsMesure: {
          ANSSI: "l'",
          CNIL: 'la ',
        },
      });

      expect(
        referentiel.formatteListeDeReferentiels(['ANSSI', 'CNIL'])
      ).to.equal("l'ANSSI et la CNIL");
    });

    it('supprime les doublons', () => {
      const referentiel = Referentiel.creeReferentiel({
        articlesDefinisReferentielsMesure: {
          ANSSI: "l'",
        },
      });

      expect(
        referentiel.formatteListeDeReferentiels(['ANSSI', 'ANSSI'])
      ).to.equal("l'ANSSI");
    });

    it("reste robuste si le référentiel n'existe pas", () => {
      const referentiel = Referentiel.creeReferentiel({
        articlesDefinisReferentielsMesure: {},
      });

      expect(referentiel.formatteListeDeReferentiels(['ANSSI'])).to.equal(
        'ANSSI'
      );
    });
  });

  describe('sur demande de tous les retours utilisateur sur une mesure', () => {
    it('retourne toutes les valeurs possibles', () => {
      const referentiel = Referentiel.creeReferentiel({
        retoursUtilisateurMesure: {
          unAvis: { description: 'un avis' },
          unAutreAvis: { description: 'un autre avis' },
        },
      });

      expect(referentiel.retoursUtilisateurMesure()).to.eql({
        unAvis: { description: 'un avis' },
        unAutreAvis: { description: 'un autre avis' },
      });
    });

    it('reste robuste si aucune valeurs', () => {
      const referentiel = Referentiel.creeReferentiel({
        retoursUtilisateurMesure: undefined,
      });

      expect(referentiel.retoursUtilisateurMesure()).to.eql({});
    });
  });

  describe("sur demande d'un retour utilisateur sur une mesure par id", () => {
    it('retourne la valeur', () => {
      const referentiel = Referentiel.creeReferentiel({
        retoursUtilisateurMesure: { unAvis: { description: 'un avis' } },
      });

      expect(referentiel.retourUtilisateurMesureAvecId('unAvis')).to.eql({
        description: 'un avis',
      });
    });

    it("retourne `null` si l'id est introuvable", () => {
      const referentiel = Referentiel.creeReferentiel({
        retoursUtilisateurMesure: {},
      });

      expect(referentiel.retourUtilisateurMesureAvecId('unAvis')).to.equal(
        null
      );
    });
  });

  describe("sur demande de l'étape suivante de la visite guidée", () => {
    it("retourne l'ID de l'étape suivante", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: {
          DECRIRE: { idEtapeSuivante: 'SECURISER' },
        },
      });

      expect(referentiel.etapeSuivanteVisiteGuidee('DECRIRE')).to.be(
        'SECURISER'
      );
    });

    it("retourne `null` si l'ID est introuvable", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: {},
      });

      expect(referentiel.etapeSuivanteVisiteGuidee('ID_INTROUVABLE')).to.be(
        null
      );
    });

    it("retourne `null` si l'étape n'a pas d'étape suivante", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: { DECRIRE: {} },
      });

      expect(referentiel.etapeSuivanteVisiteGuidee('DECRIRE')).to.be(null);
    });
  });

  describe("sur demande de l'étape précédente de la visite guidée", () => {
    it("retourne l'ID de l'étape précédente", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: {
          SECURISER: { idEtapePrecedente: 'DECRIRE' },
        },
      });

      expect(referentiel.etapePrecedenteVisiteGuidee('SECURISER')).to.be(
        'DECRIRE'
      );
    });

    it("retourne `null` si l'ID est introuvable", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: {},
      });

      expect(referentiel.etapePrecedenteVisiteGuidee('ID_INTROUVABLE')).to.be(
        null
      );
    });

    it("retourne `null` si l'étape n'a pas d'étape précédente", () => {
      const referentiel = Referentiel.creeReferentiel({
        etapesVisiteGuidee: { DECRIRE: {} },
      });

      expect(referentiel.etapePrecedenteVisiteGuidee('DECRIRE')).to.be(null);
    });
  });

  it("sait renvoyer le contenu d'un étape de visite guidée", () => {
    const referentiel = Referentiel.creeReferentiel({
      etapesVisiteGuidee: { DECRIRE: { urlEtape: '/visiteGuidee/decrire' } },
    });

    expect(referentiel.etapeVisiteGuidee('DECRIRE')).to.eql({
      urlEtape: '/visiteGuidee/decrire',
    });
  });

  it('sait dire si une étape de visite guidée existe', () => {
    const referentiel = Referentiel.creeReferentiel({
      etapesVisiteGuidee: { DECRIRE: {} },
    });

    expect(referentiel.etapeVisiteGuideeExiste('DECRIRE')).to.be(true);
    expect(referentiel.etapeVisiteGuideeExiste('MAUVAIS_ID')).to.be(false);
  });

  it("lève une exception lorsqu'on lui demande une nature de suggestion d'action inconnue", () => {
    const sansNature = Referentiel.creeReferentielVide();

    expect(() =>
      sansNature.natureSuggestionAction('INCONNUE')
    ).to.throwException((e) => {
      expect(e).to.be.an(ErreurDonneesReferentielIncorrectes);
      expect(e.message).to.equal(
        "La nature INCONNUE n'est pas une nature de suggestion d'action connue."
      );
    });
  });

  describe('sur demande de la matrice des niveaux de risques', () => {
    it("peut construire une matrice d'une case", () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([['vert']]);
    });

    it('peut construire une matrice 1x2', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
          orange: { correspondances: [{ gravite: 0, vraisemblance: 1 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([['vert'], ['orange']]);
    });

    it('peut construire une matrice 2x1', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
          orange: { correspondances: [{ gravite: 1, vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([['vert', 'orange']]);
    });

    it('peut construire une matrice 1x2 dans le désordre', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: 0, vraisemblance: 1 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([[], ['orange']]);
    });

    it('peut construire une matrice avec des spécifications de vraisemblance multiples', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: 0, vraisemblance: [0, 1] }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([['orange'], ['orange']]);
    });

    it('peut construire une matrice avec des spécifications de gravite multiples', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: [0, 1], vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([['orange', 'orange']]);
    });

    it('peut construire une matrice avec des spécifications de gravite et vraisemblance multiples', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxRisques: {
          orange: {
            correspondances: [{ gravite: [0, 1], vraisemblance: [0, 1] }],
          },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).to.eql([
        ['orange', 'orange'],
        ['orange', 'orange'],
      ]);
    });
  });

  describe('sur demande du niveau de risque', () => {
    it('peut retourner le niveau de la matrice', () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          grave: { description: 'Une description', position: 1 },
        },
        vraisemblancesRisques: {
          probable: { description: 'Une description', position: 1 },
        },
        niveauxRisques: {
          orange: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
          rouge: { correspondances: [{ gravite: 1, vraisemblance: 1 }] },
        },
      });

      const niveau = referentiel.niveauRisque('probable', 'grave');

      expect(niveau).to.be('rouge');
    });

    it("retourne `indeterminable` lorsque le niveau n'est pas trouvé", () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          grave: { description: 'Une description', position: 1 },
        },
        vraisemblancesRisques: {
          probable: { description: 'Une description', position: 1 },
        },
        niveauxRisques: {},
      });

      const niveau = referentiel.niveauRisque('probable', 'grave');

      expect(niveau).to.be(Risque.NIVEAU_RISQUE_INDETERMINABLE);
    });

    it("retourne `indeterminable` lorsque la vraisemblance n'est pas trouvée", () => {
      const referentiel = Referentiel.creeReferentiel({
        niveauxGravite: {
          grave: { description: 'Une description', position: 1 },
        },
        vraisemblancesRisques: {},
        niveauxRisques: {},
      });

      const niveau = referentiel.niveauRisque('probable', 'grave');

      expect(niveau).to.be(Risque.NIVEAU_RISQUE_INDETERMINABLE);
    });
  });

  describe("sur demande des niveaux de sécurité d'un service", () => {
    const referentielProd = Referentiel.creeReferentiel(donneesDeProd);

    ['niveau1', 'niveau2', 'niveau3'].forEach((cle) => {
      it(`valide le niveau de sécurité ${cle}`, () => {
        const estValide = referentielProd.estNiveauDeSecuriteValide(cle);

        expect(estValide).to.be(true);
      });
    });

    it('ne valide pas un niveau de sécurité inexistant', () => {
      const valide = referentielProd.estNiveauDeSecuriteValide('inexistant');

      expect(valide).to.be(false);
    });

    it('sait comparer deux niveaux entre eux', () => {
      const niveauRecommande = 'niveau1';
      const niveauReel = 'niveau2';

      const estSuperieur =
        referentielProd.niveauDeSecuriteDepasseRecommandation(
          niveauReel,
          niveauRecommande
        );

      expect(estSuperieur).to.be(true);
    });
  });
});
