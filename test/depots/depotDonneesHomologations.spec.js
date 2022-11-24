const expect = require('expect.js');

const {
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');

const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');

const AutorisationCreateur = require('../../src/modeles/autorisations/autorisationCreateur');
const AvisExpertCyber = require('../../src/modeles/avisExpertCyber');
const DescriptionService = require('../../src/modeles/descriptionService');
const Homologation = require('../../src/modeles/homologation');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const MesureSpecifique = require('../../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const RisqueGeneral = require('../../src/modeles/risqueGeneral');
const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');
const RolesResponsabilites = require('../../src/modeles/rolesResponsabilites');

const copie = require('../../src/utilitaires/copie');
const { EvenementNouvelleHomologationCreee } = require('../../src/modeles/journalMSS/evenements');

describe('Le dépôt de données des homologations', () => {
  it("connaît toutes les homologations d'un utilisateur donné", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'Super Service' } },
        { id: '789', descriptionService: { nomService: 'Autre service' } },
      ],
      utilisateurs: [
        { id: '456', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
      ],
      autorisations: [
        { idUtilisateur: '456', idHomologation: '123', type: 'createur' },
        { idUtilisateur: '999', idHomologation: '789', type: 'createur' },
      ],
    });

    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });
    depot.homologations('456')
      .then((homologations) => {
        expect(homologations.length).to.equal(1);
        expect(homologations[0]).to.be.a(Homologation);
        expect(homologations[0].id).to.equal('123');
        expect(homologations[0].referentiel).to.equal(referentiel);

        expect(homologations[0].createur).to.be.ok();
        expect(homologations[0].createur.id).to.equal('456');
        done();
      })
      .catch(done);
  });

  it('trie les homologations par ordre alphabétique du nom du service', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'B-service' } },
        { id: '456', descriptionService: { nomService: 'C-service' } },
        { id: '789', descriptionService: { nomService: 'A-service' } },
      ],
      utilisateurs: [
        { id: '999', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
      ],
      autorisations: [
        { idUtilisateur: '999', idHomologation: '123', type: 'createur' },
        { idUtilisateur: '999', idHomologation: '456', type: 'createur' },
        { idUtilisateur: '999', idHomologation: '789', type: 'createur' },
      ],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    depot.homologations('999')
      .then((hs) => {
        expect(hs.length).to.equal(3);
        expect(hs[0].nomService()).to.equal('A-service');
        expect(hs[1].nomService()).to.equal('B-service');
        expect(hs[2].nomService()).to.equal('C-service');
        done();
      })
      .catch(done);
  });

  it('peut retrouver une homologation à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
    });
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });

    depot.homologation('789')
      .then((homologation) => {
        expect(homologation).to.be.a(Homologation);
        expect(homologation.id).to.equal('789');
        expect(homologation.referentiel).to.equal(referentiel);
        done();
      })
      .catch(done);
  });

  it("associe ses contributeurs à l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '111', email: 'createur@mail.fr' }, { id: '999', email: 'contributeur@mail.fr' }],
      homologations: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
      autorisations: [
        { idHomologation: '789', idUtilisateur: '111', type: 'createur' },
        { idHomologation: '789', idUtilisateur: '999', type: 'contributeur' },
      ],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    depot.homologation('789')
      .then((homologation) => {
        const { contributeurs } = homologation;
        expect(contributeurs.length).to.equal(1);
        expect(contributeurs[0].id).to.equal('999');
        done();
      })
      .catch(done);
  });

  describe("sur demande d'association de mesures spécifiques à un service", () => {
    let adaptateurPersistance;

    beforeEach(() => {
      const donneesHomologation = { id: '123', descriptionService: { nomService: 'nom' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      });
    });

    it("associe les mesures spécifiques à l'homologation", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });
      depot.remplaceMesuresSpecifiquesPourHomologation('123', mesures)
        .then(() => depot.homologation('123'))
        .then(({ mesures: { mesuresSpecifiques } }) => {
          expect(mesuresSpecifiques.nombre()).to.equal(1);
          expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
          expect(mesuresSpecifiques.item(0).description).to.equal('Une mesure spécifique');
          done();
        })
        .catch(done);
    });

    it('associe les mesures spécifiques au service', (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const depotServices = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });
      depot.remplaceMesuresSpecifiquesPourHomologation('123', mesures)
        .then(() => depotServices.service('123'))
        .then(({ mesures: { mesuresSpecifiques } }) => {
          expect(mesuresSpecifiques.nombre()).to.equal(1);
          expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
          expect(mesuresSpecifiques.item(0).description).to.equal('Une mesure spécifique');
          done();
        })
        .catch(done);
    });
  });

  describe('concernant les mesures générales', () => {
    let valideMesure;

    const referentiel = Referentiel.creeReferentiel({
      mesures: { identifiantMesure: {} },
      reglesPersonnalisation: { mesuresBase: ['identifiantMesure'] },
    });

    before(() => {
      valideMesure = MesureGenerale.valide;
      MesureGenerale.valide = () => {};
    });

    after(() => (MesureGenerale.valide = valideMesure));

    it('renseigne les mesures associées à une homologation', (done) => {
      const donneesHomologation = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
        mesuresGenerales: [{ id: 'identifiantMesure', statut: 'fait' }],
      };

      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });

      depot.homologation('123')
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);

          const mesure = mesuresGenerales.item(0);
          expect(mesure).to.be.a(MesureGenerale);
          expect(mesure.id).to.equal('identifiantMesure');
          done();
        })
        .catch(done);
    });

    describe("sur demande d'association d'une mesure à une homologation", () => {
      let adaptateurPersistance;

      beforeEach(() => {
        const donneesHomologation = { id: '123', descriptionService: { nomService: 'Un service' } };
        adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          homologations: [copie(donneesHomologation)],
          services: [copie(donneesHomologation)],
        });
      });

      it("associe la mesure à l'homologation", (done) => {
        const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });
        const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT });

        depot.ajouteMesureGeneraleAHomologation('123', mesure)
          .then(() => depot.homologation('123'))
          .then(({ mesures: { mesuresGenerales } }) => {
            expect(mesuresGenerales.nombre()).to.equal(1);
            expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
            done();
          })
          .catch(done);
      });

      it('associe la mesure au service', (done) => {
        const config = { adaptateurPersistance, referentiel };
        const depot = DepotDonneesHomologations.creeDepot(config);
        const depotServices = DepotDonneesServices.creeDepot(config);
        const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT });

        depot.ajouteMesureGeneraleAHomologation('123', mesure)
          .then(() => depotServices.service('123'))
          .then(({ mesures: { mesuresGenerales } }) => {
            expect(mesuresGenerales.nombre()).to.equal(1);
            expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
            done();
          })
          .catch(done);
      });
    });

    it("met à jour les données de la mesure si elle est déjà associée à l'homologation", (done) => {
      const donneesHomologation = {
        id: '123',
        descriptionService: { nomService: 'nom' },
        mesures: [{ id: 'identifiantMesure', statut: MesureGenerale.STATUT_EN_COURS }],
      };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });

      const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT });
      depot.ajouteMesureGeneraleAHomologation('123', mesure)
        .then(() => depot.homologation('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).statut).to.equal(MesureGenerale.STATUT_FAIT);
          done();
        })
        .catch(done);
    });
  });

  describe("sur demande de mise à jour de la description du service d'une homologation", () => {
    let adaptateurPersistance;

    beforeEach(() => {
      const donneesHomologation = { id: '123', descriptionService: { nomService: 'Super Service', presentation: 'Une présentation' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      });
    });

    it("met à jour la description du service d'une homologation", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: 'Nouveau Nom' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => depot.homologation('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it("met à jour la description de service dans l'objet métier service", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const depotServices = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: 'Nouveau Nom' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => depotServices.service('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it('lève une exception si le nom du service est absent', (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: '' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => done(
          'La mise à jour de la description du service aurait dû lever une exception'
        ))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceManquant);
          expect(e.message).to.equal('Le nom du service ne peut pas être vide');
          done();
        })
        .catch(done);
    });

    it("ne détecte pas de doublon sur le nom de service pour l'homologation en cours de mise à jour", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: 'Super Service', presentation: 'Une autre présentation' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => depot.homologation('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.presentation).to.equal('Une autre présentation');
          done();
        })
        .catch(done);
    });
  });

  it('sait associer des rôles et responsabilités à une homologation', (done) => {
    const donneesHomologation = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesHomologation)],
      services: [copie(donneesHomologation)],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    const roles = new RolesResponsabilites({ autoriteHomologation: 'Jean Dupont' });
    depot.ajouteRolesResponsabilitesAHomologation('123', roles)
      .then(() => depot.homologation('123'))
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

    it('sait associer un risque général à une homologation', (done) => {
      RisqueGeneral.valide = () => {};

      const donneesHomologation = { id: '123', descriptionService: { nomService: 'nom' } };
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      const risque = new RisqueGeneral({ id: 'unRisque', commentaire: 'Un commentaire' });
      depot.ajouteRisqueGeneralAHomologation('123', risque)
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
    const donneesHomologation = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesHomologation)],
      services: [copie(donneesHomologation)],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    const risque = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un risque' }] });
    depot.remplaceRisquesSpecifiquesPourHomologation('123', risque)
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
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesHomologations)],
      services: [copie(donneesHomologations)],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    const risques = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un nouveau risque' }] });
    depot.remplaceRisquesSpecifiquesPourHomologation('123', risques)
      .then(() => depot.homologation('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un nouveau risque');
        done();
      })
      .catch(done);
  });

  it("sait associer un avis d'expert cyber à une homologation", (done) => {
    const donneesHomologation = { id: '123', descriptionService: { nomService: 'nom' } };
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [copie(donneesHomologation)],
      services: [copie(donneesHomologation)],
    });
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.FAVORABLE });
    depot.ajouteAvisExpertCyberAHomologation('123', avisExpert)
      .then(() => depot.homologation('123'))
      .then(({ avisExpertCyber }) => {
        expect(avisExpertCyber.favorable()).to.be(true);
        done();
      })
      .catch(done);
  });

  describe("quand il reçoit une demande d'enregistrement d'une nouvelle homologation", () => {
    let adaptateurJournalMSS;
    let adaptateurPersistance;
    let adaptateurUUID;
    let depot;

    beforeEach(() => {
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [],
        services: [],
        autorisations: [],
      });
      adaptateurUUID = { genereUUID: () => 'unUUID' };

      depot = DepotDonneesHomologations.creeDepot({
        adaptateurJournalMSS, adaptateurPersistance, adaptateurUUID,
      });
    });

    it('ajoute la nouvelle homologation au dépôt', (done) => {
      depot.homologations('123')
        .then((homologations) => expect(homologations.length).to.equal(0))
        .then(() => depot.nouvelleHomologation('123', { nomService: 'Super Service' }))
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations.length).to.equal(1);
          expect(homologations[0].nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("génère un UUID pour l'homologation créée", (done) => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      depot.nouvelleHomologation('123', { nomService: 'Super Service' })
        .then((idHomologation) => expect(idHomologation).to.equal(
          '11111111-1111-1111-1111-111111111111'
        ))
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations[0].id).to.equal('11111111-1111-1111-1111-111111111111');
          done();
        })
        .catch(done);
    });

    it('ajoute en copie un nouveau service au dépôt', (done) => {
      const depotDonneesServices = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      depot.nouvelleHomologation('123', { nomService: 'Super Service' })
        .then((idHomologation) => depotDonneesServices.service(idHomologation))
        .then((service) => {
          expect(service.nomService()).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("déclare un accès entre l'utilisateur et l'homologation", (done) => {
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({ adaptateurPersistance });
      depotAutorisations.autorisations('123')
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.nouvelleHomologation('123', { nomService: 'SuperService' }))
        .then(() => depotAutorisations.autorisations('123'))
        .then((as) => {
          expect(as.length).to.equal(1);
          const autorisation = as[0];
          expect(autorisation).to.be.an(AutorisationCreateur);
          expect(autorisation.idHomologation).to.equal('unUUID');
          expect(autorisation.idUtilisateur).to.equal('123');
          done();
        })
        .catch(done);
    });

    describe("le journal MSS est utilisé pour consigner l'enregistrement", () => {
      it('avec un événement typé', (done) => {
        adaptateurJournalMSS.consigneEvenement = (evenement) => {
          expect(evenement).to.be.an(EvenementNouvelleHomologationCreee);
          done();
        };

        depot.nouvelleHomologation('123', { nomService: 'Super Service' })
          .catch(done);
      });
    });

    it('lève une exception si le nom du service est manquant', (done) => {
      depot.nouvelleHomologation('123', { nomService: '' })
        .then(() => done("La création de l'homologation aurait dû lever une exception"))
        .catch((e) => expect(e).to.be.an(ErreurNomServiceManquant))
        .then(() => done())
        .catch(done);
    });

    it('lève une exception si le nom du service existe déjà pour une autre homologation', (done) => {
      depot.nouvelleHomologation('123', { nomService: 'Un nom' })
        .then(() => depot.nouvelleHomologation('123', { nomService: 'Un nom' }))
        .then(() => done("La création de l'homologation aurait dû lever une exception"))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceDejaExistant);
          expect(e.message).to.equal('Le nom du service "Un nom" existe déjà pour une autre homologation');
          done();
        })
        .catch(done);
    });
  });

  describe('sur vérification existence homologation avec un nom de service donné', () => {
    it('détecte existence homologation', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [{
          id: '789', descriptionService: { nomService: 'Un service existant' },
        }],
        autorisations: [{ idUtilisateur: '123', idHomologation: '789', type: 'createur' }],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('123', 'Un nom de service')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => depot.homologationExiste('123', 'Un service existant'))
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("ne considère que les homologations de l'utilisateur donné", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '123', email: 'jean.dupont@mail.fr' },
          { id: '456', email: 'sylvie.martin@mail.fr' },
        ],
        homologations: [{
          id: '789', idUtilisateur: '123', descriptionService: { nomService: 'Un service existant' },
        }],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('456', 'Un service existant')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => done())
        .catch(done);
    });

    it("ne considère pas l'homologation en cours de mise à jour", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [
          { id: '888', descriptionService: { nomService: 'Un service existant' } },
          { id: '999', descriptionService: { nomService: 'Un nom de service' } },
        ],
        autorisations: [
          { idUtilisateur: '123', idHomologation: '888', type: 'createur' },
          { idUtilisateur: '123', idHomologation: '999', type: 'createur' },
        ],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('123', 'Un service existant', '888')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => depot.homologationExiste('123', 'Un service existant', '999'))
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });

  describe("sur demande de suppression d'une homologation", () => {
    let adaptateurPersistance;

    beforeEach(() => {
      const donneesHomologation = { id: '123', descriptionService: { nomService: 'Un service' } };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [copie(donneesHomologation)],
        services: [copie(donneesHomologation)],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
    });

    it("supprime l'homologation", (done) => {
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      adaptateurPersistance.homologation('123')
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
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });

      adaptateurPersistance.service('123')
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
          { id: '123', idUtilisateur: '999', idHomologation: '111', type: 'createur' },
          { id: '456', idUtilisateur: '000', idHomologation: '111', type: 'contributeur' },
          { id: '789', idUtilisateur: '000', idHomologation: '222', type: 'contributeur' },
        ],
      });
      const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance });
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({ adaptateurPersistance });

      depot.supprimeHomologation('111')
        .then(() => depotAutorisations.autorisations('999'))
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depotAutorisations.autorisations('000'))
        .then((as) => expect(as.length).to.equal(1))
        .then(() => depotAutorisations.autorisation('789'))
        .then((a) => expect(a).to.be.ok())
        .then(() => done())
        .catch(done);
    });
  });
});
