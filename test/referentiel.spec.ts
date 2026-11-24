import { ErreurDonneesReferentielIncorrectes } from '../src/erreurs.ts';
import { creeReferentiel, creeReferentielVide } from '../src/referentiel.ts';
import { Referentiel } from '../src/referentiel.interface.ts';
import { DonneesReferentiel } from '../src/referentiel.types.ts';
import donneesDeProd from '../donneesReferentiel.ts';
import Risque from '../src/modeles/risque.ts';

// Les méthodes du `Referentiel` n'acceptent que les identifiants des données de prod.
// Cette spec teste la mécanique sur des données fictives (`uneClef`, `premiere`…) :
// on garde les types de retour mais on accepte n'importe quels arguments.
type ReferentielDeTest = {
  [Methode in keyof Referentiel]: Referentiel[Methode] extends (
    ...args: never[]
  ) => infer Retour
    ? (...args: unknown[]) => Retour
    : Referentiel[Methode];
};

const unReferentielAvec = (donnees: object) =>
  creeReferentiel(
    donnees as DonneesReferentiel
  ) as unknown as ReferentielDeTest;

const unReferentielVide = () =>
  creeReferentielVide() as unknown as ReferentielDeTest;

describe('Le référentiel', () => {
  describe('à sa création', () => {
    it("valide que la somme des coefficients pour le calcul de l'incide cyber vaut 1", () => {
      expect(() =>
        unReferentielAvec({
          indiceCyber: {
            coefficientIndispensables: 1.2,
            coefficientRecommandees: 0.8,
          },
        })
      ).toThrow(
        new ErreurDonneesReferentielIncorrectes(
          "La somme des coefficients pour le calcul de l'indice cyber vaut 2, alors qu'elle aurait dû valoir 1."
        )
      );
    });

    it('valide les valeurs par défaut des coefficients', () => {
      expect(() => unReferentielVide()).not.toThrow();
    });

    it('valide les valeurs des coefficients après la recharge', () => {
      const referentiel = unReferentielVide();
      expect(() =>
        referentiel.recharge({
          indiceCyber: {
            coefficientIndispensables: 1.2,
            coefficientRecommandees: 0.8,
          },
        })
      ).toThrow();
    });
  });

  it("sait décrire le type de service à partir d'identifiants", () => {
    const referentiel = unReferentielAvec({
      typesService: { siteInternet: { description: 'Site internet' } },
    });
    expect(referentiel.typeService(['siteInternet'])).toEqual('Site internet');
  });

  it('sait décrire le type de service à partir de plusieurs identifiants', () => {
    const referentiel = unReferentielAvec({
      typesService: {
        siteInternet: { description: 'Site internet' },
        api: { description: "API mise à disposition par l'organisation" },
      },
    });
    expect(referentiel.typeService(['siteInternet', 'api'])).toEqual(
      "Site internet, API mise à disposition par l'organisation"
    );
  });

  it('donne une description par défaut si aucun identifiant de type de service', () => {
    const referentiel = unReferentielVide();
    expect(referentiel.typeService([])).toEqual(
      'Type de service non renseignée'
    );
  });

  it('sait décrire la localisation des données', () => {
    const referentiel = unReferentielAvec({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });

    expect(referentiel.localisationDonnees('france')).toEqual(
      'Quelque part en France'
    );
  });

  it('donne une description par défaut si pas de localisation des données', () => {
    const referentiel = unReferentielVide();
    expect(referentiel.localisationDonnees()).toEqual(
      'Localisation des données non renseignée'
    );
  });

  it('connaît la liste des différents types de service possibles', () => {
    const referentiel = unReferentielAvec({
      typesService: { uneClef: 'une valeur' },
    });
    expect(referentiel.typesService()).toEqual({ uneClef: 'une valeur' });
  });

  it('connaît la liste des différentes provenances de service possibles', () => {
    const referentiel = unReferentielAvec({
      provenancesService: { uneClef: 'une valeur' },
    });

    expect(referentiel.provenancesService()).toEqual({ uneClef: 'une valeur' });
  });

  it('connaît la liste des statuts de déploiement possibles', () => {
    const referentiel = unReferentielAvec({
      statutsDeploiement: { uneClef: 'une valeur' },
    });

    expect(referentiel.statutsDeploiement()).toEqual({ uneClef: 'une valeur' });
  });

  it('sait décrire un statut de déploiement', () => {
    const referentiel = unReferentielAvec({
      statutsDeploiement: {
        uneClef: { description: 'Une description' },
      },
    });

    expect(referentiel.descriptionStatutDeploiement('uneClef')).toEqual(
      'Une description'
    );
  });

  it('connaît la liste des fonctionnalités possibles', () => {
    const referentiel = unReferentielAvec({
      fonctionnalites: { uneClef: 'une valeur' },
    });

    expect(referentiel.fonctionnalites()).toEqual({ uneClef: 'une valeur' });
  });

  it('sait décrire une fonctionnalité', () => {
    const referentiel = unReferentielAvec({
      fonctionnalites: { uneClef: { description: 'Une description' } },
    });

    expect(referentiel.descriptionFonctionnalite('uneClef')).toEqual(
      'Une description'
    );
  });

  it('sait décrire des fonctionnalités', () => {
    const referentiel = unReferentielAvec({
      fonctionnalites: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(referentiel.descriptionsFonctionnalites(['clef1', 'clef2'])).toEqual(
      ['Description 1', 'Description 2']
    );
  });

  it("sait décrire des fonctionnalités en restant robuste quand une fonctionnalité n'est pas dans le référentiel", () => {
    const referentiel = unReferentielVide();

    expect(referentiel.descriptionsFonctionnalites(['clef'])).toEqual([]);
  });

  it('connaît la liste des données à caractère personnel', () => {
    const referentiel = unReferentielAvec({
      donneesCaracterePersonnel: { uneClef: 'une valeur' },
    });

    expect(referentiel.donneesCaracterePersonnel()).toEqual({
      uneClef: 'une valeur',
    });
  });

  it('sait décrire un type de données à caractère personnel', () => {
    const referentiel = unReferentielAvec({
      donneesCaracterePersonnel: {
        uneClef: { description: 'Une description' },
      },
    });

    expect(referentiel.descriptionDonneesCaracterePersonnel('uneClef')).toEqual(
      'Une description'
    );
  });

  it('sait décrire des types de données à caractère personnel', () => {
    const referentiel = unReferentielAvec({
      donneesCaracterePersonnel: {
        clef1: { description: 'Description 1' },
        clef2: { description: 'Description 2' },
      },
    });

    expect(
      referentiel.descriptionsDonneesCaracterePersonnel(['clef1', 'clef2'])
    ).toEqual(['Description 1', 'Description 2']);
  });

  it("sait décrire des types de données à caractère personnel en restant robuste quand un type n'est pas dans le référentiel", () => {
    const referentiel = unReferentielVide();

    expect(referentiel.descriptionsDonneesCaracterePersonnel(['clef'])).toEqual(
      []
    );
  });

  it('connaît la liste des délais avant impact critique', () => {
    const referentiel = unReferentielAvec({
      delaisAvantImpactCritique: { uneClef: 'une valeur' },
    });

    expect(referentiel.delaisAvantImpactCritique()).toEqual({
      uneClef: 'une valeur',
    });
  });

  it('sait décrire un délai avant impact critique', () => {
    const referentiel = unReferentielAvec({
      delaisAvantImpactCritique: { uneClef: { description: 'une valeur' } },
    });

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).toEqual(
      'une valeur'
    );
  });

  it("reste robuste quand le délai avant impact critique n'est pas dans le référentiel", () => {
    const referentiel = unReferentielVide();

    expect(referentiel.descriptionDelaiAvantImpactCritique('uneClef')).toEqual(
      undefined
    );
  });

  describe('sur demande de la liste des mesures', () => {
    it('retourne la liste', () => {
      const referentiel = unReferentielAvec({
        mesures: { uneClef: 'une valeur' },
      });

      expect(referentiel.mesures()).toEqual({ uneClef: 'une valeur' });
    });

    it('retourne toujours la même liste', () => {
      const referentiel = unReferentielAvec({
        mesures: {
          idMesure: { attributModifiable: 'Une valeur de référence' },
        },
      });

      const mesure = referentiel.mesure('idMesure') as unknown as {
        attributModifiable: string;
      };
      mesure.attributModifiable = 'Une valeur modifiée';

      expect(referentiel.mesures()).toEqual({
        idMesure: { attributModifiable: 'Une valeur de référence' },
      });
    });

    it('ne retourne rien pour une mesure inconnue', () => {
      const referentiel = unReferentielAvec({ mesures: {} });

      expect(referentiel.mesure('idInconnu')).toBe(undefined);
    });
  });

  it('sait si une mesure est indispensable', () => {
    const referentiel = unReferentielAvec({
      mesures: {
        mesureIndispensable: { indispensable: true },
        mesureRecommandee: {},
      },
    });

    expect(referentiel.mesureIndispensable('mesureIndispensable')).toBe(true);
    expect(referentiel.mesureIndispensable('mesureRecommandee')).toBe(false);
  });

  it('connaît la liste des catégories de mesures', () => {
    const referentiel = unReferentielAvec({
      categoriesMesures: { uneClef: 'une valeur' },
    });

    expect(referentiel.categoriesMesures()).toEqual({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants de catégories', () => {
    const referentiel = unReferentielAvec({
      categoriesMesures: { uneClef: 'une valeur' },
    });

    expect(referentiel.identifiantsCategoriesMesures()).toEqual(['uneClef']);
  });

  it('sait décrire une catégorie', () => {
    const referentiel = unReferentielAvec({
      categoriesMesures: { uneCategorie: 'une description' },
    });

    expect(referentiel.descriptionCategorie('uneCategorie')).toEqual(
      'une description'
    );
  });

  it('associe à l’indice cyber de chaque catégorie son libellé, dans l’ordre du référentiel', () => {
    const referentiel = unReferentielAvec({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
    });

    const indiceCyber = { total: 2.5, protection: 1.8, gouvernance: 3.2 };

    expect(referentiel.indiceCyberAvecLibellesCategories(indiceCyber)).toEqual([
      { libelle: 'Gouvernance', note: 3.2 },
      { libelle: 'Protection', note: 1.8 },
    ]);
  });

  it('sait décrire les statuts des mesures', () => {
    const referentiel = unReferentielAvec({
      statutsMesures: { unStatut: 'Un statut' },
    });

    expect(referentiel.descriptionStatutMesure('unStatut')).toEqual(
      'Un statut'
    );
  });

  it('connaît la liste des risques', () => {
    const referentiel = unReferentielAvec({
      risques: { uneClef: 'une valeur' },
    });
    expect(referentiel.risques()).toEqual({ uneClef: 'une valeur' });
  });

  it('connaît la liste des identifiants des risques répertoriés', () => {
    const referentiel = unReferentielAvec({
      risques: { unRisque: {}, unAutreRisque: {} },
    });

    expect(referentiel.identifiantsRisques()).toEqual([
      'unRisque',
      'unAutreRisque',
    ]);
  });

  it("sait retrouver la définition d'un risque répertorié", () => {
    const referentiel = unReferentielAvec({
      risques: { unRisque: { definition: 'Une définition' } },
    });

    expect(referentiel.definitionRisque('unRisque')).toEqual('Une définition');
  });

  it('sait dire si un identifiant de mesure fait partie du référentiel', () => {
    const referentiel = unReferentielAvec({
      mesures: { uneMesure: {} },
    });

    expect(referentiel.estIdentifiantMesureConnu('xyzMesure')).toBe(false);
    expect(referentiel.estIdentifiantMesureConnu('uneMesure')).toBe(true);
  });

  it('connaît la liste des localisations de données', () => {
    const referentiel = unReferentielAvec({
      localisationsDonnees: { uneClef: 'une valeur' },
    });

    expect(referentiel.localisationsDonnees()).toEqual({
      uneClef: 'une valeur',
    });
  });

  it('connaît la liste des identifiants des localisations de données', () => {
    const referentiel = unReferentielAvec({
      localisationsDonnees: { uneLocalisation: {}, uneAutreLocalisation: {} },
    });

    expect(referentiel.identifiantsLocalisationsDonnees()).toEqual([
      'uneLocalisation',
      'uneAutreLocalisation',
    ]);
  });

  it("connaît les statuts des avis de dossier d'homologation", () => {
    const referentiel = unReferentielAvec({
      statutsAvisDossierHomologation: {
        favorable: { description: 'Favorable' },
        defavorable: { description: 'Défavorable' },
      },
    });

    expect(referentiel.statutsAvisDossierHomologation()).toEqual({
      favorable: { description: 'Favorable' },
      defavorable: { description: 'Défavorable' },
    });
  });

  it("connaît le statut d'homologation", () => {
    const referentiel = unReferentielAvec({
      statutsHomologation: {
        expiree: { libelle: 'Expirée' },
      },
    });

    expect(referentiel.statutHomologation('expiree')).toEqual({
      libelle: 'Expirée',
    });
  });

  it("sait si un identifiant fait partie de la liste des statuts d'avis de dossier d'homologation", () => {
    const referentiel = unReferentielAvec({
      statutsAvisDossierHomologation: { favorable: {} },
    });

    expect(
      referentiel.estIdentifiantStatutAvisDossierHomologationConnu('favorable')
    ).toBe(true);
    expect(
      referentiel.estIdentifiantStatutAvisDossierHomologationConnu(
        'unStatutInconnu'
      )
    ).toBe(false);
  });

  it('connaît la liste des échéances de renouvellement', () => {
    const referentiel = unReferentielAvec({
      echeancesRenouvellement: { uneClef: 'une valeur' },
    });

    expect(referentiel.echeancesRenouvellement()).toEqual({
      uneClef: 'une valeur',
    });
  });

  it('connaît la liste des identifiants de chaque échéance de renouvellement', () => {
    const referentiel = unReferentielAvec({
      echeancesRenouvellement: { uneEch: {}, uneAutreEch: {} },
    });

    expect(referentiel.identifiantsEcheancesRenouvellement()).toEqual([
      'uneEch',
      'uneAutreEch',
    ]);
  });

  it('sait si un identifiant fait partie de la liste des échéances de renouvellement', () => {
    const referentiel = unReferentielAvec({
      echeancesRenouvellement: { uneEch: {} },
    });

    expect(
      referentiel.estIdentifiantEcheanceRenouvellementConnu('uneEch')
    ).toBe(true);
    expect(
      referentiel.estIdentifiantEcheanceRenouvellementConnu('uneInconnue')
    ).toBe(false);
  });

  it('connait les niveaux de gravité des risques', () => {
    const referentiel = unReferentielAvec({
      niveauxGravite: {
        unNiveau: { position: 0, description: 'Une description' },
      },
    });

    expect(referentiel.niveauxGravite()).toEqual({
      unNiveau: { position: 0, description: 'Une description' },
    });
  });

  it('connaît la liste des identifiants des niveaux de gravité des risques', () => {
    const referentiel = unReferentielAvec({
      niveauxGravite: { unNiveau: {}, unAutreNiveau: {} },
    });

    expect(referentiel.identifiantsNiveauxGravite()).toEqual([
      'unNiveau',
      'unAutreNiveau',
    ]);
  });

  describe('sur demande des infos sur les niveaux de gravité des risques', () => {
    it('retourne les informations', () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
        },
      });

      expect(referentiel.infosNiveauxGravite()).toEqual([
        { identifiant: 'niveauUn', position: 0 },
        { identifiant: 'niveauDeux', position: 1 },
      ]);
    });

    it("sait retourner les informations dans l'ordre inverse", () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
        },
      });

      expect(referentiel.infosNiveauxGravite(true)).toEqual([
        { identifiant: 'niveauDeux', position: 1 },
        { identifiant: 'niveauUn', position: 0 },
      ]);
    });
  });

  describe('sur demande des infos sur les niveaux de gravité concernés des risques', () => {
    it('sait retourner les infos en ordre inverse', () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          niveauUn: { position: 0, nonConcerne: true },
          niveauDeux: { position: 1 },
          niveauTrois: { position: 2 },
        },
      });

      const positions = referentiel
        .infosNiveauxGraviteConcernes(true)
        .map((info) => info.position);

      expect(positions).toEqual([2, 1]);
    });

    it('inclut les identifiants dans les informations', () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          niveauUn: { position: 0 },
          niveauDeux: { position: 1 },
          niveauTrois: { position: 2 },
        },
      });

      const identifiants = referentiel
        .infosNiveauxGraviteConcernes()
        .map((info) => info.identifiant);
      expect(identifiants).toEqual(['niveauUn', 'niveauDeux', 'niveauTrois']);
    });
  });

  it('connaît la liste des départements', () => {
    const referentiel = unReferentielAvec({
      departements: [
        { nom: 'Ain', code: '01' },
        { nom: 'Aisne', code: '02' },
      ],
    });

    expect(referentiel.departements()).toHaveLength(2);
    expect(referentiel.departements()).toEqual([
      { nom: 'Ain', code: '01' },
      { nom: 'Aisne', code: '02' },
    ]);
  });

  it('connaît la liste des codes des départements', () => {
    const referentiel = unReferentielAvec({
      departements: [
        { nom: 'Ain', code: '01' },
        { nom: 'Aisne', code: '02' },
      ],
    });

    expect(referentiel.codeDepartements()).toEqual(['01', '02']);
  });

  it('sait si un code de département est dans la liste des codes des départements', () => {
    const referentiel = unReferentielAvec({
      departements: [{ nom: 'Ain', code: '01' }],
    });

    expect(referentiel.estCodeDepartement('01')).toEqual(true);
    expect(referentiel.estCodeDepartement('02')).toEqual(false);
  });

  it("trouve le nom d'un département grace à son code", () => {
    const referentiel = unReferentielAvec({
      departements: [{ nom: 'Ain', code: '01' }],
    });

    expect(referentiel.departement('01')).toEqual('Ain');
  });

  it('reste robuste quand la liste des départements est absente', () => {
    const referentiel = unReferentielAvec({});

    expect(referentiel.departements()).toEqual([]);
    expect(referentiel.departement('01')).toEqual(undefined);
    expect(referentiel.codeDepartements()).toEqual(undefined);
  });

  it('connaît la première étape du parcours Homologation', () => {
    const premiereEtape = { id: 'premiere', numero: 1 };
    const referentiel = unReferentielAvec({
      etapesParcoursHomologation: [premiereEtape],
    });

    expect(referentiel.premiereEtapeParcours()).toEqual(premiereEtape);
  });

  describe('sur demande de la derniére étape du parcours Homologation', () => {
    it('connaît la dernière étape du parcours Homologation', () => {
      const premiereEtape = { id: 'premiere', numero: 1 };
      const derniereEtape = { id: 'derniere', numero: 2 };
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [premiereEtape, derniereEtape],
      });

      expect(referentiel.derniereEtapeParcours()).toEqual(derniereEtape);
    });

    it("utilise uniquement les étapes autorisées pour l'utilisateur si il n'a pas le droit d'homologuer", () => {
      const premiereEtape = { id: 'premiere', numero: 1 };
      const derniereEtape = {
        id: 'derniere',
        numero: 2,
        reserveePeutHomologuer: true,
      };
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [premiereEtape, derniereEtape],
      });

      expect(referentiel.derniereEtapeParcours(false)).toEqual(premiereEtape);
    });
  });

  describe("sur demande du numéro d'une étape du parcours Homologation", () => {
    it("sait retrouver le numéro d'une étape à partir de son ID", () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [{ id: 'premiere', numero: 1 }],
      });

      expect(referentiel.numeroEtape('premiere')).toBe(1);
    });

    it("reste robuste lorsque l'ID de l'étape n'existe pas", () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [{ id: 'premiere', numero: 1 }],
      });

      expect(referentiel.numeroEtape('inconnue')).toBe(undefined);
    });
  });

  describe("sur demande de l'ID d'une « étape suivante » du parcours Homologation", () => {
    it("sait retrouver l'ID de l'étape suivant une étape donnée", () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [
          { id: 'premiere', numero: 1 },
          { id: 'deuxieme', numero: 2 },
        ],
      });

      expect(referentiel.idEtapeSuivante('premiere')).toEqual('deuxieme');
    });
  });

  it('sait si une étape est suffisante pour obtenir le dossier de décision', () => {
    const referentiel = unReferentielAvec({
      etapesParcoursHomologation: [
        { id: 'premiere', numero: 1 },
        { id: 'deuxieme', numero: 2 },
        { id: 'troisieme', numero: 3 },
      ],
      etapeNecessairePourDossierDecision: 'deuxieme',
    });

    expect(referentiel.etapeSuffisantePourDossierDecision('premiere')).toBe(
      false
    );
    expect(referentiel.etapeSuffisantePourDossierDecision('deuxieme')).toBe(
      true
    );
    expect(referentiel.etapeSuffisantePourDossierDecision('troisieme')).toBe(
      true
    );
  });

  it('peut être construit sans donnée', () => {
    const referentiel = unReferentielVide();
    expect(referentiel.typesService()).toEqual({});
  });

  it("peut être rechargé avec d'autres données", () => {
    const referentiel = unReferentielVide();
    referentiel.recharge({ typesService: { uneClef: 'une valeur' } });
    expect(referentiel.typesService()).toEqual({ uneClef: 'une valeur' });
  });

  describe("sur une demande de tranche de l'indice cyber", () => {
    it("récupère la tranche dans laquelle l'indice est compris", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = unReferentielAvec({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(1)).toEqual(tranche);
      expect(referentiel.trancheIndiceCyber(0)).toEqual(tranche);

      expect(referentiel.trancheIndiceCyber(2)).not.toEqual(tranche);
    });

    it("récupère la tranche dans laquelle l'indice est égale à la borne supérieure quand elle est inclue", () => {
      const tranche = {
        borneInferieure: 0,
        borneSuperieure: 2,
        borneSuperieureIncluse: true,
      };
      const referentiel = unReferentielAvec({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(2)).toEqual(tranche);
    });

    it("reste robuste quand il n'y a pas d'indice", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = unReferentielAvec({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber()).toEqual({});
    });

    it("reste robuste quand l'indice n'est pas dans une tranche", () => {
      const tranche = { borneInferieure: 0, borneSuperieure: 2 };
      const referentiel = unReferentielAvec({
        tranchesIndicesCybers: [tranche],
      });

      expect(referentiel.trancheIndiceCyber(6)).toEqual({});
    });
  });

  describe("sur une demande des descriptions des tranches de l'indice cyber", () => {
    let referentiel: ReferentielDeTest;

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
      referentiel = unReferentielAvec({
        tranchesIndicesCybers: [tranche2, tranche1],
      });
    });

    it("renvoie les descriptions dans l'ordre croissant", () => {
      const resultat = referentiel.descriptionsTranchesIndiceCyber(1);
      expect(resultat[0].description).toEqual('Indice cyber 0-1');
      expect(resultat[1].description).toEqual('Indice cyber 1-2');
    });

    it("indique dans quel tranche se situe l'indice cyber passé en paramètre", () => {
      const resultat = referentiel.descriptionsTranchesIndiceCyber(0.5);
      expect(resultat[0]).toEqual({
        description: 'Indice cyber 0-1',
        trancheCourante: true,
      });
      expect(resultat[1]).toEqual({
        description: 'Indice cyber 1-2',
        trancheCourante: false,
      });
    });
  });

  describe("sur demande des etapes du parcours d'homologation", () => {
    it("inclut toutes les étapes s'il n'y a pas de paramètres", () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [{ numero: 1 }, { numero: 2 }],
      });

      const etapes = referentiel.etapesParcoursHomologation();
      expect(etapes.length).toEqual(2);
    });

    it('inclut toutes les étapes si `peutHomologuer` est vrai', () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [{ numero: 1 }, { numero: 2 }],
      });
      const peutHomologuer = true;

      const etapes = referentiel.etapesParcoursHomologation(peutHomologuer);
      expect(etapes.length).toEqual(2);
    });

    it("n'inclut pas les étapes réservée à l'homologation si `peutHomologuer` est faux", () => {
      const referentiel = unReferentielAvec({
        etapesParcoursHomologation: [
          { numero: 1 },
          { numero: 2, reserveePeutHomologuer: true },
        ],
      });
      const nePeutPasHomologuer = false;

      const etapes =
        referentiel.etapesParcoursHomologation(nePeutPasHomologuer);
      expect(etapes.length).toEqual(1);
    });
  });

  describe("sur demande de l'étape autorisée du dossier", () => {
    let referentiel: ReferentielDeTest;
    beforeEach(() => {
      referentiel = unReferentielAvec({
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
      ).toBe('id-autorisee-seulement-homologation');
    });

    it("renvoie l'id de l'étape maximale autorisée s'il s'agit d'un non-homologateur car il n'a pas le droit d'accès aux étapes d'homologation", () => {
      expect(
        referentiel.etapeDossierAutorisee(
          'id-autorisee-seulement-homologation',
          false
        )
      ).toBe('id-autorisee-pour-tous');
    });

    it("renvoie l'id de la même étape si l'étape demandée n'est pas reservée aux homologateurs", () => {
      expect(
        referentiel.etapeDossierAutorisee('id-autorisee-pour-tous', false)
      ).toBe('id-autorisee-pour-tous');
    });
  });

  describe("sur demande de formattage d'une liste de référentiels", () => {
    it('utilise les articles définis devant les référentiels', () => {
      const referentiel = unReferentielAvec({
        articlesDefinisReferentielsMesure: {
          ANSSI: "l'",
          CNIL: 'la ',
        },
      });

      expect(
        referentiel.formatteListeDeReferentiels(['ANSSI', 'CNIL'])
      ).toEqual("l'ANSSI et la CNIL");
    });

    it('supprime les doublons', () => {
      const referentiel = unReferentielAvec({
        articlesDefinisReferentielsMesure: {
          ANSSI: "l'",
        },
      });

      expect(
        referentiel.formatteListeDeReferentiels(['ANSSI', 'ANSSI'])
      ).toEqual("l'ANSSI");
    });

    it("reste robuste si le référentiel n'existe pas", () => {
      const referentiel = unReferentielAvec({
        articlesDefinisReferentielsMesure: {},
      });

      expect(referentiel.formatteListeDeReferentiels(['ANSSI'])).toEqual(
        'ANSSI'
      );
    });
  });

  describe('sur demande de tous les retours utilisateur sur une mesure', () => {
    it('retourne toutes les valeurs possibles', () => {
      const referentiel = unReferentielAvec({
        retoursUtilisateurMesure: {
          unAvis: { description: 'un avis' },
          unAutreAvis: { description: 'un autre avis' },
        },
      });

      expect(referentiel.retoursUtilisateurMesure()).toEqual({
        unAvis: { description: 'un avis' },
        unAutreAvis: { description: 'un autre avis' },
      });
    });

    it('reste robuste si aucune valeurs', () => {
      const referentiel = unReferentielAvec({
        retoursUtilisateurMesure: undefined,
      });

      expect(referentiel.retoursUtilisateurMesure()).toEqual({});
    });
  });

  it("lève une exception lorsqu'on lui demande une nature de suggestion d'action inconnue", () => {
    const sansNature = unReferentielVide();

    expect(() => sansNature.natureSuggestionAction('INCONNUE')).toThrow(
      new ErreurDonneesReferentielIncorrectes(
        "La nature INCONNUE n'est pas une nature de suggestion d'action connue."
      )
    );
  });

  describe('sur demande de la matrice des niveaux de risques', () => {
    it("peut construire une matrice d'une case", () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([['vert']]);
    });

    it('peut construire une matrice 1x2', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
          orange: { correspondances: [{ gravite: 0, vraisemblance: 1 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([['vert'], ['orange']]);
    });

    it('peut construire une matrice 2x1', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          vert: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
          orange: { correspondances: [{ gravite: 1, vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([['vert', 'orange']]);
    });

    it('peut construire une matrice 1x2 dans le désordre', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: 0, vraisemblance: 1 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([[], ['orange']]);
    });

    it('peut construire une matrice avec des spécifications de vraisemblance multiples', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: 0, vraisemblance: [0, 1] }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([['orange'], ['orange']]);
    });

    it('peut construire une matrice avec des spécifications de gravite multiples', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          orange: { correspondances: [{ gravite: [0, 1], vraisemblance: 0 }] },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([['orange', 'orange']]);
    });

    it('peut construire une matrice avec des spécifications de gravite et vraisemblance multiples', () => {
      const referentiel = unReferentielAvec({
        niveauxRisques: {
          orange: {
            correspondances: [{ gravite: [0, 1], vraisemblance: [0, 1] }],
          },
        },
      });

      const matrice = referentiel.matriceNiveauxRisques();

      expect(matrice).toEqual([
        ['orange', 'orange'],
        ['orange', 'orange'],
      ]);
    });
  });

  describe('sur demande du niveau de risque', () => {
    it('peut retourner le niveau de la matrice', () => {
      const referentiel = unReferentielAvec({
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

      expect(niveau).toBe('rouge');
    });

    it("retourne `indeterminable` lorsque le niveau n'est pas trouvé", () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          grave: { description: 'Une description', position: 1 },
        },
        vraisemblancesRisques: {
          probable: { description: 'Une description', position: 1 },
        },
        niveauxRisques: {},
      });

      const niveau = referentiel.niveauRisque('probable', 'grave');

      expect(niveau).toBe(Risque.NIVEAU_RISQUE_INDETERMINABLE);
    });

    it("retourne `indeterminable` lorsque la vraisemblance n'est pas trouvée", () => {
      const referentiel = unReferentielAvec({
        niveauxGravite: {
          grave: { description: 'Une description', position: 1 },
        },
        vraisemblancesRisques: {},
        niveauxRisques: {},
      });

      const niveau = referentiel.niveauRisque('probable', 'grave');

      expect(niveau).toBe(Risque.NIVEAU_RISQUE_INDETERMINABLE);
    });
  });

  describe("sur demande des niveaux de sécurité d'un service", () => {
    const referentielProd = creeReferentiel(donneesDeProd);

    it('sait comparer deux niveaux entre eux', () => {
      const niveauRecommande = 'niveau1';
      const niveauReel = 'niveau2';

      const estSuperieur =
        referentielProd.niveauDeSecuriteDepasseRecommandation(
          niveauReel,
          niveauRecommande
        );

      expect(estSuperieur).toBe(true);
    });
  });
});
