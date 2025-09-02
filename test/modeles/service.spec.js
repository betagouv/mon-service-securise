import expect from 'expect.js';
import uneDescriptionValide from '../constructeurs/constructeurDescriptionService';
import { unDossier } from '../constructeurs/constructeurDossier';
import * as Referentiel from '../../src/referentiel';
import InformationsService from '../../src/modeles/informationsService';
import Service from '../../src/modeles/service';
import MesureGenerale from '../../src/modeles/mesureGenerale';
import VueAnnexePDFDescription from '../../src/modeles/objetsPDF/objetPDFAnnexeDescription';
import VueAnnexePDFMesures from '../../src/modeles/objetsPDF/objetPDFAnnexeMesures';
import VueAnnexePDFRisques from '../../src/modeles/objetsPDF/objetPDFAnnexeRisques';
import { unService } from '../constructeurs/constructeurService';
import {
  Rubriques,
  Permissions,
} from '../../src/modeles/autorisations/gestionDroits';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur';
import Mesures from '../../src/modeles/mesures';
import MesureSpecifique from '../../src/modeles/mesureSpecifique';
import { Contributeur } from '../../src/modeles/contributeur';

const { DECRIRE, SECURISER, RISQUES, HOMOLOGUER } = Rubriques;
const { LECTURE } = Permissions;

