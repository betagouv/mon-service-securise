const expect = require('expect.js');

const uneDescriptionValide = require('../constructeurs/constructeurDescriptionService');
const { unDossier } = require('../constructeurs/constructeurDossier');

const Referentiel = require('../../src/referentiel');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const Homologation = require('../../src/modeles/homologation');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const Utilisateur = require('../../src/modeles/utilisateur');
const VueAnnexePDFDescription = require('../../src/modeles/objetsPDF/objetPDFAnnexeDescription');
const VueAnnexePDFMesures = require('../../src/modeles/objetsPDF/objetPDFAnnexeMesures');
const VueAnnexePDFRisques = require('../../src/modeles/objetsPDF/objetPDFAnnexeRisques');
const { unService } = require('../constructeurs/constructeurService');
const {
  Rubriques: { DECRIRE, SECURISER, RISQUES, HOMOLOGUER },
  Permissions: { LECTURE },
} = require('../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');

describe('Une homologation', () => {
  it('connaît le nom du service', () => {
    const homologation = new Homologation({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'Super Service' },
    });

    expect(homologation.nomService()).to.equal('Super Service');
  });

  it('connaît ses contributrices et contributeurs', () => {
    const homologation = unService()
      .avecId('123')
      .ajouteUnContributeur(
        unUtilisateur()
          .avecId('456')
          .quiSAppelle('Jean Dupont')
          .avecEmail('jean.dupont@mail.fr').donnees
      )
      .construis();

    const { contributeurs } = homologation;
    expect(contributeurs.length).to.equal(1);

    const contributeur = contributeurs[0];
    expect(contributeur).to.be.an(Utilisateur);
    expect(contributeur.id).to.equal('456');
  });

  it('connaît son créateur', () => {
    const homologation = unService()
      .avecId('123')
      .ajouteUnProprietaire(
        unUtilisateur()
          .avecId('456')
          .quiSAppelle('Jean Dupont')
          .avecEmail('jean.dupont@mail.fr').donnees
      )
      .construis();

    const { createur } = homologation;
    expect(createur).to.be.an(Utilisateur);
    expect(createur.id).to.equal('456');
  });

  it('sait se convertir en JSON', () => {
    const homologation = unService()
      .avecId('123')
      .avecNomService('Super Service')
      .ajouteUnProprietaire(
        unUtilisateur()
          .avecId('456')
          .quiSAppelle('Bruno Dumans')
          .avecEmail('bruno.dumans@mail.fr').donnees
      )
      .ajouteUnContributeur(
        unUtilisateur()
          .avecId('999')
          .quiSAppelle('Jean Dupont')
          .avecEmail('jean.dupont@mail.fr').donnees
      )
      .construis();
    expect(homologation.toJSON()).to.eql({
      id: '123',
      nomService: 'Super Service',
      createur: {
        id: '456',
        cguAcceptees: false,
        prenomNom: 'Bruno Dumans',
        telephone: '',
        initiales: 'BD',
        postes: [],
        posteDetaille: '',
        nomEntitePublique: '',
        departementEntitePublique: '',
        profilEstComplet: true,
        infolettreAcceptee: false,
        transactionnelAccepte: false,
      },
      contributeurs: [
        {
          id: '999',
          cguAcceptees: false,
          prenomNom: 'Jean Dupont',
          telephone: '',
          initiales: 'JD',
          postes: [],
          posteDetaille: '',
          nomEntitePublique: '',
          departementEntitePublique: '',
          profilEstComplet: true,
          infolettreAcceptee: false,
          transactionnelAccepte: false,
        },
      ],
    });
  });

  it('sait décrire le type service', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        unType: { description: 'Un type' },
        unAutre: { description: 'Un autre' },
      },
    });
    const homologation = new Homologation(
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

    expect(homologation.descriptionTypeService()).to.equal('Un type, Un autre');
  });

  it("se comporte correctement si le type service n'est pas présente", () => {
    const homologation = new Homologation({ id: '123' });
    expect(homologation.descriptionTypeService()).to.equal(
      'Type de service non renseignée'
    );
  });

  it('connaît les rôles et responsabilités de ses acteurs et parties prenantes', () => {
    const homologation = new Homologation({
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

    expect(homologation.autoriteHomologation()).to.equal('Jean Dupont');
    expect(homologation.fonctionAutoriteHomologation()).to.equal('Maire');
    expect(homologation.delegueProtectionDonnees()).to.equal('Rémi Fassol');
    expect(homologation.piloteProjet()).to.equal('Sylvie Martin');
    expect(homologation.expertCybersecurite()).to.equal('Anna Dubreuil');
    expect(homologation.hebergeur()).to.equal('Hébergeur');
    expect(homologation.structureDeveloppement()).to.equal('Une structure');
  });

  it('connaît ses dossiers', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
    });
    const homologation = new Homologation(
      { id: '123', dossiers: [{ id: '999' }] },
      referentiel
    );

    expect(homologation.nombreDossiers()).to.equal(1);
  });

  it('connaît le dossier courant', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
    });
    const homologation = new Homologation(
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

    expect(homologation.dossierCourant().id).to.equal('999');
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
      const homologationAvecDossier = new Homologation(
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
        homologationAvecDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql(['dossierDecision']);
    });

    it("exclut le dossier de décision en cas d'absence de dossier d'homologation courant", () => {
      const homologationSansDossier = new Homologation(
        { id: '123', dossiers: [] },
        referentiel
      );
      const autorisationPourDossierDecision = uneAutorisation()
        .avecDroits({
          [HOMOLOGUER]: LECTURE,
        })
        .construis();

      expect(
        homologationSansDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql([]);
    });

    it("exclut le dossier de décision si l'étape courante du dossier d'homologation n'est pas suffisante", () => {
      const homologationSansDossier = new Homologation(
        { id: '123', dossiers: [unDossier(referentiel).donnees] },
        referentiel
      );
      const autorisationPourDossierDecision = uneAutorisation()
        .avecDroits({
          [HOMOLOGUER]: LECTURE,
        })
        .construis();

      expect(
        homologationSansDossier.documentsPdfDisponibles(
          autorisationPourDossierDecision
        )
      ).to.eql([]);
    });
  });

  it('connaît ses risques spécifiques', () => {
    const homologation = new Homologation({
      id: '123',
      risquesSpecifiques: [{ description: 'Un risque' }],
    });

    expect(homologation.risquesSpecifiques().nombre()).to.equal(1);
  });

  it('se construit en renseignant le caractère indispensable des mesures générales grâce aux mesures personnalisées', () => {
    const moteur = { mesures: () => ({ m1: { indispensable: true } }) };
    const referentiel = Referentiel.creeReferentiel({ mesures: { m1: {} } });

    const homologation = new Homologation(
      {
        id: '123',
        mesuresGenerales: [{ id: 'm1' }],
      },
      referentiel,
      moteur
    );

    expect(
      homologation.mesures.mesuresGenerales
        .toutes()
        .find((mesure) => mesure.id === 'm1').rendueIndispensable
    ).to.be(true);
  });

  it('connaît ses mesures spécifiques', () => {
    const homologation = new Homologation({
      id: '123',
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(homologation.mesuresSpecifiques().nombre()).to.equal(1);
  });

  it('délègue aux mesures le calcul des statistiques', () => {
    let calculDelegueAuxMesures = false;

    const homologation = new Homologation({ id: '123', mesuresGenerales: [] });
    homologation.mesures.statistiques = () => (calculDelegueAuxMesures = true);

    homologation.statistiquesMesures();
    expect(calculDelegueAuxMesures).to.be(true);
  });

  describe('sur évaluation du statut de saisie des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { m1: {}, m2: {} },
    });
    const moteur = { mesures: () => ({ m1: {}, m2: {} }) };

    it('détecte que la liste des mesures reste à saisir', () => {
      const homologation = new Homologation({ id: '123' });
      expect(homologation.statutSaisie('mesures')).to.equal(
        InformationsHomologation.A_SAISIR
      );
    });

    it('détecte que la liste des mesures est à compléter', () => {
      const homologation = new Homologation(
        {
          mesuresGenerales: [{ id: 'm1', statut: MesureGenerale.STATUT_FAIT }],
        },
        referentiel,
        moteur
      );

      expect(homologation.statutSaisie('mesures')).to.equal(
        InformationsHomologation.A_COMPLETER
      );
    });

    it('détecte que la liste des mesures est complète', () => {
      const homologation = new Homologation(
        {
          mesuresGenerales: [
            { id: 'm1', statut: MesureGenerale.STATUT_FAIT },
            { id: 'm2', statut: MesureGenerale.STATUT_FAIT },
          ],
        },
        referentiel,
        moteur
      );

      expect(homologation.statutSaisie('mesures')).to.equal(
        InformationsHomologation.COMPLETES
      );
    });
  });

  describe('sur évaluation du statut de saisie des risques', () => {
    it('détecte que la liste des risques reste à vérifier', () => {
      const homologation = new Homologation({ id: '123' });
      expect(homologation.statutSaisie('risques')).to.equal(
        InformationsHomologation.A_SAISIR
      );
    });
  });

  it('connaît son indice cyber', () => {
    const homologation = unService().construis();
    homologation.mesures.indiceCyber = () => 3.7;

    expect(homologation.indiceCyber()).to.equal(3.7);
  });

  it('délègue aux mesures le calcul du nombre total de mesures générales', () => {
    const homologation = new Homologation({ mesuresGenerales: [] });
    homologation.mesures.nombreTotalMesuresGenerales = () => 42;

    expect(homologation.nombreTotalMesuresGenerales()).to.equal(42);
  });

  it('délègue aux statistiques le filtrage par mesures indispensables', () => {
    let statistiquesMesuresAppelees = false;
    const unObjet = {};

    const homologation = new Homologation({
      mesuresGenerales: [],
    });
    homologation.statistiquesMesures = () => ({
      indispensables: () => {
        statistiquesMesuresAppelees = true;
        return unObjet;
      },
    });

    expect(homologation.statistiquesMesuresIndispensables()).to.equal(unObjet);
    expect(statistiquesMesuresAppelees).to.be(true);
  });

  it('délègue aux statistiques le filtrage par mesures recommandées', () => {
    let statistiquesMesuresAppelees = false;
    const unObjet = {};

    const homologation = new Homologation({
      mesuresGenerales: [],
    });
    homologation.statistiquesMesures = () => ({
      recommandees: () => {
        statistiquesMesuresAppelees = true;
        return unObjet;
      },
    });

    expect(homologation.statistiquesMesuresRecommandees()).to.equal(unObjet);
    expect(statistiquesMesuresAppelees).to.be(true);
  });

  it('délègue aux statistiques le calcul du nombre de mesures à remplir toutes catégories confondues', () => {
    const homologation = new Homologation({ mesuresGenerales: [] });
    homologation.statistiquesMesures = () => ({
      aRemplirToutesCategories: () => 42,
    });

    const nombre = homologation.nombreTotalMesuresARemplirToutesCategories();

    expect(nombre).to.equal(42);
  });

  it('délègue aux mesures le calcul de la complétude des mesures', () => {
    const homologation = new Homologation({});

    homologation.mesures = {
      statistiques: () => ({
        completude: () => ({
          nombreTotalMesures: 10,
          nombreMesuresCompletes: 8,
        }),
      }),
      statutsMesuresPersonnalisees: () => [],
      indiceCyber: () => ({ total: 4.2 }),
    };

    const completude = homologation.completudeMesures();

    expect(completude).to.eql({
      nombreTotalMesures: 10,
      nombreMesuresCompletes: 8,
      detailMesures: [],
      indiceCyber: { total: 4.2 },
    });
  });

  it('délègue aux mesures le calcul du nombre de mesures spécifiques', () => {
    const homologation = new Homologation({ mesuresGenerales: [] });
    homologation.mesures.nombreMesuresSpecifiques = () => 42;

    expect(homologation.nombreMesuresSpecifiques()).to.equal(42);
  });

  it('délègue aux mesures la récupération des mesures par statut et par catégorie', () => {
    const homologation = new Homologation({
      mesuresGenerales: [{ id: 'mesure1', statut: 'enCours' }],
    });
    homologation.mesures.parStatutEtCategorie = () => ({ unStatut: {} });

    expect(homologation.mesuresParStatutEtCategorie()).to.eql({ unStatut: {} });
  });

  it('sait décrire le statut de déploiement', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsDeploiement: {
        enLigne: {
          description: 'En ligne',
        },
      },
    });

    const homologation = new Homologation(
      {
        id: '123',
        idUtilisateur: '456',
        descriptionService: { nomService: 'nom', statutDeploiement: 'enLigne' },
      },
      referentiel
    );

    expect(homologation.descriptionStatutDeploiement()).to.equal('En ligne');
  });

  it('connaît la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: {
          description: 'France',
        },
      },
    });

    const homologation = new Homologation(
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

    expect(homologation.localisationDonnees()).to.equal('france');
  });

  it('sait décrire la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: {
          description: 'France',
        },
      },
    });

    const homologation = new Homologation(
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

    expect(homologation.descriptionLocalisationDonnees()).to.equal('France');
  });

  it("récupère un objet de vue pour le pdf de l'annexe de la description", () => {
    const homologation = new Homologation({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(homologation.vueAnnexePDFDescription()).to.be.a(
      VueAnnexePDFDescription
    );
  });

  it("récupère un objet de vue pour le pdf de l'annexe des risques", () => {
    const homologation = new Homologation({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(homologation.vueAnnexePDFRisques()).to.be.a(VueAnnexePDFRisques);
  });

  it("récupère un objet de vue pour le pdf de l'annexe des mesures", () => {
    const homologation = new Homologation({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom' },
    });

    expect(homologation.vueAnnexePDFMesures()).to.be.a(VueAnnexePDFMesures);
  });

  describe('sur requête des données à persister', () => {
    it("retourne une représentation correcte de l'ensemble de l'Homologation", () => {
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
      const homologation = new Homologation(
        {
          id: 'id-homologation',
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
          risquesSpecifiques: [{ description: 'Un risque' }],
          rolesResponsabilites: {
            autoriteHomologation: 'Jean Dupont',
            partiesPrenantes: [{ nom: 'Un hébergeur', type: 'Hebergement' }],
          },
        },
        referentiel
      );

      expect(homologation.donneesAPersister().toutes()).to.eql({
        id: 'id-homologation',
        descriptionService: {
          delaiAvantImpactCritique: 'unDelai',
          localisationDonnees: 'uneLocalisation',
          nomService: 'nom-service',
          presentation: 'Une présentation',
          provenanceService: 'uneProvenance',
          risqueJuridiqueFinancierReputationnel: false,
          statutDeploiement: 'unStatutDeploiement',
          donneesCaracterePersonnel: [],
          fonctionnalites: [],
          typeService: 'unType',
          donneesSensiblesSpecifiques: [],
          fonctionnalitesSpecifiques: [],
          pointsAcces: [],
          organisationsResponsables: ['ANSSI'],
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
        mesuresGenerales: [{ id: 'uneMesure', statut: 'fait' }],
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
        risquesGeneraux: [{ id: 'unRisque' }],
        risquesSpecifiques: [{ description: 'Un risque' }],
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
      const homologation = new Homologation(
        { id: 'id-homologation', descriptionService },
        referentiel
      );

      const duplicata = homologation.donneesADupliquer();

      expect(duplicata.id).to.be(undefined);
    });

    it("utilise le nom d'homologation passé en paramètre", () => {
      const homologation = new Homologation(
        { id: 'id-homologation', descriptionService },
        referentiel
      );

      const duplicata = homologation.donneesADupliquer('Nouveau service');

      expect(duplicata.descriptionService.nomService).to.equal(
        'Nouveau service'
      );
    });

    it("ne duplique pas les dossiers de l'homologation", () => {
      const homologation = new Homologation(
        {
          id: 'id-homologation',
          descriptionService,
          dossiers: [{ id: '999' }],
        },
        referentiel
      );

      const duplicata = homologation.donneesADupliquer();

      expect(duplicata.dossiers).to.be(undefined);
    });
  });

  describe('sur demande de finalisation du dossier courant', () => {
    it('délègue aux Dossiers la responsabilité', () => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel)
        .construis()
        .toJSON();
      let appelDelegue = false;

      const homologation = new Homologation(
        {
          id: '123',
          descriptionService,
        },
        referentiel
      );
      homologation.dossiers.finaliseDossierCourant = () => {
        appelDelegue = true;
      };

      homologation.finaliseDossierCourant();

      expect(appelDelegue).to.be(true);
    });
  });
});
