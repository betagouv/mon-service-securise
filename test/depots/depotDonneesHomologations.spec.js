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

const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesServices = require('../../src/depots/depotDonneesHomologations');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesServices');

const AutorisationCreateur = require('../../src/modeles/autorisations/autorisationCreateur');
const AvisExpertCyber = require('../../src/modeles/avisExpertCyber');
const Dossier = require('../../src/modeles/dossier');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');
const RolesResponsabilites = require('../../src/modeles/rolesResponsabilites');
const Service = require('../../src/modeles/service');

const copie = require('../../src/utilitaires/copie');

describe('Le dépôt de données des services', () => {
  it("connaît toutes les services d'un utilisateur donné", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      services: [
        { id: '123', descriptionService: { nomService: 'Super Service' } },
        { id: '789', descriptionService: { nomService: 'Autre service' } },
      ],
      utilisateurs: [
        { id: '456', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
      ],
      autorisations: [
        { idUtilisateur: '456', idService: '123', type: 'createur' },
        { idUtilisateur: '999', idService: '789', type: 'createur' },
      ],
    });

    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, referentiel });
    depot.services('456')
      .then((services) => {
        expect(services.length).to.equal(1);
        expect(services[0]).to.be.a(Service);
        expect(services[0].id).to.equal('123');
        expect(services[0].referentiel).to.equal(referentiel);

        expect(services[0].createur).to.be.ok();
        expect(services[0].createur.id).to.equal('456');
        done();
      })
      .catch(done);
  });

  it("utilise l'adaptateur de persistance sans `idUtilisateur` pour récupérer tous les services du système", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur();
    adaptateurPersistance.services = (idUtilisateur) => {
      expect(idUtilisateur).to.be(undefined);
      done();
    };

    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    depot.tousServices();
  });

  it('trie les services par ordre alphabétique du nom du service', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      services: [
        { id: '123', descriptionService: { nomService: 'B-service' } },
        { id: '456', descriptionService: { nomService: 'C-service' } },
        { id: '789', descriptionService: { nomService: 'A-service' } },
      ],
      utilisateurs: [
        { id: '999', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
      ],
      autorisations: [
        { idUtilisateur: '999', idService: '123', type: 'createur' },
        { idUtilisateur: '999', idService: '456', type: 'createur' },
        { idUtilisateur: '999', idService: '789', type: 'createur' },
      ],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    depot.services('999')
      .then((hs) => {
        expect(hs.length).to.equal(3);
        expect(hs[0].nomService()).to.equal('A-service');
        expect(hs[1].nomService()).to.equal('B-service');
        expect(hs[2].nomService()).to.equal('C-service');
        done();
      })
      .catch(done);
  });

  it('peut retrouver un service à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      services: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
    });
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, referentiel });

    depot.service('789')
      .then((service) => {
        expect(service).to.be.a(Service);
        expect(service.id).to.equal('789');
        expect(service.referentiel).to.equal(referentiel);
        done();
      })
      .catch(done);
  });

  it('associe ses contributeurs au service', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '111', email: 'createur@mail.fr' }, { id: '999', email: 'contributeur@mail.fr' }],
      services: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
      autorisations: [
        { idService: '789', idUtilisateur: '111', type: 'createur' },
        { idService: '789', idUtilisateur: '999', type: 'contributeur' },
      ],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    depot.service('789')
      .then((service) => {
        const { contributeurs } = service;
        expect(contributeurs.length).to.equal(1);
        expect(contributeurs[0].id).to.equal('999');
        done();
      })
      .catch(done);
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
      const donneesService = { id: '123', descriptionService: { nomService: 'nom' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance, adaptateurJournalMSS, referentiel,
      });
    });

    it('associe les mesures générales au service', (done) => {
      const generale = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT }, referentiel);

      depot.ajouteMesuresAService('123', [generale], new MesuresSpecifiques())
        .then(() => depot.service('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
          done();
        })
        .catch(done);
    });

    it("associe les mesures générales à l'homologation", (done) => {
      const config = { adaptateurPersistance, referentiel };
      const depotHomologations = DepotDonneesHomologations.creeDepot(config);
      const generale = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT }, referentiel);

      depot.ajouteMesuresAService('123', [generale], new MesuresSpecifiques())
        .then(() => depotHomologations.homologation('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
          done();
        })
        .catch(done);
    });

    it('met à jour les données de la mesure générale si elle est déjà associée au service', (done) => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'nom' },
        mesuresGenerales: [{ id: 'identifiantMesure', statut: MesureGenerale.STATUT_EN_COURS }],
      };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance, adaptateurJournalMSS, referentiel,
      });

      const generale = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT }, referentiel);

      depot.ajouteMesuresAService('123', [generale], new MesuresSpecifiques())
        .then(() => depot.service('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).statut).to.equal(MesureGenerale.STATUT_FAIT);
          done();
        })
        .catch(done);
    });

    it('associe les mesures spécifiques au service', (done) => {
      const generales = [];
      const specifiques = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });

      depot.ajouteMesuresAService('123', generales, specifiques)
        .then(() => depot.service('123'))
        .then(({ mesures: { mesuresSpecifiques } }) => {
          expect(mesuresSpecifiques.nombre()).to.equal(1);
          expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
          expect(mesuresSpecifiques.item(0).description).to.equal('Une mesure spécifique');
          done();
        })
        .catch(done);
    });

    it("associe les mesures spécifiques à l'homologation", (done) => {
      const depotServices = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const generales = [];
      const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });

      depot.ajouteMesuresAService('123', generales, mesures)
        .then(() => depotServices.homologation('123'))
        .then(({ mesures: { mesuresSpecifiques } }) => {
          expect(mesuresSpecifiques.nombre()).to.equal(1);
          expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
          expect(mesuresSpecifiques.item(0).description).to.equal('Une mesure spécifique');
          done();
        })
        .catch(done);
    });

    it('consigne un événement de changement de complétude du service', (done) => {
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        expect(evenement.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
        done();
      };
      const generales = [];
      const specifiques = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });

      depot.ajouteMesuresAService('123', generales, specifiques).catch(done);
    });
  });

  it('renseigne les mesures générales associées à un service', (done) => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { identifiantMesure: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['identifiantMesure'] },
    });

    const donneesService = {
      id: '123',
      descriptionService: { nomService: 'Un service' },
      mesuresGenerales: [{ id: 'identifiantMesure', statut: 'fait' }],
    };

    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesService)],
      services: [copie(donneesService)],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, referentiel });

    depot.service('123')
      .then(({ mesures: { mesuresGenerales } }) => {
        expect(mesuresGenerales.nombre()).to.equal(1);

        const mesure = mesuresGenerales.item(0);
        expect(mesure).to.be.a(MesureGenerale);
        expect(mesure.id).to.equal('identifiantMesure');
        done();
      })
      .catch(done);
  });

  describe("sur demande de mise à jour de la description du service d'un service", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;
    let depot;
    let referentiel;

    beforeEach(() => {
      const donneesService = { id: '123', descriptionService: { nomService: 'Super Service', presentation: 'Une présentation' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        autorisations: [{ idUtilisateur: '999', idService: '123', type: 'createur' }],
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      referentiel = Referentiel.creeReferentielVide();

      depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
        referentiel,
      });
    });

    it("met à jour la description du service d'un service", (done) => {
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      depot.ajouteDescriptionServiceAService('999', '123', description)
        .then(() => depot.service('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it("met à jour la description de service dans l'objet métier homologation", (done) => {
      const depotHomologations = DepotDonneesHomologations.creeDepot(
        { adaptateurPersistance, referentiel }
      );
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      depot.ajouteDescriptionServiceAService('999', '123', description)
        .then(() => depotHomologations.homologation('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it('lève une exception si des propriétés obligatoires ne sont pas renseignées', (done) => {
      const descriptionIncomplete = uneDescriptionValide(referentiel)
        .avecNomService('')
        .construis();

      depot.ajouteDescriptionServiceAService('999', '123', descriptionIncomplete)
        .then(() => done(
          'La mise à jour de la description du service aurait dû lever une exception'
        ))
        .catch((e) => {
          expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
          expect(e.message).to.equal('Certaines données obligatoires ne sont pas renseignées');
          done();
        })
        .catch(done);
    });

    it('ne détecte pas de doublon sur le nom de service pour le service en cours de mise à jour', (done) => {
      const description = uneDescriptionValide(referentiel)
        .avecPresentation('Une autre présentation')
        .construis();

      depot.ajouteDescriptionServiceAService('999', '123', description)
        .then(() => depot.service('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.presentation).to.equal('Une autre présentation');
          done();
        })
        .catch(done);
    });

    it('consigne un événement de changement de complétude du service', (done) => {
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        expect(evenement.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
        done();
      };

      const description = uneDescriptionValide(referentiel)
        .construis();
      depot.ajouteDescriptionServiceAService('999', '123', description)
        .catch(done);
    });
  });

  it('sait associer des rôles et responsabilités à un service', (done) => {
    const donneesService = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesService)],
      services: [copie(donneesService)],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    const roles = new RolesResponsabilites({ autoriteHomologation: 'Jean Dupont' });
    depot.ajouteRolesResponsabilitesAService('123', roles)
      .then(() => depot.service('123'))
      .then(({ rolesResponsabilites }) => {
        expect(rolesResponsabilites.autoriteHomologation).to.equal('Jean Dupont');
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

    it('sait associer un risque général à un service', (done) => {
      RisqueGeneral.valide = () => {};

      const donneesService = { id: '123', descriptionService: { nomService: 'nom' } };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      const risque = new RisqueGeneral({ id: 'unRisque', commentaire: 'Un commentaire' });
      depot.ajouteRisqueGeneralAService('123', risque)
        .then(() => depot.service('123'))
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
    const donneesService = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesService)],
      services: [copie(donneesService)],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    const risque = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un risque' }] });
    depot.remplaceRisquesSpecifiquesPourService('123', risque)
      .then(() => depot.service('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un risque');
        done();
      })
      .catch(done);
  });

  it('supprime les risques spécifiques précédemment associés', (done) => {
    const donneesServices = {
      id: '123',
      descriptionService: { nomService: 'nom' },
      risquesSpecifiques: [{ description: 'Un ancien risque' }],
    };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesServices)],
      services: [copie(donneesServices)],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    const risques = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un nouveau risque' }] });
    depot.remplaceRisquesSpecifiquesPourService('123', risques)
      .then(() => depot.service('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un nouveau risque');
        done();
      })
      .catch(done);
  });

  it("sait associer un avis d'expert cyber à un service", (done) => {
    const donneesService = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesService)],
      services: [copie(donneesService)],
    });
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.FAVORABLE });
    depot.ajouteAvisExpertCyberAService('123', avisExpert)
      .then(() => depot.service('123'))
      .then(({ avisExpertCyber }) => {
        expect(avisExpertCyber.favorable()).to.be(true);
        done();
      })
      .catch(done);
  });

  describe("quand il reçoit une demande d'enregistrement d'un nouveau service", () => {
    let adaptateurJournalMSS;
    let adaptateurPersistance;
    let adaptateurUUID;
    let depot;
    let referentiel;

    beforeEach(() => {
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [],
        services: [],
        autorisations: [],
      });
      adaptateurUUID = { genereUUID: () => 'unUUID' };
      referentiel = Referentiel.creeReferentielVide();

      depot = DepotDonneesServices.creeDepot({
        adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel,
      });
    });

    it('ajoute le nouveau service au dépôt', (done) => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot.services('123')
        .then((services) => expect(services.length).to.equal(0))
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() => depot.services('123'))
        .then((services) => {
          expect(services.length).to.equal(1);
          expect(services[0].nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it('génère un UUID pour le service créé', (done) => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot.nouveauService('123', { descriptionService })
        .then((idService) => expect(idService).to.equal(
          '11111111-1111-1111-1111-111111111111'
        ))
        .then(() => depot.services('123'))
        .then((services) => {
          expect(services[0].id).to.equal('11111111-1111-1111-1111-111111111111');
          done();
        })
        .catch(done);
    });

    it('ajoute en copie une nouvelle homologation au dépôt', (done) => {
      const depotDonneesHomologations = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      depot.nouveauService('123', { descriptionService })
        .then((idService) => depotDonneesHomologations.homologation(idService))
        .then((homologation) => {
          expect(homologation.nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("déclare un accès entre l'utilisateur et le service", (done) => {
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({ adaptateurPersistance });
      const descriptionService = uneDescriptionValide(referentiel)
        .construis()
        .toJSON();

      depotAutorisations.autorisations('123')
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() => depotAutorisations.autorisations('123'))
        .then((as) => {
          expect(as.length).to.equal(1);
          const autorisation = as[0];
          expect(autorisation).to.be.an(AutorisationCreateur);
          expect(autorisation.idHomologation).to.equal('unUUID');
          expect(autorisation.idService).to.equal('unUUID');
          expect(autorisation.idUtilisateur).to.equal('123');
          done();
        })
        .catch(done);
    });

    describe("le journal MSS est utilisé pour consigner l'enregistrement", () => {
      let descriptionService;

      const verifieRecuEvenementDeType = (typeAttendu, evenements) => (
        expect(evenements.map((e) => e.type)).to.contain(typeAttendu)
      );

      beforeEach(() => (
        descriptionService = uneDescriptionValide(referentiel)
          .construis()
          .toJSON()
      ));

      it('avec un événement typé signalant le nouveau service créé', (done) => {
        const evenements = [];
        adaptateurJournalMSS.consigneEvenement = (evenement) => {
          evenements.push(evenement);
        };

        depot.nouveauService('123', { descriptionService })
          .then(() => verifieRecuEvenementDeType('NOUVEAU_SERVICE_CREE', evenements))
          .then(() => done())
          .catch(done);
      });

      it('avec un événement typé signalant une modification de complétude', (done) => {
        const evenements = [];
        adaptateurJournalMSS.consigneEvenement = (evenement) => {
          evenements.push(evenement);
        };

        depot.nouveauService('123', { descriptionService })
          .then(() => verifieRecuEvenementDeType('COMPLETUDE_SERVICE_MODIFIEE', evenements))
          .then(() => done())
          .catch(done);
      });
    });

    it('lève une exception si une propriété obligatoire de la description du service est manquante', (done) => {
      const donneesDescriptionServiceIncompletes = uneDescriptionValide(referentiel)
        .avecNomService('')
        .construis()
        .toJSON();

      depot.nouveauService('123', { descriptionService: donneesDescriptionServiceIncompletes })
        .then(() => done('La création du service aurait dû lever une exception'))
        .catch((e) => expect(e).to.be.an(ErreurDonneesObligatoiresManquantes))
        .then(() => done())
        .catch(done);
    });

    it('lève une exception si le nom existe déjà pour un autre service', (done) => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Nom service')
        .construis()
        .toJSON();

      depot.nouveauService('123', { descriptionService })
        .then(() => depot.nouveauService('123', { descriptionService }))
        .then(() => done('La création du service aurait dû lever une exception'))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceDejaExistant);
          expect(e.message).to.equal('Le nom "Nom service" existe déjà pour un autre service');
          done();
        })
        .catch(done);
    });
  });

  describe('sur vérification existence service avec un nom donné', () => {
    it('détecte existence service', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        services: [{
          id: '789', descriptionService: { nomService: 'Un service existant' },
        }],
        autorisations: [{ idUtilisateur: '123', idService: '789', type: 'createur' }],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      depot.serviceExiste('123', 'Un nom de service')
        .then((serviceExiste) => expect(serviceExiste).to.be(false))
        .then(() => depot.serviceExiste('123', 'Un service existant'))
        .then((serviceExiste) => expect(serviceExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("ne considère que les services de l'utilisateur donné", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '123', email: 'jean.dupont@mail.fr' },
          { id: '456', email: 'sylvie.martin@mail.fr' },
        ],
        services: [{
          id: '789', idUtilisateur: '123', descriptionService: { nomService: 'Un service existant' },
        }],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      depot.serviceExiste('456', 'Un service existant')
        .then((serviceExiste) => expect(serviceExiste).to.be(false))
        .then(() => done())
        .catch(done);
    });

    it('ne considère pas le service en cours de mise à jour', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        services: [
          { id: '888', descriptionService: { nomService: 'Un service existant' } },
          { id: '999', descriptionService: { nomService: 'Un nom de service' } },
        ],
        autorisations: [
          { idUtilisateur: '123', idService: '888', type: 'createur' },
          { idUtilisateur: '123', idService: '999', type: 'createur' },
        ],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      depot.serviceExiste('123', 'Un service existant', '888')
        .then((serviceExiste) => expect(serviceExiste).to.be(false))
        .then(() => depot.serviceExiste('123', 'Un service existant', '999'))
        .then((serviceExiste) => expect(serviceExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de suppression d'un service", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;

    beforeEach(() => {
      const donneesService = { id: '123', descriptionService: { nomService: 'Un service' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', idServie: '123', type: 'createur' }],
      });

      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    });

    it('supprime le service', (done) => {
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurJournalMSS },
      );

      adaptateurPersistance.service('123')
        .then((s) => expect(s).to.be.an(Object))
        .then(() => depot.supprimeService('123'))
        .then(() => adaptateurPersistance.service('123'))
        .then((s) => {
          expect(s).to.be(undefined);
          done();
        })
        .catch(done);
    });

    it("supprime l'homologation", (done) => {
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurJournalMSS },
      );

      adaptateurPersistance.homologation('123')
        .then((s) => expect(s).to.be.an(Object))
        .then(() => depot.supprimeService('123'))
        .then(() => adaptateurPersistance.homologation('123'))
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
        services: [
          { id: '111', descriptionService: { nomService: 'Un service' } },
          { id: '222', descriptionService: { nomService: 'Un autre service' } },
        ],
        autorisations: [
          { id: '123', idUtilisateur: '999', idService: '111', type: 'createur' },
          { id: '456', idUtilisateur: '000', idService: '111', type: 'contributeur' },
          { id: '789', idUtilisateur: '000', idService: '222', type: 'contributeur' },
        ],
      });
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurJournalMSS },
      );
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({ adaptateurPersistance });

      depot.supprimeService('111')
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

      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurJournalMSS },
      );

      depot.supprimeService('111')
        .catch(done);
    });
  });

  describe("sur demande d'ajout d'un dossier courant si nécessaire", () => {
    let adaptateurUUID;

    beforeEach(() => (adaptateurUUID = { genereUUID: () => 'un UUID' }));

    it('ne fait rien si un dossier courant existe déjà', (done) => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [{ id: '999' }],
      };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it("ajoute le dossier s'il n'existe pas déjà", (done) => {
      const donneesService = { id: '123', descriptionService: { nomService: 'Un service' } };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it('associe un UUID au dossier créé', (done) => {
      const donneesService = { id: '123', descriptionService: { nomService: 'Un service' } };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      adaptateurUUID.genereUUID = () => '999';
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
        .then((s) => expect(s.dossiers.item(0).id).to.equal('999'))
        .then(() => done())
        .catch(done);
    });

    it("lève une exception si le service n'existe pas", (done) => {
      const donneesService = { id: '123', descriptionService: { nomService: 'Un service' } };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      depot.ajouteDossierCourantSiNecessaire('999')
        .then(() => done("La tentative d'ajout de dossier aurait dû lever une exception"))
        .catch((e) => {
          expect(e).to.be.an(ErreurServiceInexistant);
          expect(e.message).to.equal('Service "999" non trouvée');
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
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });
      const dossier = new Dossier({ id: '999', decision: { dateHomologation: '2022-11-30', dureeValidite: 'sixMois' } }, referentiel);

      depot.enregistreDossierCourant('123', dossier)
        .then(() => depot.service('123'))
        .then((s) => {
          expect(s.nombreDossiers()).to.equal(1);
          const dossierCourant = s.dossierCourant();
          expect(dossierCourant.decision.dateHomologation).to.equal('2022-11-30');
          expect(dossierCourant.decision.dureeValidite).to.equal('sixMois');
          done();
        })
        .catch(done);
    });

    it("n'écrase pas les autres dossiers si l'ID est différent", (done) => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [{ id: '888', finalise: true }],
      };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });
      const dossier = new Dossier({ id: '999' }, referentiel);

      depot.enregistreDossierCourant('123', dossier)
        .then(() => depot.service('123'))
        .then((s) => {
          expect(s.nombreDossiers()).to.equal(2);
          expect(s.dossiers.item(0).id).to.equal('888');
          expect(s.dossiers.item(1).id).to.equal('999');
          done();
        })
        .catch(done);
    });

    it('écrase les données déjà stockées avec les nouvelles données', (done) => {
      const decision = { dateHomologation: '2022-12-01', dureeValidite: 'unAn' };
      const donneesDossierAvecDecision = { id: '999', decision };
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        dossiers: [donneesDossierAvecDecision],
      };

      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurUUID, referentiel }
      );

      const autorite = { nom: 'Jean', fonction: 'RSSI' };
      const seulementAutorite = new Dossier({ autorite, id: '999' }, referentiel);
      depot.enregistreDossierCourant('123', seulementAutorite)
        .then(() => depot.service('123'))
        .then((s) => {
          const donneesDossierCourant = s.dossierCourant().toJSON();
          expect(donneesDossierCourant.autorite).to.eql(autorite);
          expect(donneesDossierCourant.decision).to.eql({});
          done();
        })
        .catch(done);
    });
  });

  describe("sur demande de finalisation d'un dossier", () => {
    let adaptateurJournalMSS;
    let adaptateurPersistance;
    let adaptateurUUID;
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { sixMois: { nbMoisDecalage: 6 }, unAn: {} },
    });

    beforeEach(() => {
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();

      const donneesService = { id: '123', descriptionService: { nomService: 'Un service' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesService)],
        services: [copie(donneesService)],
      });

      adaptateurUUID = { genereUUID: () => 'un UUID' };
    });

    it('enregistre le dossier passé en paramètre', (done) => {
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel }
      );
      const dossier = new Dossier(
        { id: '999', decision: { dateHomologation: '2022-11-30', dureeValidite: 'sixMois' } },
        referentiel
      );

      depot.finaliseDossier('123', dossier)
        .then(() => depot.service('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it('consigne un événement « Nouvelle homologation créée » dans le journal MSS', (done) => {
      adaptateurJournalMSS.consigneEvenement = (evenement) => {
        expect(evenement.type).to.equal('NOUVELLE_HOMOLOGATION_CREEE');
        expect(evenement.donnees.dateHomologation).to.equal('2022-11-30');
        expect(evenement.donnees.dureeHomologationMois).to.equal(6);
        done();
        return Promise.resolve();
      };
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID, referentiel }
      );
      const dossier = new Dossier(
        { id: '999', decision: { dateHomologation: '2022-11-30', dureeValidite: 'sixMois' } },
        referentiel
      );

      depot.finaliseDossier('123', dossier).catch(done);
    });
  });

  describe('sur demande de suppression des services créés par un utilisateur', () => {
    it("supprime les services dont l'utilisateur est le créateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: 'ABC', email: 'jean.dupont@mail.fr' }],
        services: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: 'ABC', idService: '123', type: 'createur' }],
      });
      const adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      const depot = DepotDonneesServices.creeDepot(
        { adaptateurPersistance, adaptateurJournalMSS },
      );

      adaptateurPersistance.service('123')
        .then((s) => expect(s).to.be.an(Object))
        .then(() => depot.supprimeServicesCreesPar('ABC'))
        .then(() => adaptateurPersistance.service('123'))
        .then((s) => expect(s).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("ne supprime pas les services où l'utilisateur est contributeur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: 'ABC', email: 'jean.dupont@mail.fr' },
          { id: 'DEF', email: 'martin.dujardin@mail.fr' },
        ],
        services: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [
          { id: 'a', idUtilisateur: 'ABC', idService: '123', type: 'createur' },
          { id: 'b', idUtilisateur: 'DEF', idService: '123', type: 'contributeur' },
        ],
      });

      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      adaptateurPersistance.service('123')
        .then((s) => expect(s).to.be.an(Object))
        .then(() => depot.supprimeServicesCreesPar('DEF'))
        .then(() => adaptateurPersistance.service('123'))
        .then((s) => expect(s).to.be.an(Object))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de duplication d'un service", () => {
    let depot;

    beforeEach(() => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Service à dupliquer')
        .construis()
        .toJSON();

      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123-1', descriptionService }],
        services: [{ id: '123-1', descriptionService }],
        autorisations: [{ idUtilisateur: '123', idHomologation: '123-1', idService: '123-1', type: 'createur' }],
      });

      depot = DepotDonneesServices.creeDepot({
        adaptateurJournalMSS: AdaptateurJournalMSSMemoire.nouvelAdaptateur(),
        adaptateurPersistance,
        adaptateurUUID: AdaptateurUUID,
        referentiel,
      });
    });

    it("reste robuste quand le service n'est pas trouvé", (done) => {
      depot.dupliqueService('id-invalide')
        .then(() => done('La tentative de duplication aurait dû lever une exception'))
        .catch((e) => {
          expect(e).to.be.an(ErreurServiceInexistant);
          expect(e.message).to.equal('Service "id-invalide" non trouvé');
          done();
        })
        .catch(done);
    });

    it('peut dupliquer un service à partir de son identifiant', (done) => {
      depot.dupliqueService('123-1')
        .then(() => depot.services('123'))
        .then((services) => {
          expect(services.length).to.equal(2);
          done();
        })
        .catch(done);
    });

    it('utilise un nom disponible pour le service dupliqué', (done) => {
      depot.dupliqueService('123-1')
        .then(() => depot.dupliqueService('123-1'))
        .then(() => depot.services('123'))
        .then(([_, s2, s3]) => {
          expect(s2.nomService()).to.equal('Service à dupliquer - Copie 1');
          expect(s3.nomService()).to.equal('Service à dupliquer - Copie 2');
          done();
        })
        .catch(done);
    });
  });

  describe("sur une demande d'un index de copie disponible pour un service à dupliquer", () => {
    it("utilise l'index 1 si disponible", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel).avecNomService('A').construis().toJSON();
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        services: [{ id: '123', descriptionService }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', idService: '123', type: 'createur' }],
      });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot.trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it("incrémente l'index si nécessaire", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const copie1 = uneDescriptionValide(referentiel).avecNomService('A - UnSuffixe 1').construis().toJSON();
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        services: [{ id: '123', descriptionService: copie1 }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', idService: '123', type: 'createur' }],
      });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot.trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(2))
        .then(() => done())
        .catch(done);
    });

    it("incrémente l'index le plus élevé", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const original = uneDescriptionValide(referentiel).avecNomService('A').construis().toJSON();
      const duplication = uneDescriptionValide(referentiel).avecNomService('A - UnSuffixe 2').construis().toJSON();
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        services: [{ id: '123', descriptionService: original }, { id: '456', descriptionService: duplication }],
        autorisations: [
          { idUtilisateur: '999', idHomologation: '123', idService: '123', type: 'createur' },
          { idUtilisateur: '999', idHomologation: '456', idService: '456', type: 'createur' },
        ],
      });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      depot.trouveIndexDisponible('999', 'A - UnSuffixe')
        .then((index) => expect(index).to.equal(3))
        .then(() => done())
        .catch(done);
    });
  });
});