describe('Un service', () => {
  it('connaît son nom', () => {
    const service = new Service({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'Super Service' },
    });

    expect(service.nomService()).to.equal('Super Service');
  });

  it('connaît sa version', () => {
    const serviceV1 = new Service({ versionService: 'v1' });

    expect(serviceV1.version()).to.be('v1');
  });

  it('connaît ses contributrices et contributeurs', () => {
    const service = unService()
      .avecId('123')
      .ajouteUnContributeur(
        unUtilisateur()
          .avecId('456')
          .quiSAppelle('Jean Dupont')
          .avecEmail('jean.dupont@mail.fr').donnees
      )
      .construis();

    const { contributeurs } = service;
    expect(contributeurs.length).to.equal(1);

    const contributeur = contributeurs[0];
    expect(contributeur).to.be.a(Contributeur);
    expect(contributeur.idUtilisateur).to.equal('456');
  });

  describe("concernant les suggestions d'actions", () => {
    it("sait quand il a une suggestion d'action", () => {
      const referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: { 'siret-a-renseigner': { lien: '' } },
      });

      const service = unService(referentiel)
        .avecSuggestionAction({ nature: 'siret-a-renseigner' })
        .construis();

      expect(service.aUneSuggestionDAction()).to.be(true);
    });

    it("sait quand il n'a pas de suggestion d'action", () => {
      const referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: { 'siret-a-renseigner': { lien: '' } },
      });

      const service = unService(referentiel).construis();

      expect(service.aUneSuggestionDAction()).to.be(false);
    });

    it("sait obtenir les routes MSS des suggestions d'actions", () => {
      const referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: {
          'siret-a-renseigner': {
            lien: '/descriptionService',
            permissionRequise: { rubrique: 'SECURISER', niveau: 2 },
          },
        },
      });

      const service = unService(referentiel)
        .avecId('S1')
        .avecSuggestionAction({ nature: 'siret-a-renseigner' })
        .construis();

      const routes = service.routesDesSuggestionsActions();

      expect(routes).to.eql([
        {
          rubrique: Rubriques.SECURISER,
          niveau: Permissions.ECRITURE,
          route: '/descriptionService',
        },
      ]);
    });

    it("retourne la route des suggestions d'actions la plus prioritaire en premier", () => {
      const referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: {
          a: { lien: '/a', permissionRequise: {}, priorite: 10 },
          b: { lien: '/b', permissionRequise: {}, priorite: 20 },
        },
      });

      const service = unService(referentiel)
        .avecId('S1')
        .avecSuggestionAction({ nature: 'b' })
        .avecSuggestionAction({ nature: 'a' })
        .construis();

      const routes = service.routesDesSuggestionsActions();

      expect(routes[0].route).to.eql('/a');
    });

    it('sait si une action n’est pas suggérée', () => {
      const service = unService().construis();

      const pourrait = service.pourraitFaire('miseAJourSiret');

      expect(pourrait).to.be(false);
    });

    it('sait si une action fait partie des suggestions', () => {
      const referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: { miseAJourSiret: { lien: '' } },
      });
      const service = unService(referentiel)
        .avecSuggestionAction({ nature: 'miseAJourSiret' })
        .construis();

      const pourrait = service.pourraitFaire('miseAJourSiret');

      expect(pourrait).to.be(true);
    });
  });

  describe('concernant les données de complétude', () => {
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: {}, protection: {}, resilience: {} },
        indiceCyber: { noteMax: 5 },
        mesures: { mesureA: {}, mesureB: {} },
        prioritesMesures: { p1: {} },
        statutsMesures: { fait: {}, enCours: {} },
      });
    });

    it("inclue le détail de l'indice cyber : l'indice de chaque catégorie ainsi que le total", () => {
      const uneGouvernanceFaite = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        {
          mesureA: { categorie: 'gouvernance' },
          mesureB: { categorie: 'gouvernance' },
          mesureC: { categorie: 'protection' },
          mesureD: { categorie: 'resilience' },
        }
      );
      const s = unService().avecMesures(uneGouvernanceFaite).construis();

      const completudeMesures = s.completudeMesures();

      expect(completudeMesures.indiceCyber).to.eql({
        gouvernance: 2.5,
        protection: 0,
        resilience: 0,
        total: 1.25,
      });
    });

    it('inclue le nombre total de mesures et le nombre qui sont « faites »', () => {
      const uneGouvernanceFaite = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        {
          mesureA: { categorie: 'gouvernance' },
          mesureB: { categorie: 'gouvernance' },
          mesureC: { categorie: 'protection' },
          mesureD: { categorie: 'resilience' },
        }
      );
      const s = unService().avecMesures(uneGouvernanceFaite).construis();

      const completudeMesures = s.completudeMesures();

      expect(completudeMesures.nombreMesuresCompletes).to.be(1);
      expect(completudeMesures.nombreTotalMesures).to.be(4);
    });

    describe('inclue le détail des mesures', () => {
      it('avec les données pertinentes', () => {
        const uneGouvernanceFaite = new Mesures(
          {
            mesuresGenerales: [
              {
                id: 'mesureA',
                statut: 'fait',
                priorite: 'p1',
                echeance: '2024-08-28',
                responsables: ['unIdUtilisateur'],
              },
            ],
          },
          referentiel,
          {
            mesureA: { categorie: 'gouvernance' },
            mesureB: { categorie: 'gouvernance' },
            mesureC: { categorie: 'protection' },
            mesureD: { categorie: 'resilience' },
          }
        );
        const s = unService().avecMesures(uneGouvernanceFaite).construis();

        const completudeMesures = s.completudeMesures();

        expect(completudeMesures.detailMesures).to.eql([
          {
            idMesure: 'mesureA',
            statut: 'fait',
            priorite: 'p1',
            echeance: '2024-08-28',
            nbResponsables: 1,
          },
        ]);
      });

      it('en ignorant les mesures générales qui ne sont pas des mesures personnalisées', () => {
        const uneSeulePersonnalisee = { mesureA: { categorie: 'gouvernance' } };
        const deuxGenerales = [
          { id: 'mesureA', statut: 'fait' },
          { id: 'mesureB', statut: 'fait' },
        ];
        const uneGeneraleEnTrop = new Mesures(
          { mesuresGenerales: deuxGenerales },
          referentiel,
          uneSeulePersonnalisee
        );
        const s = unService().avecMesures(uneGeneraleEnTrop).construis();

        const completudeMesures = s.completudeMesures();

        expect(completudeMesures.detailMesures.length).to.be(1);
        expect(completudeMesures.detailMesures[0].idMesure).to.be('mesureA');
      });
    });

    it("en ignorant les mesures dont le statut n'est pas renseigné", () => {
      const sansStatut = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: '' }] },
        referentiel,
        { mesureA: { categorie: 'gouvernance' } }
      );
      const s = unService().avecMesures(sansStatut).construis();

      const completudeMesures = s.completudeMesures();

      expect(completudeMesures.detailMesures).to.be.empty();
    });

    it('en ignorant complètement les mesures spécifiques, car elles ne sont pas considérées quand on parle de complétude', () => {
      const avecDesSpecifiques = new Mesures(
        {
          mesuresGenerales: [],
          mesuresSpecifiques: [{ statut: 'fait', categorie: 'gouvernance' }],
        },
        referentiel,
        { mesureA: { categorie: 'gouvernance' } }
      );
      const s = unService().avecMesures(avecDesSpecifiques).construis();

      const completudeMesures = s.completudeMesures();

      expect(completudeMesures.detailMesures).to.be.empty();
    });
  });

  it('sait décrire le type service', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        unType: { description: 'Un type' },
        unAutre: { description: 'Un autre' },
      },
    });
    const service = new Service(
      {
        id: '123',
        idUtilisateur: '456',
        descriptionService: {
          nomService: 'nom',
          typeService: ['unType', 'unAutre'],
        },
      },
      referentiel
    );

    expect(service.descriptionTypeService()).to.equal('Un type, Un autre');
  });

  it("se comporte correctement si le type service n'est pas présente", () => {
    const service = new Service({ id: '123' });
    expect(service.descriptionTypeService()).to.equal(
      'Type de service non renseignée'
    );
  });

  it('connaît les rôles et responsabilités de ses acteurs et parties prenantes', () => {
    const service = new Service({
      id: '123',
      rolesResponsabilites: {
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
        delegueProtectionDonnees: 'Rémi Fassol',
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
        partiesPrenantes: [
          { type: 'Hebergement', nom: 'Hébergeur' },
          { type: 'DeveloppementFourniture', nom: 'Une structure' },
        ],
      },
    });

    expect(service.autoriteHomologation()).to.equal('Jean Dupont');
    expect(service.fonctionAutoriteHomologation()).to.equal('Maire');
    expect(service.delegueProtectionDonnees()).to.equal('Rémi Fassol');
    expect(service.piloteProjet()).to.equal('Sylvie Martin');
    expect(service.expertCybersecurite()).to.equal('Anna Dubreuil');
    expect(service.hebergeur()).to.equal('Hébergeur');
    expect(service.structureDeveloppement()).to.equal('Une structure');
  });

  it('connaît ses dossiers', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
    });
    const service = new Service(
      { id: '123', dossiers: [{ id: '999' }] },
      referentiel
    );

    expect(service.nombreDossiers()).to.equal(1);
  });

  it('connaît le dossier courant', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
    });
    const service = new Service(
      {
        id: '123',
        dossiers: [
          {
            id: '777',
            dateHomologation: '2022-12-01',
            dureeValidite: 'unAn',
            finalise: true,
          },
          { id: '999' },
        ],
      },
      referentiel
    );

    expect(service.dossierCourant().id).to.equal('999');
  });

  describe('sur demande des documents PDF disponibles', () => {
    const referentiel = Referentiel.creeReferentiel({
      etapesParcoursHomologation: [
        { id: 'autorite', numero: 1 },
        { id: 'avis', numero: 2 },
      ],
      etapeNecessairePourDossierDecision: 'avis',
    });

    const droitsPourAnnexe = {
      [DECRIRE]: LECTURE,
      [SECURISER]: LECTURE,
      [RISQUES]: LECTURE,
    };
    const droitsPourSynthese = {
      [SECURISER]: LECTURE,
      [DECRIRE]: LECTURE,
    };

    const casDeTests = [
      {
        droits: droitsPourAnnexe,
        methodeComparaison: 'contain',
        valeurAttendue: 'annexes',
      },
      {
        droits: droitsPourSynthese,
        methodeComparaison: 'contain',
        valeurAttendue: 'syntheseSecurite',
      },
      {
        droits: {},
        methodeComparaison: 'eql',
        valeurAttendue: [],
      },
    ];

    casDeTests.forEach(({ droits, methodeComparaison, valeurAttendue }) => {
      it(`contient la valeur \`${valeurAttendue}\` avec les droits correspondant`, () => {
        const service = unService().construis();
        const autorisation = uneAutorisation().avecDroits(droits).construis();

        expect(service.documentsPdfDisponibles(autorisation)).to[
          methodeComparaison
        ](valeurAttendue);
      });
    });

    it("inclut le dossier de décision lorsqu'elle a un dossier d'homologation courant à une étape suffisante et les droits suffisants", () => {
      const serviceAvecDossier = new Service(
        {
          id: '123',
          dossiers: [
            unDossier(referentiel).avecAutorite('Jean Dujardin', 'RSSI')
              .donnees,
          ],
        },
        referentiel
      );
      const autorisationPourDossierDecision = uneAutorisation()
        .avecDroits({
          [HOMOLOGUER]: LECTURE,
        })
        .construis();

      expect(
        serviceAvecDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql(['dossierDecision']);
    });

    it("exclut le dossier de décision en cas d'absence de dossier d'homologation courant", () => {
      const serviceSansDossier = new Service(
        { id: '123', dossiers: [] },
        referentiel
      );
      const autorisationPourDossierDecision = uneAutorisation()
        .avecDroits({
          [HOMOLOGUER]: LECTURE,
        })
        .construis();

      expect(
        serviceSansDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql([]);
    });

    it("exclut le dossier de décision si l'étape courante du dossier d'homologation n'est pas suffisante", () => {
      const serviceSansDossier = new Service(
        { id: '123', dossiers: [unDossier(referentiel).donnees] },
        referentiel
      );
      const autorisationPourDossierDecision = uneAutorisation()
        .avecDroits({
          [HOMOLOGUER]: LECTURE,
        })
        .construis();

      expect(
        serviceSansDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql([]);
    });
  });

  it('connaît ses risques spécifiques', () => {
    const service = new Service({
      id: '123',
      risquesSpecifiques: [{ description: 'Un risque' }],
    });

    expect(service.risquesSpecifiques().nombre()).to.equal(1);
  });

  describe('sur ajout de risque spécifique', () => {
    it('assigne le premier identifiant numérique de risque spécifique', () => {
      const service = new Service({
        id: '123',
        risquesSpecifiques: [],
      });

      service.ajouteRisqueSpecifique({});

      expect(service.risquesSpecifiques().item(0).identifiantNumerique).to.be(
        'RS1'
      );
      expect(service.prochainIdNumeriqueDeRisqueSpecifique).to.be(2);
    });

    it('assigne le prochain identifiant numérique de risque spécifique', () => {
      const service = new Service({
        id: '123',
        prochainIdNumeriqueDeRisqueSpecifique: 42,
        risquesSpecifiques: [],
      });

      service.ajouteRisqueSpecifique({});

      expect(service.risquesSpecifiques().item(0).identifiantNumerique).to.be(
        'RS42'
      );
      expect(service.prochainIdNumeriqueDeRisqueSpecifique).to.be(43);
    });
  });

  it('se construit en renseignant le caractère indispensable des mesures générales grâce aux mesures personnalisées', () => {
    const moteur = { mesures: () => ({ m1: { indispensable: true } }) };
    const referentiel = Referentiel.creeReferentiel({ mesures: { m1: {} } });

    const service = new Service(
      {
        id: '123',
        mesuresGenerales: [{ id: 'm1' }],
      },
      referentiel,
      moteur
    );

    expect(
      service.mesures.mesuresGenerales
        .toutes()
        .find((mesure) => mesure.id === 'm1').rendueIndispensable
    ).to.be(true);
  });

  it('connaît ses mesures spécifiques', () => {
    const service = new Service({
      id: '123',
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(service.mesuresSpecifiques().nombre()).to.equal(1);
  });

  describe('sur évaluation du statut de saisie des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { m1: {}, m2: {} },
    });
    const moteur = { mesures: () => ({ m1: {}, m2: {} }) };

    it('détecte que la liste des mesures est à compléter', () => {
      const service = new Service(
        {
          mesuresGenerales: [{ id: 'm1', statut: MesureGenerale.STATUT_FAIT }],
        },
        referentiel,
        moteur
      );

      expect(service.statutSaisie('mesures')).to.equal(
        InformationsService.A_COMPLETER
      );
    });

    it('détecte que la liste des mesures est complète', () => {
      const service = new Service(
        {
          mesuresGenerales: [
            { id: 'm1', statut: MesureGenerale.STATUT_FAIT },
            { id: 'm2', statut: MesureGenerale.STATUT_FAIT },
          ],
        },
        referentiel,
        moteur
      );

      expect(service.statutSaisie('mesures')).to.equal(
        InformationsService.COMPLETES
      );
    });
  });

  describe('sur évaluation du statut de saisie des risques', () => {
    it('détecte que la liste des risques reste à vérifier', () => {
      const service = new Service({ id: '123' });
      expect(service.statutSaisie('risques')).to.equal(
        InformationsService.A_SAISIR
      );
    });
  });

  it('connaît son indice cyber', () => {
    const service = unService().construis();
    service.mesures.indiceCyber = () => 3.7;

    expect(service.indiceCyber()).to.equal(3.7);
  });

  it('connaît son indice cyber personnalisé', () => {
    const service = unService().construis();
    service.mesures.indiceCyberPersonnalise = () => 4.8;

    expect(service.indiceCyberPersonnalise()).to.equal(4.8);
  });

  it('délègue aux mesures le calcul du nombre total de mesures générales', () => {
    const service = new Service({ mesuresGenerales: [] });
    service.mesures.nombreTotalMesuresGenerales = () => 42;

    expect(service.nombreTotalMesuresGenerales()).to.equal(42);
  });

  it('délègue aux mesures le calcul du nombre de mesures spécifiques', () => {
    const service = new Service({ mesuresGenerales: [] });
    service.mesures.nombreMesuresSpecifiques = () => 42;

    expect(service.nombreMesuresSpecifiques()).to.equal(42);
  });

  it('délègue aux mesures la récupération des mesures par statut et par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { m1: {} },
    });
    const service = new Service(
      { mesuresGenerales: [{ id: 'm1', statut: 'enCours' }] },
      referentiel
    );
    service.mesures.parStatutEtCategorie = () => ({ unStatut: {} });

    const parStatutEtCategorie = service.mesuresParStatutEtCategorie();

    expect(parStatutEtCategorie).to.eql({ unStatut: {} });
  });

  it('sait décrire le statut de déploiement', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsDeploiement: {
        enLigne: {
          description: 'En ligne',
        },
      },
    });

    const service = new Service(
      {
        id: '123',
        idUtilisateur: '456',
        descriptionService: { nomService: 'nom', statutDeploiement: 'enLigne' },
      },
      referentiel
    );

    expect(service.descriptionStatutDeploiement()).to.equal('En ligne');
  });

  it('connaît la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: {
          description: 'France',
        },
      },
    });

    const service = new Service(
      {
        id: '123',
        idUtilisateur: '456',
        descriptionService: {
          nomService: 'nom',
          localisationDonnees: 'france',
        },
      },
      referentiel
    );

    expect(service.localisationDonnees()).to.equal('france');
  });

  it('sait décrire la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: {
          description: 'France',
        },
      },
    });

    const service = new Service(
      {
        id: '123',
        idUtilisateur: '456',
        descriptionService: {
          nomService: 'nom',
          localisationDonnees: 'france',
        },
      },
      referentiel
    );

    expect(service.descriptionLocalisationDonnees()).to.equal('France');
  });

  it("récupère un objet de vue pour le pdf de l'annexe de la description", () => {
    const service = new Service({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(service.vueAnnexePDFDescription()).to.be.a(VueAnnexePDFDescription);
  });

  it("récupère un objet de vue pour le pdf de l'annexe des risques", () => {
    const service = new Service({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(service.vueAnnexePDFRisques()).to.be.a(VueAnnexePDFRisques);
  });

  it("récupère un objet de vue pour le pdf de l'annexe des mesures", () => {
    const service = new Service({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(service.vueAnnexePDFMesures()).to.be.a(VueAnnexePDFMesures);
  });

  describe('sur requête des données à persister', () => {
    it("retourne une représentation correcte de l'ensemble du service", () => {
      const referentiel = Referentiel.creeReferentiel({
        categoriesMesures: {},
        documentsHomologation: { decision: {} },
        echeancesRenouvellement: { unAn: {} },
        localisationsDonnees: { uneLocalisation: {} },
        mesures: { uneMesure: {} },
        reglesPersonnalisation: { mesuresBase: ['uneMesure'] },
        risques: { unRisque: {} },
        statutsDeploiement: { unStatutDeploiement: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });

      const aujourdhui = new Date();
      const service = new Service(
        {
          id: 'id-service',
          prochainIdNumeriqueDeRisqueSpecifique: 42,
          descriptionService: uneDescriptionValide(
            Referentiel.creeReferentielVide()
          )
            .avecNomService('nom-service')
            .construis()
            .toJSON(),
          dossiers: [
            {
              ...unDossier(referentiel)
                .quiEstComplet()
                .avecDateHomologation(aujourdhui)
                .avecDateTelechargement(aujourdhui).donnees,
            },
          ],
          mesuresGenerales: [{ id: 'uneMesure', statut: 'fait' }],
          mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
          risquesGeneraux: [{ id: 'unRisque' }],
          risquesSpecifiques: [
            {
              intitule: 'Un risque',
              categories: ['confidentialite'],
              id: 'abcd',
            },
          ],
          rolesResponsabilites: {
            autoriteHomologation: 'Jean Dupont',
            partiesPrenantes: [{ nom: 'Un hébergeur', type: 'Hebergement' }],
          },
        },
        referentiel
      );

      expect(service.donneesAPersister().toutes()).to.eql({
        id: 'id-service',
        prochainIdNumeriqueDeRisqueSpecifique: 42,
        descriptionService: {
          delaiAvantImpactCritique: 'unDelai',
          localisationDonnees: 'uneLocalisation',
          nomService: 'nom-service',
          presentation: 'Une présentation',
          provenanceService: 'uneProvenance',
          statutDeploiement: 'unStatutDeploiement',
          donneesCaracterePersonnel: [],
          fonctionnalites: [],
          typeService: 'unType',
          donneesSensiblesSpecifiques: [],
          fonctionnalitesSpecifiques: [],
          pointsAcces: [],
          organisationResponsable: {
            nom: 'ANSSI',
            siret: '12345',
            departement: '75',
          },
          nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
          niveauSecurite: 'niveau1',
        },
        dossiers: [
          {
            id: '1',
            avecAvis: true,
            avis: [
              {
                collaborateurs: ['Jean Dupond'],
                dureeValidite: 'unAn',
                statut: 'favorable',
              },
            ],
            avecDocuments: true,
            documents: ['unDocument'],
            autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
            decision: {
              dateHomologation: aujourdhui.toISOString(),
              dureeValidite: 'unAn',
            },
            dateTelechargement: { date: aujourdhui.toISOString() },
            finalise: true,
          },
        ],
        mesuresGenerales: [
          { id: 'uneMesure', statut: 'fait', responsables: [] },
        ],
        mesuresSpecifiques: [
          {
            description: 'Une mesure spécifique',
            responsables: [],
          },
        ],
        risquesGeneraux: [{ id: 'unRisque' }],
        risquesSpecifiques: [
          {
            intitule: 'Un risque',
            categories: ['confidentialite'],
            id: 'abcd',
          },
        ],
        rolesResponsabilites: {
          acteursHomologation: [],
          autoriteHomologation: 'Jean Dupont',
          partiesPrenantes: [{ nom: 'Un hébergeur', type: 'Hebergement' }],
        },
      });
    });
  });

  describe('sur une demande des données à dupliquer', () => {
    const referentiel = Referentiel.creeReferentielVide();
    const descriptionService = uneDescriptionValide(referentiel)
      .construis()
      .toJSON();

    it('retourne les données sans identifiant', () => {
      const service = new Service(
        { id: 'id-service', descriptionService },
        referentiel
      );

      const duplicata = service.donneesADupliquer();

      expect(duplicata.id).to.be(undefined);
    });

    it('utilise le nom de service passé en paramètre', () => {
      const service = new Service(
        { id: 'id-service', descriptionService },
        referentiel
      );

      const duplicata = service.donneesADupliquer('Nouveau service');

      expect(duplicata.descriptionService.nomService).to.equal(
        'Nouveau service'
      );
    });

    it('utilise le siret passé en paramètre', () => {
      const service = new Service(
        { id: 'id-service', descriptionService },
        referentiel
      );

      const duplicata = service.donneesADupliquer(
        'Nouveau service',
        'NOUVEAU_SIRET'
      );

      expect(
        duplicata.descriptionService.organisationResponsable.siret
      ).to.equal('NOUVEAU_SIRET');
    });

    it("ne duplique pas les dossiers de l'homologation", () => {
      const service = new Service(
        {
          id: 'id-service',
          descriptionService,
          dossiers: [{ id: '999' }],
        },
        referentiel
      );

      const duplicata = service.donneesADupliquer();

      expect(duplicata.dossiers).to.be(undefined);
    });
  });

  describe("sur demande d'instanciation d'un service pour un utilisateur", () => {
    it('retourne un service qui utilise des valeurs par défaut', () => {
      const utilisateur = unUtilisateur().construis();
      const service = Service.creePourUnUtilisateur(utilisateur);

      expect(
        service.descriptionService.nombreOrganisationsUtilisatrices
      ).to.eql({ borneBasse: 0, borneHaute: 0 });
    });

    it("ajoute le nom de l'entité si l'utilisateur en a une", () => {
      const utilisateur = unUtilisateur().avecNomEntite('ANSSI').construis();
      const service = Service.creePourUnUtilisateur(utilisateur);

      expect(service.descriptionService.organisationResponsable.nom).to.eql(
        'ANSSI'
      );
    });
  });

  it('délègue la suppression du dossier courant aux dossiers', () => {
    let appelDelegue = false;

    const service = unService().construis();
    service.dossiers.supprimeDossierCourant = () => {
      appelDelegue = true;
    };

    service.supprimeDossierCourant();
    expect(appelDelegue).to.be(true);
  });

  describe("sur demande de mise à jour d'une mesure générale", () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: {
          identifiantMesure: {},
        },
      });
    });
    it('ignore les responsables de la mesure qui ne font pas partie des contributeurs', async () => {
      const utilisateur = unUtilisateur()
        .avecId('unIdDeContributeur')
        .construis();
      const service = unService().ajouteUnContributeur(utilisateur).construis();
      const mesure = new MesureGenerale(
        {
          id: 'identifiantMesure',
          statut: 'fait',
          responsables: ['unIdDeContributeur', 'pasUnIdDeContributeur'],
        },
        referentiel
      );

      await service.metsAJourMesureGenerale(mesure);

      expect(
        service.mesuresGenerales().avecId('identifiantMesure').responsables
      ).to.eql(['unIdDeContributeur']);
    });

    it('mets à jour la mesure', async () => {
      const utilisateur = unUtilisateur()
        .avecId('unIdDeContributeur')
        .construis();
      const service = unService().ajouteUnContributeur(utilisateur).construis();
      const mesure = new MesureGenerale(
        {
          id: 'identifiantMesure',
          statut: 'fait',
          responsables: ['unIdDeContributeur'],
        },
        referentiel
      );

      await service.metsAJourMesureGenerale(mesure);

      expect(service.mesuresGenerales().toutes().length).to.be(1);
      expect(service.mesuresGenerales().toutes()[0].toJSON()).to.eql({
        id: 'identifiantMesure',
        statut: 'fait',
        responsables: ['unIdDeContributeur'],
      });
    });
  });

  describe("sur demande de mise à jour d'une mesure spécifique", () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        categoriesMesures: { gouvernance: '' },
      });
    });

    it('ignore les responsables de la mesure qui ne font pas partie des contributeurs', async () => {
      const utilisateur = unUtilisateur()
        .avecId('unIdDeContributeur')
        .construis();
      const mesure = new MesureSpecifique(
        {
          id: 'M1',
          statut: 'fait',
          responsables: ['unIdDeContributeur', 'pasUnIdDeContributeur'],
        },
        referentiel
      );
      const service = unService().ajouteUnContributeur(utilisateur).construis();
      let donneesRecues;
      service.mesures.mesuresSpecifiques.metsAJourMesure = (mesureRecu) => {
        donneesRecues = mesureRecu;
      };

      await service.metsAJourMesureSpecifique(mesure);

      expect(donneesRecues.responsables).to.eql(['unIdDeContributeur']);
    });

    it('mets à jour la mesure', async () => {
      const service = unService().construis();
      let donneesRecues;
      service.mesures.mesuresSpecifiques.metsAJourMesure = (mesureRecu) => {
        donneesRecues = mesureRecu;
      };
      const mesure = new MesureSpecifique(
        {
          id: 'M1',
          statut: 'fait',
          responsables: [],
        },
        referentiel
      );

      await service.metsAJourMesureSpecifique(mesure);

      expect(donneesRecues.id).to.be('M1');
    });

    it('peut ajouter un responsable', async () => {
      const service = unService()
        .ajouteUnContributeur(
          unUtilisateur().avecId('id-utilisateur').construis()
        )
        .construis();
      let donneesRecues;
      service.mesures.mesuresSpecifiques.metsAJourMesure = (mesureRecu) => {
        donneesRecues = mesureRecu;
      };
      const mesure = new MesureSpecifique(
        {
          id: 'M1',
          statut: 'fait',
          responsables: ['id-utilisateur'],
        },
        referentiel
      );

      await service.metsAJourMesureSpecifique(mesure);

      expect(donneesRecues.responsables).to.eql(['id-utilisateur']);
    });
  });

  describe("sur demande de l'action recommandée", () => {
    let referentiel;
    let mesuresToutesFaites;
    let mesuresNonFaites;
    let mesuresNonRemplies;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
        statutsAvisDossierHomologation: { favorable: {} },
        categoriesMesures: { gouvernance: {} },
        statutsMesures: { fait: {}, enCours: {} },
        mesures: { mesureA: {} },
        indiceCyber: { noteMax: 5 },
      });
      mesuresToutesFaites = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        { mesureA: { categorie: 'gouvernance' } }
      );
      mesuresNonFaites = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'enCours' }] },
        referentiel,
        { mesureA: { categorie: 'gouvernance' } }
      );
      mesuresNonRemplies = new Mesures({ mesuresGenerales: [] }, referentiel, {
        mesureA: { categorie: 'gouvernance' },
      });
    });

    it("retourne 'mettreAJour' si le service a une suggestion d'action", () => {
      referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: { 'siret-a-renseigner': { lien: '' } },
      });

      const service = unService(referentiel)
        .avecSuggestionAction({ nature: 'siret-a-renseigner' })
        .construis();

      expect(service.actionRecommandee().id).to.be('mettreAJour');
    });

    it("retourne 'continuerHomologation' si le service a un un dossier d'homologation en cours et un indice cyber supérieur à 4", () => {
      const service = unService(referentiel)
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
        ])
        .avecMesures(mesuresToutesFaites)
        .construis();

      expect(service.actionRecommandee().id).to.be('continuerHomologation');
    });

    it("retourne 'augmenterIndiceCyber' si le service a un un dossier d'homologation en cours et un indice cyber inférieur à 4", () => {
      const service = unService(referentiel)
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstNonFinalise().donnees,
        ])
        .avecMesures(mesuresNonFaites)
        .construis();

      expect(service.actionRecommandee().id).to.be('augmenterIndiceCyber');
    });

    it("retourne 'telechargerEncartHomologation' si le service a un un dossier d'homologation actif et en cours de validité", () => {
      const service = unService(referentiel)
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstActif().donnees,
        ])
        .construis();

      expect(service.actionRecommandee().id).to.be(
        'telechargerEncartHomologation'
      );
    });

    it("ne retourne pas 'telechargerEncartHomologation' si le service a un un dossier d'homologation actif mais qu'il a été importé", () => {
      const service = unService(referentiel)
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstActif().quiAEteImporte()
            .donnees,
        ])
        .construis();

      expect(service.actionRecommandee()?.id).not.to.be(
        'telechargerEncartHomologation'
      );
    });

    it("retourne 'homologuerANouveau' si le service a un un dossier d'homologation expirée", () => {
      const service = unService(referentiel)
        .avecDossiers([
          unDossier(referentiel).quiEstComplet().quiEstExpire().donnees,
        ])
        .construis();

      expect(service.actionRecommandee().id).to.be('homologuerANouveau');
    });

    it("retourne 'inviterContributeur' si le service n'a qu'un contributeur, un taux de complétion inférieur à 80% et indice cyber inférieur à 4", () => {
      const service = unService(referentiel)
        .avecNContributeurs(1)
        .avecMesures(mesuresNonRemplies)
        .construis();

      expect(service.actionRecommandee().id).to.be('inviterContributeur');
    });

    it("retourne 'augmenterIndiceCyber' si le service a plus d'un contributeur, un taux de complétion inférieur à 80% et indice cyber inférieur à 4", () => {
      const service = unService(referentiel)
        .avecNContributeurs(2)
        .avecMesures(mesuresNonRemplies)
        .construis();

      expect(service.actionRecommandee().id).to.be('augmenterIndiceCyber');
    });

    it("retourne 'homologuerService' si le service a un taux de complétion supérieur à 80% et indice cyber supérieur à 4", () => {
      const service = unService(referentiel)
        .avecMesures(mesuresToutesFaites)
        .construis();

      expect(service.actionRecommandee().id).to.be('homologuerService');
    });

    it("retourne 'undefined' si aucune action recommandée", () => {
      const service = unService().construis();

      expect(service.actionRecommandee()).to.be(undefined);
    });
  });

  it('Passe les modèles de mesures spécifiques à la classe de Mesures, afin de faire passe plat pour les Mesures Spécifiques', () => {
    const service = new Service({
      id: '123',
      modelesDisponiblesDeMesureSpecifique: {
        'MOD-1': { description: 'Mon modèle de mesure' },
      },
      mesuresSpecifiques: [{ idModele: 'MOD-1' }],
    });

    const mesureSpecifique = service.mesuresSpecifiques().item(0);
    expect(mesureSpecifique.idModele).to.be('MOD-1');
    expect(mesureSpecifique.description).to.be('Mon modèle de mesure');
  });
});
