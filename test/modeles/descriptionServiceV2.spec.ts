import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.ts';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.js';
import {
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurDonneesObligatoiresManquantes,
} from '../../src/erreurs.js';

describe('Une description service V2', () => {
  it('connaît ses données à persister', () => {
    const descriptionV2 = new DescriptionServiceV2({
      nomService: 'Mairie',
      organisationResponsable: {
        nom: 'Ville V',
        siret: '1111111111111',
        departement: '33',
      },
      typeService: ['api'],
      statutDeploiement: 'enCours',
      niveauDeSecurite: 'niveau1',
      volumetrieDonneesTraitees: 'faible',
      presentation: 'Le premier de …',
      pointsAcces: [{ description: 'https://url.com' }],
      audienceCible: 'large',
      typeHebergement: 'autre',
      ouvertureSysteme: 'accessibleSurInternet',
      specificitesProjet: ['accesPhysiqueAuxBureaux'],
      activitesExternalisees: ['developpementLogiciel'],
      dureeDysfonctionnementAcceptable: 'moinsDe24h',
      categoriesDonneesTraitees: ['documentsRHSensibles'],
      categoriesDonneesTraiteesSupplementaires: ['numéros de téléphones'],
      localisationsDonneesTraitees: ['horsUE'],
    });

    const aPersister = descriptionV2.donneesSerialisees();

    expect<DonneesDescriptionServiceV2>(aPersister).toEqual({
      nomService: 'Mairie',
      organisationResponsable: {
        departement: '33',
        nom: 'Ville V',
        siret: '1111111111111',
      },
      typeService: ['api'],
      statutDeploiement: 'enCours',
      niveauDeSecurite: 'niveau1',
      volumetrieDonneesTraitees: 'faible',
      presentation: 'Le premier de …',
      pointsAcces: [{ description: 'https://url.com' }],
      activitesExternalisees: ['developpementLogiciel'],
      audienceCible: 'large',
      typeHebergement: 'autre',
      ouvertureSysteme: 'accessibleSurInternet',
      specificitesProjet: ['accesPhysiqueAuxBureaux'],
      dureeDysfonctionnementAcceptable: 'moinsDe24h',
      categoriesDonneesTraitees: ['documentsRHSensibles'],
      categoriesDonneesTraiteesSupplementaires: ['numéros de téléphones'],
      localisationsDonneesTraitees: ['horsUE'],
    });
  });

  it('renvoie toujours un statut de saisie à « COMPLETES » car MSS ne permet pas de créer une Description V2 incomplète', async () => {
    const descriptionV2 = uneDescriptionV2Valide().construis();

    expect(descriptionV2.statutSaisie()).toBe('completes');
  });

  describe("sur demande d'estimation du niveau de sécurité", () => {
    it('évalue le niveau de criticité des données traitées', () => {
      const donnees = uneDescriptionV2Valide()
        .avecVolumetrieDonneesTraitees('eleve')
        .avecCategoriesDonneesTraitees([
          'documentsIdentifiants',
          'secretsDEntreprise',
        ])
        .avecAutresDonneesTraitees(['donneeAjoutee', 'autreDonneeAjoutee'])
        .avecDureeDysfonctionnementAcceptable('moinsDe4h')
        .avecAudienceCible('large')
        .avecOuvertureSysteme('accessibleSurInternet')
        .donneesDescription();

      const niveauSecuriteMinimalRequis =
        DescriptionServiceV2.niveauSecuriteMinimalRequis(donnees);

      expect(niveauSecuriteMinimalRequis).toBe('niveau3');
    });
  });

  describe('sur demande de si les données de création sont valides', () => {
    it('répond true si tous les champs obligatoires sont remplis', () => {
      const d = uneDescriptionV2Valide().donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(true);
    });

    it("répond false s'il manque le nom du service", () => {
      const d = uneDescriptionV2Valide()
        .avecNomService('')
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le niveau de sécurité", () => {
      const d = uneDescriptionV2Valide()
        .avecNiveauSecurite(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le siret", () => {
      const d = uneDescriptionV2Valide().avecSiret('').donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le statut", () => {
      const d = uneDescriptionV2Valide()
        .avecStatutDeploiement(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque la présentation", () => {
      const d = uneDescriptionV2Valide()
        .avecPresentation('')
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le type de service", () => {
      const d = uneDescriptionV2Valide()
        .avecTypesService([])
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le type d'hébergement", () => {
      const d = uneDescriptionV2Valide()
        .avecTypeHebergement(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque l'ouverture du système", () => {
      const d = uneDescriptionV2Valide()
        .avecOuvertureSysteme(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque l'audience cible", () => {
      const d = uneDescriptionV2Valide()
        .avecAudienceCible(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque la durée maximale de dyfonctionnement", () => {
      const d = uneDescriptionV2Valide()
        .avecDureeDysfonctionnementAcceptable(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque le volume de données traitées", () => {
      const d = uneDescriptionV2Valide()
        .avecVolumeDonneesTraitees(undefined)
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it("répond false s'il manque la localisation des données traitées", () => {
      const d = uneDescriptionV2Valide()
        .avecLocalisationDonneesTraitees([])
        .donneesDescription();

      const estValide = DescriptionServiceV2.donneesObligatoiresRenseignees(d);

      expect(estValide).toBe(false);
    });

    it('répond false si le niveau de sécurité choisi est insuffisant', () => {
      const d = uneDescriptionV2Valide()
        .avecVolumeDonneesTraitees('tresEleve')
        .avecDonneesTraitees(['secretsDEntreprise', 'documentsRHSensibles'], [])
        .avecNiveauSecurite('niveau1')
        .donneesDescription();

      const estValide = DescriptionServiceV2.niveauSecuriteChoisiSuffisant(d);

      expect(estValide).toBe(false);
    });

    it('jette une erreur si les données sont incomplètes', () => {
      const d = uneDescriptionV2Valide()
        .avecLocalisationDonneesTraitees([])
        .donneesDescription();

      const estValide = () => DescriptionServiceV2.valideDonneesCreation(d);

      expect(estValide).toThrowError(ErreurDonneesObligatoiresManquantes);
    });

    it('jette une erreur si le niveau de sécurité choisi est insuffisant', () => {
      const d = uneDescriptionV2Valide()
        .avecNiveauSecurite('niveau1')
        .donneesDescription();

      const estValide = () => DescriptionServiceV2.valideDonneesCreation(d);

      expect(estValide).toThrowError(ErreurDonneesNiveauSecuriteInsuffisant);
    });
  });

  describe('sur demande de la projection vers les données nécessaires au moteur v2', () => {
    describe('concernant la criticité des données traitées', () => {
      it("donne un niveau 1 s'il n'y a que des données « Autre »", () => {
        const donneesAutres = uneDescriptionV2Valide()
          .avecDonneesTraitees([], ['Factures'])
          .construis();

        const p = donneesAutres.projectionPourMoteurV2();

        expect(p.criticiteDonneesTraitees).toBe(1);
      });

      it('retient la criticité de la donnée traitée la plus critique : comme lors du calcul du besoin de sécurité', () => {
        const donneesNiveau3Et4EtAutres = uneDescriptionV2Valide()
          .avecDonneesTraitees(
            ['documentsIdentifiants', 'donneesSensibles'],
            ['Factures']
          )
          .construis();

        const p = donneesNiveau3Et4EtAutres.projectionPourMoteurV2();

        expect(p.criticiteDonneesTraitees).toBe(4);
      });
    });

    it('utilise la criticité de la disponibilité du service', () => {
      const criticite3 = uneDescriptionV2Valide()
        .avecDureeDysfonctionnementAcceptable('moinsDe12h')
        .construis();

      const p = criticite3.projectionPourMoteurV2();

      expect(p.criticiteDisponibilite).toBe(3);
    });

    it('indique si les données sont hébergées hors UE', () => {
      const horsUE = uneDescriptionV2Valide()
        .avecLocalisationDonneesTraitees(['horsUE'])
        .construis();

      const p = horsUE.projectionPourMoteurV2();

      expect(p.donneesHorsUE).toBe(true);
    });

    it("utilise la criticité de l'ouverture du service", () => {
      const ouverture4 = uneDescriptionV2Valide()
        .avecOuvertureSysteme('accessibleSurInternet')
        .construis();

      const p = ouverture4.projectionPourMoteurV2();

      expect(p.criticiteOuverture).toBe(4);
    });

    it('incut les spécificités projet du service', () => {
      const avecSpecificites = uneDescriptionV2Valide()
        .avecSpecificitesProjet(['annuaire', 'postesDeTravail'])
        .construis();

      const p = avecSpecificites.projectionPourMoteurV2();

      expect(p.specificitesProjet).toEqual(['annuaire', 'postesDeTravail']);
    });

    it('inclut les types du service', () => {
      const deuxTypes = uneDescriptionV2Valide()
        .avecTypesService(['portailInformation', 'api'])
        .construis();

      const p = deuxTypes.projectionPourMoteurV2();

      expect(p.typeService).toEqual(['portailInformation', 'api']);
    });

    it("inclut le type d'hébergement du service", () => {
      const enSAAS = uneDescriptionV2Valide()
        .avecTypeHebergement('saas')
        .construis();

      const p = enSAAS.projectionPourMoteurV2();

      expect(p.typeHebergement).toBe('saas');
    });

    describe('concernant les activités externalisées', () => {
      it("indique l'activité externalisée s'il n'y en a qu'une", () => {
        const seulementLeDev = uneDescriptionV2Valide()
          .quiExternalise(['developpementLogiciel'])
          .construis();

        const p = seulementLeDev.projectionPourMoteurV2();

        expect(p.activitesExternalisees).toBe('developpementLogiciel');
      });

      it('indique « les deux » si tout est externalisé', () => {
        const toutExternalise = uneDescriptionV2Valide()
          .quiExternalise(['administrationTechnique', 'developpementLogiciel'])
          .construis();

        const p = toutExternalise.projectionPourMoteurV2();

        expect(p.activitesExternalisees).toBe('LesDeux');
      });
    });
  });
});
