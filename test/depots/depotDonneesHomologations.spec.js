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
const { unDossier } = require('../constructeurs/constructeurDossier');

const {
  Rubriques,
  Permissions,
} = require('../../src/modeles/autorisations/gestionDroits');
const EvenementMesuresServiceModifiees = require('../../src/bus/evenementMesuresServiceModifiees');
const { fabriqueBusPourLesTests } = require('../bus/aides/busPourLesTests');
const EvenementNouveauServiceCree = require('../../src/bus/evenementNouveauServiceCree');
const {
  EvenementDescriptionServiceModifiee,
} = require('../../src/bus/evenementDescriptionServiceModifiee');
const Mesures = require('../../src/modeles/mesures');
const EvenementDossierHomologationFinalise = require('../../src/bus/evenementDossierHomologationFinalise');

const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;
const { ECRITURE } = Permissions;

describe('Le dépôt de données des homologations', () => {
  let busEvenements;

  beforeEach(() => {
    busEvenements = fabriqueBusPourLesTests();
  });

  it("connaît toutes les homologations d'un utilisateur donné", async () => {
    const referentiel = Referentiel.creeReferentielVide();

    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(unService(referentiel).avecId('123').donnees)
      .ajouteUnService(unService(referentiel).avecId('789').donnees)
      .ajouteUnUtilisateur(unUtilisateur().avecId('456').donnees)
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('456', '123').donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('999', '789').donnees
      );

    const depot = unDepotDeDonneesServices()
      .avecAdaptateurPersistance(adaptateurPersistance)
      .avecReferentiel(referentiel)
      .construis();

    const homologations = await depot.homologations('456');

    expect(homologations.length).to.equal(1);
    expect(homologations[0]).to.be.a(Homologation);
    expect(homologations[0].id).to.equal('123');
    expect(homologations[0].referentiel).to.equal(referentiel);
  });

  it("utilise l'adaptateur de persistance pour récupérer tous les services du système", async () => {
    let adaptateurAppele;
    const adaptateurPersistance = unePersistanceMemoire().construis();
    adaptateurPersistance.tousLesServices = async () => {
      adaptateurAppele = true;
      return [];
    };

    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
    });

    await depot.tousLesServices();

    expect(adaptateurAppele).to.be(true);
  });

  it('trie les homologations par ordre alphabétique du nom du service', async () => {
    const r = Referentiel.creeReferentielVide();
    const persistance = unePersistanceMemoire()
      .ajouteUnUtilisateur(unUtilisateur().avecId('U').donnees)
      .ajouteUnService(
        unService(r).avecId('1').avecNomService('B-service').donnees
      )
      .ajouteUnService(
        unService(r).avecId('2').avecNomService('C-service').donnees
      )
      .ajouteUnService(
        unService(r).avecId('3').avecNomService('A-service').donnees
      )
      .ajouteUneAutorisation(uneAutorisation().deProprietaire('U', '1').donnees)
      .ajouteUneAutorisation(uneAutorisation().deProprietaire('U', '2').donnees)
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U', '3').donnees
      );

    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecAdaptateurPersistance(persistance)
      .construis();

    const hs = await depot.homologations('U');

    expect(hs.length).to.equal(3);
    expect(hs[0].nomService()).to.equal('A-service');
    expect(hs[1].nomService()).to.equal('B-service');
    expect(hs[2].nomService()).to.equal('C-service');
  });

  it('peut retrouver une homologation à partir de son identifiant', async () => {
    let donneeDechiffree;
    const adaptateurChiffrement = {
      dechiffre: async (objetDonnee) => {
        donneeDechiffree = objetDonnee;
        const { chiffre, ...reste } = objetDonnee;
        return reste;
      },
    };

    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService({
        id: '789',
        descriptionService: { nomService: 'nom', chiffre: true },
      })
      .construis();
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      referentiel,
    });

    const homologation = await depot.homologation('789');

    expect(homologation).to.be.a(Homologation);
    expect(homologation.id).to.equal('789');
    expect(homologation.referentiel).to.equal(referentiel);
    expect(homologation.nomService()).to.be('nom');
    expect(donneeDechiffree).to.eql({ nomService: 'nom', chiffre: true });
  });

  it("associe ses contributeurs à l'homologation", async () => {
    const r = Referentiel.creeReferentielVide();
    const persistance = unePersistanceMemoire()
      .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
      .ajouteUnUtilisateur(unUtilisateur().avecId('U2').donnees)
      .ajouteUnService(unService(r).avecId('S1').donnees)
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deContributeur('U2', 'S1').donnees
      );
    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecAdaptateurPersistance(persistance)
      .construis();

    const homologation = await depot.homologation('S1');

    const { contributeurs } = homologation;
    expect(contributeurs.length).to.equal(2);
    expect(contributeurs[0].id).to.equal('U1');
    expect(contributeurs[1].id).to.equal('U2');
  });

  describe("sur demande d'associations de mesures à un service", () => {
    let adaptateurPersistance;
    let depot;

    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { identifiantMesure: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['identifiantMesure'] },
    });

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel).avecId('123').avecNomService('nom').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('789', '123').donnees
        );
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecBusEvenements(busEvenements)
        .construis();
    });

    it("associe les mesures générales à l'homologation", async () => {
      const generale = new MesureGenerale(
        { id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT },
        referentiel
      );

      const specifiques = new MesuresSpecifiques();
      await depot.ajouteMesuresAuService('123', '789', [generale], specifiques);

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
      await depot.ajouteMesuresAuService('123', '789', [generale], specifiques);

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
      await depot.ajouteMesuresAuService('123', '789', [generale], specifiques);

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

      await depot.ajouteMesuresAuService('123', '789', generales, specifiques);

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

      await depot.ajouteMesuresAuService('123', '789', generales, mesures);

      const {
        mesures: { mesuresSpecifiques },
      } = await depotServices.service('123');
      expect(mesuresSpecifiques.nombre()).to.equal(1);
      expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
      expect(mesuresSpecifiques.item(0).description).to.equal(
        'Une mesure spécifique'
      );
    });

    it("publie un événement de 'Mesures service modifiées'", async () => {
      await depot.ajouteMesuresAuService(
        '123',
        '789',
        [
          new MesureGenerale(
            { id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT },
            referentiel
          ),
        ],
        new MesuresSpecifiques()
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesuresServiceModifiees)
      ).to.be(true);
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

  describe("sur demande de mise à jour de la description d'un service", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;
    let bus;
    let depot;
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(
          unUtilisateur().avecId('U1').avecEmail('jean.dupont@mail.fr').donnees
        )
        .ajouteUnService(
          unService(referentiel).avecId('S1').avecNomService('Service').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        );
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      bus = fabriqueBusPourLesTests();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecJournalMSS(adaptateurJournalMSS)
        .avecBusEvenements(bus)
        .construis();
    });

    it('met à jour la description du service', async () => {
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depot.homologation('S1');
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

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depotServices.service('S1');
      expect(descriptionService.nomService).to.equal('Nouveau Nom');
    });

    it('lève une exception si des propriétés obligatoires ne sont pas renseignées', async () => {
      const descriptionIncomplete = uneDescriptionValide(referentiel)
        .avecNomService('')
        .construis();

      try {
        await depot.ajouteDescriptionService('U1', 'S1', descriptionIncomplete);
        expect().fail(
          'La mise à jour de la description du service aurait dû lever une exception'
        );
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
        expect(e.message).to.equal(
          'Certaines données obligatoires ne sont pas renseignées'
        );
      }
    });

    it('ne détecte pas de doublon sur le nom de service pour le service en cours de mise à jour', async () => {
      const description = uneDescriptionValide(referentiel)
        .avecPresentation('Une autre présentation')
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depot.homologation('S1');
      expect(descriptionService.presentation).to.equal(
        'Une autre présentation'
      );
    });

    it('publie un événement de « description service modifiée »', async () => {
      const description = uneDescriptionValide(referentiel).construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      expect(bus.aRecuUnEvenement(EvenementDescriptionServiceModifiee)).to.be(
        true
      );
      const evenement = bus.recupereEvenement(
        EvenementDescriptionServiceModifiee
      );
      expect(evenement.service.id).to.be('S1');
    });
  });

  it('sait associer des rôles et responsabilités à une homologation', async () => {
    const r = Referentiel.creeReferentielVide();
    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecAdaptateurPersistance(
        unePersistanceMemoire().ajouteUnService(
          unService(r).avecId('S1').donnees
        )
      )
      .construis();

    const roles = new RolesResponsabilites({ autoriteHomologation: 'Jean' });
    await depot.ajouteRolesResponsabilitesAService('S1', roles);

    const { rolesResponsabilites } = await depot.homologation('S1');
    expect(rolesResponsabilites.autoriteHomologation).to.equal('Jean');
  });

  describe('concernant les risques généraux', () => {
    let valideRisque;

    before(() => {
      valideRisque = RisqueGeneral.valide;
      RisqueGeneral.valide = () => {};
    });

    after(() => (RisqueGeneral.valide = valideRisque));

    it('sait associer un risque général à une homologation', async () => {
      RisqueGeneral.valide = () => {};

      const r = Referentiel.creeReferentielVide();
      const depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecAdaptateurPersistance(
          unePersistanceMemoire().ajouteUnService(
            unService(r).avecId('S1').donnees
          )
        )
        .construis();

      const risque = new RisqueGeneral({ id: 'R1' });
      await depot.ajouteRisqueGeneralAService('S1', risque);

      const { risques } = await depot.homologation('S1');
      expect(risques.risquesGeneraux.nombre()).to.equal(1);
      expect(risques.risquesGeneraux.item(0)).to.be.a(RisqueGeneral);
      expect(risques.risquesGeneraux.item(0).id).to.equal('R1');
    });
  });

  it('sait associer un risque spécifique à une homologation', async () => {
    const r = Referentiel.creeReferentielVide();

    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecAdaptateurPersistance(
        unePersistanceMemoire().ajouteUnService(
          unService(r).avecId('S1').donnees
        )
      )
      .construis();

    const risque = new RisquesSpecifiques({
      risquesSpecifiques: [{ description: 'Un risque' }],
    });
    await depot.remplaceRisquesSpecifiquesDuService('S1', risque);

    const {
      risques: { risquesSpecifiques },
    } = await depot.homologation('S1');
    expect(risquesSpecifiques.nombre()).to.equal(1);
    expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
    expect(risquesSpecifiques.item(0).description).to.equal('Un risque');
  });

  it('supprime les risques spécifiques précédemment associés', async () => {
    const r = Referentiel.creeReferentielVide();

    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecAdaptateurPersistance(
        unePersistanceMemoire().ajouteUnService(
          unService(r)
            .avecId('S1')
            .avecRisques(
              new RisquesSpecifiques({
                risquesSpecifiques: [{ description: 'Un ancien risque' }],
              })
            ).donnees
        )
      )
      .construis();

    const nouveauxRisques = new RisquesSpecifiques({
      risquesSpecifiques: [{ description: 'Un nouveau risque' }],
    });
    await depot.remplaceRisquesSpecifiquesDuService('S1', nouveauxRisques);

    const {
      risques: { risquesSpecifiques },
    } = await depot.homologation('S1');
    expect(risquesSpecifiques.nombre()).to.equal(1);
    expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
    expect(risquesSpecifiques.item(0).description).to.be('Un nouveau risque');
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
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(
          unUtilisateur().avecId('123').avecEmail('jean.dupont@mail.fr').donnees
        )
        .construis();
      adaptateurTracking = unAdaptateurTracking().construis();
      adaptateurUUID = { genereUUID: () => 'unUUID' };
      referentiel = Referentiel.creeReferentielVide();

      depot = DepotDonneesHomologations.creeDepot({
        adaptateurChiffrement,
        adaptateurJournalMSS,
        adaptateurPersistance,
        adaptateurTracking,
        adaptateurUUID,
        busEvenements,
        referentiel,
      });
    });

    it('ajoute le nouveau service au dépôt', async () => {
      const avant = await depot.homologations('123');
      expect(avant.length).to.equal(0);

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();
      await depot.nouveauService('123', { descriptionService });

      const apres = await depot.homologations('123');
      expect(apres.length).to.equal(1);
      expect(apres[0].nomService()).to.equal('Super Service');
    });

    it('génère un UUID pour le service créée', async () => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const idService = await depot.nouveauService('123', {
        descriptionService: uneDescriptionValide(referentiel).donnees,
      });

      expect(idService).to.be('11111111-1111-1111-1111-111111111111');
      const services = await depot.homologations('123');
      expect(services[0].id).to.be('11111111-1111-1111-1111-111111111111');
    });

    it('chiffre les données métier avant de les stocker', async () => {
      let donneesPersistees;

      const persistanceReelle = adaptateurPersistance.sauvegardeHomologation;
      adaptateurPersistance.sauvegardeHomologation = (id, donnees) => {
        donneesPersistees = donnees;
        return persistanceReelle(id, donnees);
      };

      adaptateurChiffrement.chiffre = async (objet) => ({
        ...objet,
        chiffre: true,
      });

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Service A')
        .construis()
        .donneesSerialisees();

      await depot.nouveauService('123', { descriptionService });

      expect(donneesPersistees.descriptionService.nomService).to.equal(
        'Service A'
      );
      expect(donneesPersistees.descriptionService.chiffre).to.equal(true);
    });

    it('ajoute en copie un nouveau service au dépôt', async () => {
      const depotDonneesServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        referentiel,
      });

      const descriptionService =
        uneDescriptionValide(referentiel).avecNomService('Service').donnees;
      const idService = await depot.nouveauService('123', {
        descriptionService,
      });

      const service = await depotDonneesServices.service(idService);
      expect(service.nomService()).to.equal('Service');
    });

    it("déclare un accès en écriture entre l'utilisateur et le service", async () => {
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance,
      });

      const avant = await depotAutorisations.autorisations('123');
      expect(avant.length).to.equal(0);

      const descriptionService = uneDescriptionValide(referentiel).donnees;
      await depot.nouveauService('123', { descriptionService });

      const apres = await depotAutorisations.autorisations('123');
      expect(apres.length).to.equal(1);
      const autorisation = apres[0];
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
    });

    it('publie un événement de "Nouveau service créé"', async () => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();

      await depot.nouveauService('123', { descriptionService });

      expect(busEvenements.aRecuUnEvenement(EvenementNouveauServiceCree)).to.be(
        true
      );
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
            'Le nom du service "Nom service" existe déjà pour un autre service'
          );
          done();
        })
        .catch(done);
    });
  });

  describe("sur la vérification d'existence d'un service avec un nom de service donné", () => {
    it("détecte l'existence d'un service grâce à son nom et un utilisateur", async () => {
      const r = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnService(
          unService(r).avecId('S1').avecNomService('Le service').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        );

      const depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecAdaptateurPersistance(persistance)
        .construis();

      const existeMauvaisNom = await depot.serviceExiste('U1', 'Mauvais nom');
      expect(existeMauvaisNom).to.be(false);

      const existeNomCorrect = await depot.serviceExiste('U1', 'Le service');
      expect(existeNomCorrect).to.be(true);
    });

    it("ne considère que les services de l'utilisateur donné", async () => {
      const r = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('U2').donnees)
        .ajouteUnService(
          unService(r).avecId('S1').avecNomService('Service de U1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        );

      const depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecAdaptateurPersistance(persistance)
        .construis();

      const existeChezU2 = await depot.serviceExiste('U2', 'Service de U1');
      expect(existeChezU2).to.be(false);
      const existeChezU1 = await depot.serviceExiste('U1', 'Service de U1');
      expect(existeChezU1).to.be(true);
    });

    it('ne considère pas le service en cours de mise à jour', async () => {
      const r = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnService(
          unService(r).avecId('S1').avecNomService('Le S1').donnees
        )
        .ajouteUnService(
          unService(r).avecId('S2').avecNomService('Autre service').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        );
      const depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecAdaptateurPersistance(persistance)
        .construis();

      const considereEnCours = await depot.serviceExiste('U1', 'Le S1', 'S1');
      expect(considereEnCours).to.be(false);
      const considereAutre = await depot.serviceExiste('U1', 'Le S1', 'S2');
      expect(considereAutre).to.be(true);
    });
  });

  describe("sur demande de suppression d'une homologation", () => {
    let adaptateurPersistance;
    let adaptateurJournalMSS;
    let depot;

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
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees,
        ],
      });

      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurJournalMSS,
      });
    });

    it("supprime l'homologation", (done) => {
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
          uneAutorisation().avecId('123').deProprietaire('999', '111').donnees,
          uneAutorisation().avecId('456').deContributeur('000', '111').donnees,
          uneAutorisation().avecId('789').deContributeur('000', '222').donnees,
        ],
      });
      depot = DepotDonneesHomologations.creeDepot({
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

      depot = DepotDonneesHomologations.creeDepot({
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
          expect(e.message).to.equal('Service "999" non trouvé');
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
      categoriesMesures: { gouvernance: {} },
      statutsMesures: { fait: {} },
      mesures: { mesureA: {} },
      indiceCyber: { noteMax: 5 },
    });

    beforeEach(() => {
      adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
      adaptateurPersistance = unePersistanceMemoire().construis();
      depot = DepotDonneesHomologations.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurJournalMSS,
        adaptateurPersistance,
        referentiel,
        busEvenements,
      });
    });

    it('finalise le dossier courant', async () => {
      const uneMesureFaiteSurDeux = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        {
          mesureA: { categorie: 'gouvernance' },
          mesureB: { categorie: 'gouvernance' },
        }
      );
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom')
        .avecDossiers([
          unDossier(referentiel)
            .quiEstComplet()
            .quiEstNonFinalise()
            .avecDecision('2022-11-30', 'sixMois').donnees,
        ])
        .avecMesures(uneMesureFaiteSurDeux)
        .construis();
      expect(service.dossiers.items[0].finalise).to.be(false);

      await depot.finaliseDossierCourant(service);

      expect(service.dossiers.items[0].finalise).to.be(true);
      expect(service.dossiers.items[0].indiceCyber).to.be(2.5);
    });

    it('enregistre le service', async () => {
      let donneesPassees = {};
      adaptateurPersistance.sauvegardeHomologation = async (id, donnees) => {
        donneesPassees = { id, donnees };
      };
      const mesuresPersonnalises = {
        mesureA: { categorie: 'gouvernance' },
      };
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        mesuresPersonnalises
      );
      const service = unService(referentiel)
        .avecId('123')
        .avecNomService('nom')
        .avecDossiers([
          unDossier(referentiel)
            .quiEstComplet()
            .quiEstNonFinalise()
            .avecDecision('2022-11-30', 'sixMois').donnees,
        ])
        .avecMesures(mesures)
        .construis();

      await depot.finaliseDossierCourant(service);

      service.donneesAPersister().toutes();
      const { id, ...donnees } = service.donneesAPersister().toutes();
      expect(donneesPassees.id).to.equal('123');
      expect(donneesPassees.donnees).to.eql(donnees);
    });

    it("publie sur le bus d'événements le dossier finalisé", async () => {
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

      expect(
        busEvenements.aRecuUnEvenement(EvenementDossierHomologationFinalise)
      ).to.be(true);
      const recu = busEvenements.recupereEvenement(
        EvenementDossierHomologationFinalise
      );
      expect(recu.idService).to.be('123');
      expect(recu.dossier.decision.dateHomologation).to.be('2022-11-30');
      expect(recu.dossier.decision.dureeValidite).to.be('sixMois');
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
            uneAutorisation().deProprietaire('123', '123-1').donnees,
          ],
        });

      depot = DepotDonneesHomologations.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurJournalMSS: AdaptateurJournalMSSMemoire.nouvelAdaptateur(),
        adaptateurPersistance,
        adaptateurTracking: unAdaptateurTracking().construis(),
        adaptateurUUID: AdaptateurUUID,
        busEvenements: fabriqueBusPourLesTests(),
        referentiel,
      });
    });

    it("reste robuste quand l'homologation n'est pas trouvée", (done) => {
      depot
        .dupliqueService('id-invalide', '123')
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
        .dupliqueService('123-1', '123')
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations.length).to.equal(2);
          done();
        })
        .catch(done);
    });

    it("utilise un nom disponible pour l'homologation dupliquée", (done) => {
      depot
        .dupliqueService('123-1', '123')
        .then(() => depot.dupliqueService('123-1', '123'))
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
            uneAutorisation().deProprietaire('999', '123').donnees,
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
            uneAutorisation().deProprietaire('999', '123').donnees,
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
            uneAutorisation().deProprietaire('999', '123').donnees,
            uneAutorisation().deProprietaire('999', '456').donnees,
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
            uneAutorisation().deProprietaire('999', '123').donnees,
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

  describe('sur demande de mise à jour du service', () => {
    const referentiel = Referentiel.creeReferentielVide();

    it("jette une erreur si le service n'existe pas", async () => {
      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance: unePersistanceMemoire().construis(),
        referentiel,
      });

      try {
        await depot.metsAJourService(unService().avecId('123').construis());
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
        expect(e.message).to.equal('Service "123" non trouvé');
      }
    });

    it("délègue à l'adaptateur persistance la sauvegarde du service", async () => {
      const service = unService(referentiel).avecId('S1').construis();
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService({ id: 'S1' })
        .construis();

      let donneesPersistees;
      adaptateurPersistance.sauvegardeService = async (id, donnees) => {
        donneesPersistees = { id, donnees };
      };

      const depot = DepotDonneesHomologations.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        referentiel,
      });

      await depot.metsAJourService(service);

      expect(donneesPersistees.id).to.eql('S1');
      expect(donneesPersistees.donnees).not.to.be(undefined);
    });
  });
});
