const expect = require('expect.js');

const uneDescriptionValide = require('../constructeurs/constructeurDescriptionService');

const {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const AdaptateurUUID = require('../../src/adaptateurs/adaptateurUUID');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');

const Dossier = require('../../src/modeles/dossier');
const Homologation = require('../../src/modeles/homologation');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');
const RolesResponsabilites = require('../../src/modeles/rolesResponsabilites');

const copie = require('../../src/utilitaires/copie');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { unService } = require('../constructeurs/constructeurService');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  unDepotDeDonneesServices,
} = require('../constructeurs/constructeurDepotDonneesServices');
const {
  unAdaptateurTracking,
} = require('../constructeurs/constructeurAdaptateurTracking');
const {
  unServiceTracking,
} = require('../tracking/constructeurServiceTracking');
const { unDossier } = require('../constructeurs/constructeurDossier');

const {
  Rubriques,
  Permissions,
} = require('../../src/modeles/autorisations/gestionDroits');

const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;
const { ECRITURE } = Permissions;

describe('Le dépôt de données des homologations', () => {
  it("connaît toutes les homologations d'un utilisateur donné", async () => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        homologations: [
          { id: '123', descriptionService: { nomService: 'Super Service' } },
          { id: '789', descriptionService: { nomService: 'Autre service' } },
        ],
        utilisateurs: [
          {
            id: '456',
            prenom: 'Jean',
            nom: 'Dupont',
            email: 'jean.dupont@mail.fr',
          },
        ],
        autorisations: [
          uneAutorisation().deCreateurDeService('456', '123').donnees,
          uneAutorisation().deCreateurDeService('999', '789').donnees,
        ],
      }
    );
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
      referentiel,
    });

    const homologations = await depot.homologations('456');

    expect(homologations.length).to.equal(1);
    expect(homologations[0]).to.be.a(Homologation);
    expect(homologations[0].id).to.equal('123');
    expect(homologations[0].referentiel).to.equal(referentiel);

    expect(homologations[0].createur).to.be.ok();
    expect(homologations[0].createur.id).to.equal('456');
  });

  it("utilise l'adaptateur de persistance sans `idUtilisateur` pour récupérer toutes les homologations du système", async () => {
    let adaptateurAppele;
    let idRecu;
    const adaptateurPersistance = unePersistanceMemoire().construis();
    adaptateurPersistance.homologations = async (idUtilisateur) => {
      adaptateurAppele = true;
      idRecu = idUtilisateur;
      return [];
    };

    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    await depot.toutesHomologations();

    expect(adaptateurAppele).to.be(true);
    expect(idRecu).to.be(undefined);
  });

  it('trie les homologations par ordre alphabétique du nom du service', async () => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        homologations: [
          { id: '123', descriptionService: { nomService: 'B-service' } },
          { id: '456', descriptionService: { nomService: 'C-service' } },
          { id: '789', descriptionService: { nomService: 'A-service' } },
        ],
        utilisateurs: [
          {
            id: '999',
            prenom: 'Jean',
            nom: 'Dupont',
            email: 'jean.dupont@mail.fr',
          },
        ],
        autorisations: [
          uneAutorisation().deCreateurDeService('999', '123').donnees,
          uneAutorisation().deCreateurDeService('999', '456').donnees,
          uneAutorisation().deCreateurDeService('999', '789').donnees,
        ],
      }
    );
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    const hs = await depot.homologations('999');

    expect(hs.length).to.equal(3);
    expect(hs[0].nomService()).to.equal('A-service');
    expect(hs[1].nomService()).to.equal('B-service');
    expect(hs[2].nomService()).to.equal('C-service');
  });

  it('peut retrouver une homologation à partir de son identifiant', async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService({ id: '789', descriptionService: { nomService: 'nom' } })
      .construis();
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
      referentiel,
    });

    const homologation = await depot.homologation('789');

    expect(homologation).to.be.a(Homologation);
    expect(homologation.id).to.equal('789');
    expect(homologation.referentiel).to.equal(referentiel);
  });

  it("associe ses contributeurs à l'homologation", async () => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        utilisateurs: [
          { id: '111', email: 'createur@mail.fr' },
          { id: '999', email: 'contributeur@mail.fr' },
        ],
        homologations: [
          { id: '789', descriptionService: { nomService: 'nom' } },
        ],
        autorisations: [
          uneAutorisation().deCreateurDeService('111', '789').donnees,
          uneAutorisation().deContributeurDeService('999', '789').donnees,
        ],
      }
    );
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    const homologation = await depot.homologation('789');

    const { contributeurs } = homologation;
    expect(contributeurs.length).to.equal(1);
    expect(contributeurs[0].id).to.equal('999');
  });

  describe("sur demande d'associations de mesures à un service", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;
    let depot;

    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { identifiantMesure: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['identifiantMesure'] },
    });

    beforeEach(() => {
      const utilisateur = unUtilisateur().avecId('789').donnees;
      const autorisation = uneAutorisation().deCreateurDeService(
        '789',
        '123'
      ).donnees;
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom').donnees;
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService(service)
        .ajouteUneAutorisation(autorisation)
        .ajouteUnUtilisateur(utilisateur);
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecJournalMSS(adaptateurJournalMSS)
        .construis();
    });

    it("associe les mesures générales à l'homologation", async () => {
      const generale = new MesureGenerale(
        { id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT },
        referentiel
      );

      const specifiques = new MesuresSpecifiques();
      await depot.ajouteMesuresAHomologation('123', [generale], specifiques);

      const {
        mesures: { mesuresGenerales },
      } = await depot.homologation('123');
      expect(mesuresGenerales.nombre()).to.equal(1);
      expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
    });

    it('associe les mesures générales au service', async () => {
      const depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: adaptateurPersistance.construis(),
        referentiel,
      });
      const generale = new MesureGenerale(
        { id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT },
        referentiel
      );

      const specifiques = new MesuresSpecifiques();
      await depot.ajouteMesuresAHomologation('123', [generale], specifiques);

      const {
        mesures: { mesuresGenerales },
      } = await depotServices.service('123');

      expect(mesuresGenerales.nombre()).to.equal(1);
      expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
    });

    it("met à jour les données de la mesure générale si elle est déjà associée à l'homologation", async () => {
      const generale = new MesureGenerale(
        { id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT },
        referentiel
      );

      const specifiques = new MesuresSpecifiques();
      await depot.ajouteMesuresAHomologation('123', [generale], specifiques);

      const {
        mesures: { mesuresGenerales },
      } = await depot.homologation('123');
      expect(mesuresGenerales.nombre()).to.equal(1);
      expect(mesuresGenerales.item(0).statut).to.equal(
        MesureGenerale.STATUT_FAIT
      );
    });

    it("associe les mesures spécifiques à l'homologation", async () => {
      const generales = [];
      const specifiques = new MesuresSpecifiques({
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      await depot.ajouteMesuresAHomologation('123', generales, specifiques);

      const {
        mesures: { mesuresSpecifiques },
      } = await depot.homologation('123');
      expect(mesuresSpecifiques.nombre()).to.equal(1);
      expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
      expect(mesuresSpecifiques.item(0).description).to.equal(
        'Une mesure spécifique'
      );
    });

    it('associe les mesures spécifiques au service', async () => {
      const depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: adaptateurPersistance.construis(),
        referentiel,
      });
      const generales = [];
      const mesures = new MesuresSpecifiques({
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      await depot.ajouteMesuresAHomologation('123', generales, mesures);

      const {
        mesures: { mesuresSpecifiques },
      } = await depotServices.service('123');
      expect(mesuresSpecifiques.nombre()).to.equal(1);
      expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
      expect(mesuresSpecifiques.item(0).description).to.equal(
        'Une mesure spécifique'
      );
    });

    it('consigne un événement de changement de complétude du service', async () => {
      let evenementRecu = {};
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        evenementRecu = evenement;
        return Promise.resolve();
      };
      const generales = [];
      const specifiques = new MesuresSpecifiques({
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      await depot.ajouteMesuresAHomologation('123', generales, specifiques);

      expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
    });

    it("l'adaptateur de tracking est utilisé pour envoyé la complétude lors de modification de mesures", async () => {
      let donneesPassees = {};
      const adaptateurTracking = unAdaptateurTracking()
        .avecEnvoiTrackingCompletude((destinataire, donneesEvenement) => {
          donneesPassees = { destinataire, donneesEvenement };
        })
        .construis();
      const serviceTracking = unServiceTracking()
        .avecCompletudeDesServices(1, 5, 18)
        .construis();
      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecAdaptateurTracking(adaptateurTracking)
        .avecServiceTracking(serviceTracking)
        .avecReferentiel(referentiel)
        .construis();
      const mesures = new MesuresSpecifiques({
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      await depot.ajouteMesuresAHomologation('123', [], mesures);

      expect(donneesPassees).to.eql({
        destinataire: 'jean.dujardin@beta.gouv.com',
        donneesEvenement: {
          nombreServices: 1,
          nombreMoyenContributeurs: 5,
          tauxCompletudeMoyenTousServices: 18,
        },
      });
    });
  });

  it('renseigne les mesures générales associées à une homologation', async () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { identifiantMesure: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['identifiantMesure'] },
    });

    const donneesHomologation = {
      id: '123',
      descriptionService: { nomService: 'Un service' },
      mesuresGenerales: [{ id: 'identifiantMesure', statut: 'fait' }],
    };

    const depot = unDepotDeDonneesServices()
      .avecAdaptateurPersistance(
        unePersistanceMemoire().ajouteUnService(donneesHomologation)
      )
      .avecReferentiel(referentiel)
      .construis();

    const {
      mesures: { mesuresGenerales },
    } = await depot.homologation('123');

    expect(mesuresGenerales.nombre()).to.equal(1);
    const mesure = mesuresGenerales.item(0);
    expect(mesure).to.be.a(MesureGenerale);
    expect(mesure.id).to.equal('identifiantMesure');
  });

  describe("sur demande de mise à jour de la description du service d'une homologation", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;
    let depot;
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
      const utilisateur = unUtilisateur()
        .avecId('999')
        .avecEmail('jean.dupont@mail.fr').donnees;
      const autorisation = uneAutorisation().deCreateurDeService(
        '999',
        '123'
      ).donnees;
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('Super Service').donnees;
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService(service)
        .ajouteUneAutorisation(autorisation)
        .ajouteUnUtilisateur(utilisateur);
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecJournalMSS(adaptateurJournalMSS)
        .construis();
    });

    it("met à jour la description du service d'une homologation", async () => {
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      await depot.ajouteDescriptionServiceAHomologation(
        '999',
        '123',
        description
      );

      const { descriptionService } = await depot.homologation('123');
      expect(descriptionService.nomService).to.equal('Nouveau Nom');
    });

    it("met à jour la description de service dans l'objet métier service", async () => {
      const depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: adaptateurPersistance.construis(),
        referentiel,
      });
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      await depot.ajouteDescriptionServiceAHomologation(
        '999',
        '123',
        description
      );

      const { descriptionService } = await depotServices.service('123');
      expect(descriptionService.nomService).to.equal('Nouveau Nom');
    });

    it('lève une exception si des propriétés obligatoires ne sont pas renseignées', (done) => {
      const descriptionIncomplete = uneDescriptionValide(referentiel)
        .avecNomService('')
        .construis();

      depot
        .ajouteDescriptionServiceAHomologation(
          '999',
          '123',
          descriptionIncomplete
        )
        .then(() =>
          done(
            'La mise à jour de la description du service aurait dû lever une exception'
          )
        )
        .catch((e) => {
          expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
          expect(e.message).to.equal(
            'Certaines données obligatoires ne sont pas renseignées'
          );
          done();
        })
        .catch(done);
    });

    it("ne détecte pas de doublon sur le nom de service pour l'homologation en cours de mise à jour", async () => {
      const description = uneDescriptionValide(referentiel)
        .avecPresentation('Une autre présentation')
        .construis();

      await depot.ajouteDescriptionServiceAHomologation(
        '999',
        '123',
        description
      );

      const { descriptionService } = await depot.homologation('123');
      expect(descriptionService.presentation).to.equal(
        'Une autre présentation'
      );
    });

    it('consigne un événement de changement de complétude du service', async () => {
      let evenementRecu = {};
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        evenementRecu = evenement;
        return Promise.resolve();
      };
      const description = uneDescriptionValide(referentiel).construis();

      await depot.ajouteDescriptionServiceAHomologation(
        '999',
        '123',
        description
      );

      expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
    });

    it("l'adaptateur de tracking est utilisé pour envoyer la complétude lors de la mise à jour d'une description du service", async () => {
      let donneesPassees = {};
      const description = uneDescriptionValide(referentiel).construis();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecJournalMSS(adaptateurJournalMSS)
        .avecServiceTracking(
          unServiceTracking().avecCompletudeDesServices(2, 3, 12).construis()
        )
        .avecAdaptateurTracking(
          unAdaptateurTracking()
            .avecEnvoiTrackingCompletude((destinataire, donneesEvenement) => {
              donneesPassees = { destinataire, donneesEvenement };
            })
            .construis()
        )
        .construis();

      await depot.ajouteDescriptionServiceAHomologation(
        '999',
        '123',
        description
      );

      expect(donneesPassees).to.eql({
        destinataire: 'jean.dupont@mail.fr',
        donneesEvenement: {
          nombreServices: 2,
          nombreMoyenContributeurs: 3,
          tauxCompletudeMoyenTousServices: 12,
        },
      });
    });
  });

  it('sait associer des rôles et responsabilités à une homologation', (done) => {
    const donneesHomologation = {
      id: '123',
      descriptionService: { nomService: 'nom' },
    };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      }
    );
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    const roles = new RolesResponsabilites({
      autoriteHomologation: 'Jean Dupont',
    });
    depot
      .ajouteRolesResponsabilitesAHomologation('123', roles)
      .then(() => depot.homologation('123'))
      .then(({ rolesResponsabilites }) => {
        expect(rolesResponsabilites.autoriteHomologation).to.equal(
          'Jean Dupont'
        );
        done();
      })
      .catch(done);
  });

  describe('concernant les risques généraux', () => {
    let valideRisque;

    before(() => {
      valideRisque = RisqueGeneral.valide;
      RisqueGeneral.valide = () => {};
    });

    after(() => (RisqueGeneral.valide = valideRisque));

    it('sait associer un risque général à une homologation', (done) => {
      RisqueGeneral.valide = () => {};

      const donneesHomologation = {
        id: '123',
        descriptionService: { nomService: 'nom' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologation)],
          services: [copie(donneesHomologation)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      const risque = new RisqueGeneral({
        id: 'unRisque',
        commentaire: 'Un commentaire',
      });
      depot
        .ajouteRisqueGeneralAHomologation('123', risque)
        .then(() => depot.homologation('123'))
        .then(({ risques }) => {
          expect(risques.risquesGeneraux.nombre()).to.equal(1);
          expect(risques.risquesGeneraux.item(0)).to.be.a(RisqueGeneral);
          expect(risques.risquesGeneraux.item(0).id).to.equal('unRisque');
          done();
        })
        .catch(done);
    });
  });

  it('sait associer un risque spécifique à une homologation', (done) => {
    const donneesHomologation = {
      id: '123',
      descriptionService: { nomService: 'nom' },
    };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      }
    );
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    const risque = new RisquesSpecifiques({
      risquesSpecifiques: [{ description: 'Un risque' }],
    });
    depot
      .remplaceRisquesSpecifiquesPourHomologation('123', risque)
      .then(() => depot.homologation('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un risque');
        done();
      })
      .catch(done);
  });

  it('supprime les risques spécifiques précédemment associés', (done) => {
    const donneesHomologations = {
      id: '123',
      descriptionService: { nomService: 'nom' },
      risquesSpecifiques: [{ description: 'Un ancien risque' }],
    };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur(
      {
        homologations: [copie(donneesHomologations)],
        services: [copie(donneesHomologations)],
      }
    );
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    const risques = new RisquesSpecifiques({
      risquesSpecifiques: [{ description: 'Un nouveau risque' }],
    });
    depot
      .remplaceRisquesSpecifiquesPourHomologation('123', risques)
      .then(() => depot.homologation('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal(
          'Un nouveau risque'
        );
        done();
      })
      .catch(done);
  });

  describe("quand il reçoit une demande d'enregistrement d'un nouveau service", () => {
    let adaptateurChiffrement;
    let adaptateurJournalMSS;
    let adaptateurPersistance;
    let adaptateurTracking;
    let adaptateurUUID;
    let depot;
    let referentiel;

    beforeEach(() => {
      adaptateurChiffrement = fauxAdaptateurChiffrement();
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [],
        services: [],
        autorisations: [],
      });
      adaptateurTracking = unAdaptateurTracking().construis();
      adaptateurUUID = { genereUUID: () => 'unUUID' };
      referentiel = Referentiel.creeReferentielVide();

      depot = DepotDonneesHomologations.creeDepot({
        adaptateurChiffrement,
        adaptateurJournalMSS,
        adaptateurPersistance,
        adaptateurTracking,
        adaptateurUUID,
        referentiel,
      });
    });

    it('ajoute le nouveau service au dépôt', (done) => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot
        .homologations('123')
        .then((homologations) => expect(homologations.length).to.equal(0))
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() => depot.homologations('123'))
        .then((services) => {
          expect(services.length).to.equal(1);
          expect(services[0].nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it('génère un UUID pour le service créée', (done) => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot
        .nouveauService('123', { descriptionService })
        .then((idService) =>
          expect(idService).to.equal('11111111-1111-1111-1111-111111111111')
        )
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations[0].id).to.equal(
            '11111111-1111-1111-1111-111111111111'
          );
          done();
        })
        .catch(done);
    });

    it('chiffre les données métier avant de les stocker', (done) => {
      let donneesPersistees;

      const persistanceReelle = adaptateurPersistance.sauvegardeHomologation;
      adaptateurPersistance.sauvegardeHomologation = (id, donnees) => {
        donneesPersistees = donnees;
        return persistanceReelle(id, donnees);
      };

      adaptateurChiffrement.chiffre = (chaine) => `${chaine} - chiffré`;

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Service A')
        .deLOrganisation('ANSSI')
        .avecPresentation('Le service fait A & B')
        .accessiblePar('https://site.fr', 'https://autre.site.fr')
        .construis()
        .donneesSerialisees();

      depot
        .nouveauService('123', { descriptionService })
        .then(() => {
          const {
            nomService,
            organisationsResponsables,
            presentation,
            pointsAcces,
          } = donneesPersistees.descriptionService;

          expect(nomService).to.equal('Service A - chiffré');
          expect(organisationsResponsables).to.eql(['ANSSI - chiffré']);
          expect(presentation).to.eql('Le service fait A & B - chiffré');
          expect(pointsAcces).to.eql([
            { description: 'https://site.fr - chiffré' },
            { description: 'https://autre.site.fr - chiffré' },
          ]);
          done();
        })
        .catch(done);
    });

    it('ajoute en copie un nouveau service au dépôt', (done) => {
      const depotDonneesServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot
        .nouveauService('123', { descriptionService })
        .then((idService) => depotDonneesServices.service(idService))
        .then((service) => {
          expect(service.nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("déclare un accès en écriture entre l'utilisateur et le service", (done) => {
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance,
      });
      const descriptionService = uneDescriptionValide(referentiel)
        .construis()
        .toJSON();

      depotAutorisations
        .autorisations('123')
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() => depotAutorisations.autorisations('123'))
        .then((as) => {
          expect(as.length).to.equal(1);
          const autorisation = as[0];
          expect(autorisation.estProprietaire).to.be(true);
          expect(autorisation.idHomologation).to.equal('unUUID');
          expect(autorisation.idService).to.equal('unUUID');
          expect(autorisation.idUtilisateur).to.equal('123');
          expect(autorisation.droits).to.eql({
            [DECRIRE]: ECRITURE,
            [SECURISER]: ECRITURE,
            [HOMOLOGUER]: ECRITURE,
            [RISQUES]: ECRITURE,
            [CONTACTS]: ECRITURE,
          });
          done();
        })
        .catch(done);
    });

    describe("le journal MSS est utilisé pour consigner l'enregistrement", () => {
      let descriptionService;

      const verifieRecuEvenementDeType = (typeAttendu, evenements) =>
        expect(evenements.map((e) => e.type)).to.contain(typeAttendu);

      beforeEach(
        () =>
          (descriptionService = uneDescriptionValide(referentiel)
            .construis()
            .toJSON())
      );

      it('avec un événement typé signalant le nouveau service créé', (done) => {
        const evenements = [];
        adaptateurJournalMSS.consigneEvenement = (evenement) => {
          evenements.push(evenement);
        };

        depot
          .nouveauService('123', { descriptionService })
          .then(() =>
            verifieRecuEvenementDeType('NOUVEAU_SERVICE_CREE', evenements)
          )
          .then(() => done())
          .catch(done);
      });

      it('avec un événement typé signalant une modification de complétude', (done) => {
        const evenements = [];
        adaptateurJournalMSS.consigneEvenement = (evenement) => {
          evenements.push(evenement);
        };

        depot
          .nouveauService('123', { descriptionService })
          .then(() =>
            verifieRecuEvenementDeType(
              'COMPLETUDE_SERVICE_MODIFIEE',
              evenements
            )
          )
          .then(() => done())
          .catch(done);
      });
    });

    it("l'adaptateur de tracking est utilisé pour envoyer un événement de création de service", async () => {
      let donneesPassees = {};
      adaptateurTracking = unAdaptateurTracking()
        .avecEnvoiTrackingNouveauServiceCree(
          (destinataire, donneesEvenement) => {
            donneesPassees = { destinataire, donneesEvenement };
          }
        )
        .construis();
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Un autre service')
        .construis()
        .toJSON();
      const utilisateur = unUtilisateur().avecId('456').donnees;
      const unServiceExistant = unService(referentiel).avecId('123').donnees;
      const uneAutorisationExistante = uneAutorisation().deCreateurDeService(
        utilisateur.id,
        unServiceExistant.id
      ).donnees;
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUneAutorisation(uneAutorisationExistante)
        .ajouteUnService(unServiceExistant)
        .ajouteUnUtilisateur(utilisateur);
      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecAdaptateurTracking(adaptateurTracking)
        .avecReferentiel(referentiel)
        .construis();

      await depot.nouveauService(utilisateur.id, { descriptionService });

      expect(donneesPassees).to.eql({
        destinataire: 'jean.dujardin@beta.gouv.com',
        donneesEvenement: {
          nombreServices: 2,
        },
      });
    });

    it("l'adaptateur de tracking est utilisé pour envoyer la completude lors de la création d'un service", async () => {
      let donneesPassees = {};
      adaptateurTracking = unAdaptateurTracking()
        .avecEnvoiTrackingCompletude((destinataire, donneesEvenement) => {
          donneesPassees = { destinataire, donneesEvenement };
        })
        .construis();
      const serviceTracking = {
        completudeDesServicesPourUtilisateur: async () => ({
          nombreServices: 2,
          nombreMoyenContributeurs: 3,
          tauxCompletudeMoyenTousServices: 12,
        }),
      };
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Un autre service')
        .construis()
        .toJSON();
      const utilisateur = unUtilisateur().avecId('456').donnees;
      adaptateurPersistance =
        unePersistanceMemoire().ajouteUnUtilisateur(utilisateur);
      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecAdaptateurTracking(adaptateurTracking)
        .avecServiceTracking(serviceTracking)
        .avecReferentiel(referentiel)
        .construis();

      await depot.nouveauService(utilisateur.id, { descriptionService });

      expect(donneesPassees).to.eql({
        destinataire: 'jean.dujardin@beta.gouv.com',
        donneesEvenement: {
          nombreServices: 2,
          nombreMoyenContributeurs: 3,
          tauxCompletudeMoyenTousServices: 12,
        },
      });
    });

    it('lève une exception si une propriété obligatoire de la description du service est manquante', (done) => {
      const donneesDescriptionServiceIncompletes = uneDescriptionValide(
        referentiel
      )
        .avecNomService('')
        .construis()
        .toJSON();

      depot
        .nouveauService('123', {
          descriptionService: donneesDescriptionServiceIncompletes,
        })
        .then(() =>
          done("La création de l'homologation aurait dû lever une exception")
        )
        .catch((e) => expect(e).to.be.an(ErreurDonneesObligatoiresManquantes))
        .then(() => done())
        .catch(done);
    });

    it('lève une exception si le nom du service existe déjà pour une autre homologation', (done) => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Nom service')
        .construis()
        .toJSON();

      depot
        .nouveauService('123', { descriptionService })
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() =>
          done('La création du service aurait dû lever une exception')
        )
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceDejaExistant);
          expect(e.message).to.equal(
            'Le nom du service "Nom service" existe déjà pour une autre homologation'
          );
          done();
        })
        .catch(done);
    });
  });

  describe('sur vérification existence homologation avec un nom de service donné', () => {
    it('détecte existence homologation', (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
          homologations: [
            {
              id: '789',
              descriptionService: { nomService: 'Un service existant' },
            },
          ],
          autorisations: [
            uneAutorisation().deCreateurDeService('123', '789').donnees,
          ],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .homologationExiste('123', 'Un nom de service')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => depot.homologationExiste('123', 'Un service existant'))
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("ne considère que les homologations de l'utilisateur donné", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: '123', email: 'jean.dupont@mail.fr' },
            { id: '456', email: 'sylvie.martin@mail.fr' },
          ],
          homologations: [
            {
              id: '789',
              idUtilisateur: '123',
              descriptionService: { nomService: 'Un service existant' },
            },
          ],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .homologationExiste('456', 'Un service existant')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => done())
        .catch(done);
    });

    it("ne considère pas l'homologation en cours de mise à jour", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
          homologations: [
            {
              id: '888',
              descriptionService: { nomService: 'Un service existant' },
            },
            {
              id: '999',
              descriptionService: { nomService: 'Un nom de service' },
            },
          ],
          autorisations: [
            uneAutorisation().deCreateurDeService('123', '888').donnees,
            uneAutorisation().deCreateurDeService('123', '999').donnees,
          ],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .homologationExiste('123', 'Un service existant', '888')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() =>
          depot.homologationExiste('123', 'Un service existant', '999')
        )
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de suppression d'une homologation", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;

    beforeEach(() => {
      const donneesHomologation = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
        autorisations: [
          uneAutorisation().avecId('456').deCreateurDeService('999', '123')
            .donnees,
        ],
      });

      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    });

    it("supprime l'homologation", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });

      adaptateurPersistance
        .homologation('123')
        .then((h) => expect(h).to.be.an(Object))
        .then(() => depot.supprimeHomologation('123'))
        .then(() => adaptateurPersistance.homologation('123'))
        .then((h) => {
          expect(h).to.be(undefined);
          done();
        })
        .catch(done);
    });

    it('supprime le service', (done) => {
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });

      adaptateurPersistance
        .service('123')
        .then((s) => expect(s).to.be.an(Object))
        .then(() => depot.supprimeHomologation('123'))
        .then(() => adaptateurPersistance.service('123'))
        .then((s) => {
          expect(s).to.be(undefined);
          done();
        })
        .catch(done);
    });

    it('supprime les autorisations associées', (done) => {
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'contributeur@mail.fr' },
        ],
        homologations: [
          { id: '111', descriptionService: { nomService: 'Un service' } },
          { id: '222', descriptionService: { nomService: 'Un autre service' } },
        ],
        autorisations: [
          uneAutorisation().avecId('123').deCreateurDeService('999', '111')
            .donnees,
          uneAutorisation().avecId('456').deContributeurDeService('000', '111')
            .donnees,
          uneAutorisation().avecId('789').deContributeurDeService('000', '222')
            .donnees,
        ],
      });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .supprimeHomologation('111')
        .then(() => depotAutorisations.autorisations('999'))
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depotAutorisations.autorisations('000'))
        .then((as) => expect(as.length).to.equal(1))
        .then(() => depotAutorisations.autorisation('789'))
        .then((a) => expect(a).to.be.ok())
        .then(() => done())
        .catch(done);
    });

    it('consigne un événement de service supprimé', (done) => {
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        expect(evenement.type).to.be('SERVICE_SUPPRIME');
        done();
      };

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });

      depot.supprimeHomologation('111').catch(done);
    });
  });

  describe("sur demande d'ajout d'un dossier courant si nécessaire", () => {
    let adaptateurUUID;

    beforeEach(() => (adaptateurUUID = { genereUUID: () => 'un UUID' }));

    it('ne fait rien si un dossier courant existe déjà', (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [{ id: '999' }],
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.homologation('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it("ajoute le dossier s'il n'existe pas déjà", (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.homologation('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it('associe un UUID au dossier créé', (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      adaptateurUUID.genereUUID = () => '999';
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.homologation('123'))
        .then((h) => expect(h.dossiers.item(0).id).to.equal('999'))
        .then(() => done())
        .catch(done);
    });

    it("lève une exception si l'homologation n'existe pas", (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      depot
        .ajouteDossierCourantSiNecessaire('999')
        .then(() =>
          done("La tentative d'ajout de dossier aurait dû lever une exception")
        )
        .catch((e) => {
          expect(e).to.be.an(ErreurServiceInexistant);
          expect(e.message).to.equal('Homologation "999" non trouvée');
          done();
        })
        .catch(done);
    });
  });

  describe("sur demande d'enregistrement du dossier courant", () => {
    let adaptateurUUID;
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { sixMois: {}, unAn: {} },
    });

    beforeEach(() => (adaptateurUUID = { genereUUID: () => 'un UUID' }));

    it('enregistre le dossier courant', (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });
      const dossier = new Dossier(
        {
          id: '999',
          decision: {
            dateHomologation: '2022-11-30',
            dureeValidite: 'sixMois',
          },
        },
        referentiel
      );

      depot
        .enregistreDossier('123', dossier)
        .then(() => depot.homologation('123'))
        .then((h) => {
          expect(h.nombreDossiers()).to.equal(1);
          const dossierCourant = h.dossierCourant();
          expect(dossierCourant.decision.dateHomologation).to.equal(
            '2022-11-30'
          );
          expect(dossierCourant.decision.dureeValidite).to.equal('sixMois');
          done();
        })
        .catch(done);
    });

    it("n'écrase pas les autres dossiers si l'ID est différent", (done) => {
      const donneesHomologations = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [{ id: '888', finalise: true }],
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologations)],
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });
      const dossier = new Dossier({ id: '999' }, referentiel);

      depot
        .enregistreDossier('123', dossier)
        .then(() => depot.homologation('123'))
        .then((h) => {
          expect(h.nombreDossiers()).to.equal(2);
          expect(h.dossiers.item(0).id).to.equal('888');
          expect(h.dossiers.item(1).id).to.equal('999');
          done();
        })
        .catch(done);
    });

    it('écrase les données déjà stockées avec les nouvelles données', (done) => {
      const decision = {
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      };
      const donneesDossierAvecDecision = { id: '999', decision };
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [donneesDossierAvecDecision],
      };

      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesService)],
          services: [copie(donneesService)],
        });
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });

      const autorite = { nom: 'Jean', fonction: 'RSSI' };
      const seulementAutorite = new Dossier(
        { autorite, id: '999' },
        referentiel
      );
      depot
        .enregistreDossier('123', seulementAutorite)
        .then(() => depot.homologation('123'))
        .then((h) => {
          const donneesDossierCourant = h.dossierCourant().toJSON();
          expect(donneesDossierCourant.autorite).to.eql(autorite);
          expect(donneesDossierCourant.decision).to.eql({});
          done();
        })
        .catch(done);
    });
  });

  describe('sur demande de finalisation du dossier courant', () => {
    let adaptateurJournalMSS;
    let adaptateurPersistance;
    let depot;
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { sixMois: { nbMoisDecalage: 6 }, unAn: {} },
      statutsAvisDossierHomologation: { favorable: {} },
    });

    beforeEach(() => {
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      adaptateurPersistance = unePersistanceMemoire().construis();
      depot = DepotDonneesHomologations.creeDepot({
        adaptateurJournalMSS,
        adaptateurPersistance,
        referentiel,
      });
    });

    it('finalise le dossier courant', async () => {
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom')
        .avecDossiers([
          unDossier(referentiel)
            .quiEstComplet()
            .quiEstNonFinalise()
            .avecDecision('2022-11-30', 'sixMois').donnees,
        ])
        .construis();
      expect(service.dossiers.items[0].finalise).to.be(false);

      await depot.finaliseDossierCourant(service);

      expect(service.dossiers.items[0].finalise).to.be(true);
    });

    it('enregistre le service', async () => {
      let donneesPassees = {};
      adaptateurPersistance.sauvegardeHomologation = async (id, donnees) => {
        donneesPassees = { id, donnees };
      };
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom')
        .avecDossiers([
          unDossier(referentiel)
            .quiEstComplet()
            .quiEstNonFinalise()
            .avecDecision('2022-11-30', 'sixMois').donnees,
        ])
        .construis();

      await depot.finaliseDossierCourant(service);

      service.donneesAPersister().toutes();
      const { id, ...donnees } = service.donneesAPersister().toutes();
      expect(donneesPassees.id).to.equal('123');
      expect(donneesPassees.donnees).to.eql(donnees);
    });

    it('consigne un événement « Nouvelle homologation créée » dans le journal MSS', async () => {
      let evenementPasse = {};
      adaptateurJournalMSS.consigneEvenement = async (evenement) => {
        evenementPasse = evenement;
      };
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom')
        .avecDossiers([
          unDossier(referentiel)
            .quiEstComplet()
            .quiEstNonFinalise()
            .avecDecision('2022-11-30', 'sixMois').donnees,
        ])
        .construis();

      await depot.finaliseDossierCourant(service);

      expect(evenementPasse.type).to.equal('NOUVELLE_HOMOLOGATION_CREEE');
      expect(evenementPasse.donnees.dateHomologation).to.equal('2022-11-30');
      expect(evenementPasse.donnees.dureeHomologationMois).to.equal(6);
    });
  });

  describe('sur demande de suppression des homologations créées par un utilisateur', () => {
    it("supprime les homologations dont l'utilisateur est le créateur", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: 'ABC', email: 'jean.dupont@mail.fr' }],
          homologations: [
            { id: '123', descriptionService: { nomService: 'Un service' } },
          ],
          autorisations: [
            uneAutorisation().avecId('456').deCreateurDeService('ABC', '123')
              .donnees,
          ],
        });
      const adaptateurJournalMSS =
        AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });

      adaptateurPersistance
        .homologation('123')
        .then((h) => expect(h).to.be.an(Object))
        .then(() => depot.supprimeHomologationsCreeesPar('ABC'))
        .then(() => adaptateurPersistance.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("ne supprime pas les homologations où l'utilisateur est contributeur", (done) => {
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: 'ABC', email: 'jean.dupont@mail.fr' },
            { id: 'DEF', email: 'martin.dujardin@mail.fr' },
          ],
          homologations: [
            { id: '123', descriptionService: { nomService: 'Un service' } },
          ],
          autorisations: [
            uneAutorisation().avecId('a').deCreateurDeService('ABC', '123')
              .donnees,
            uneAutorisation().avecId('b').deContributeurDeService('DEF', '123')
              .donnees,
          ],
        });

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
      });

      adaptateurPersistance
        .homologation('123')
        .then((h) => expect(h).to.be.an(Object))
        .then(() => depot.supprimeHomologationsCreeesPar('DEF'))
        .then(() => adaptateurPersistance.homologation('123'))
        .then((h) => expect(h).to.be.an(Object))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de duplication d'une homologation", () => {
    let depot;

    beforeEach(() => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Service à dupliquer')
        .construis()
        .toJSON();

      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
          homologations: [{ id: '123-1', descriptionService }],
          services: [{ id: '123-1', descriptionService }],
          autorisations: [
            uneAutorisation().deCreateurDeService('123', '123-1').donnees,
          ],
        });

      depot = DepotDonneesHomologations.creeDepot({
        adaptateurJournalMSS: AdaptateurJournalMSSMemoire.nouvelAdaptateur(),
        adaptateurPersistance,
        adaptateurTracking: unAdaptateurTracking().construis(),
        adaptateurUUID: AdaptateurUUID,
        referentiel,
      });
    });

    it("reste robuste quand l'homologation n'est pas trouvée", (done) => {
      depot
        .dupliqueHomologation('id-invalide')
        .then(() =>
          done('La tentative de duplication aurait dû lever une exception')
        )
        .catch((e) => {
          expect(e).to.be.an(ErreurServiceInexistant);
          expect(e.message).to.equal('Service "id-invalide" non trouvé');
          done();
        })
        .catch(done);
    });

    it('peut dupliquer une homologation à partir de son identifiant', (done) => {
      depot
        .dupliqueHomologation('123-1')
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations.length).to.equal(2);
          done();
        })
        .catch(done);
    });

    it("utilise un nom disponible pour l'homologation dupliquée", (done) => {
      depot
        .dupliqueHomologation('123-1')
        .then(() => depot.dupliqueHomologation('123-1'))
        .then(() => depot.homologations('123'))
        .then(([_, h2, h3]) => {
          expect(h2.nomService()).to.equal('Service à dupliquer - Copie 1');
          expect(h3.nomService()).to.equal('Service à dupliquer - Copie 2');
          done();
        })
        .catch(done);
    });
  });

  describe("sur une demande d'un index de copie disponible pour une homologation à dupliquer", () => {
    it("utilise l'index 1 si disponible", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('A')
        .construis()
        .toJSON();
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
          homologations: [{ id: '123', descriptionService }],
          autorisations: [
            uneAutorisation().deCreateurDeService('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot
        .trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it("incrémente l'index si nécessaire", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const copie1 = uneDescriptionValide(referentiel)
        .avecNomService('A - UnSuffixe 1')
        .construis()
        .toJSON();
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
          homologations: [{ id: '123', descriptionService: copie1 }],
          autorisations: [
            uneAutorisation().deCreateurDeService('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot
        .trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(2))
        .then(() => done())
        .catch(done);
    });

    it("incrémente l'index le plus élevé", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const original = uneDescriptionValide(referentiel)
        .avecNomService('A')
        .construis()
        .toJSON();
      const duplication = uneDescriptionValide(referentiel)
        .avecNomService('A - UnSuffixe 2')
        .construis()
        .toJSON();
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
          homologations: [
            { id: '123', descriptionService: original },
            { id: '456', descriptionService: duplication },
          ],
          autorisations: [
            uneAutorisation().deCreateurDeService('999', '123').donnees,
            uneAutorisation().deCreateurDeService('999', '456').donnees,
          ],
        });

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot
        .trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(3))
        .then(() => done())
        .catch(done);
    });

    it("sait extraire l'index disponible même dans des noms contenant des parenthèses", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const original = uneDescriptionValide(referentiel)
        .avecNomService('Service A (mairie) - Copie 1')
        .construis()
        .toJSON();
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
          homologations: [{ id: '123', descriptionService: original }],
          autorisations: [
            uneAutorisation().deCreateurDeService('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot
        .trouveIndexDisponible('999', 'Service A (mairie) - Copie')
        .then((index) => expect(index).to.equal(2))
        .then(() => done())
        .catch(done);
    });
  });
});
