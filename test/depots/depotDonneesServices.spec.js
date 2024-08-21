const expect = require('expect.js');

const uneDescriptionValide = require('../constructeurs/constructeurDescriptionService');

const {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
  ErreurDonneesNiveauSecuriteInsuffisant,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const {
  fabriqueAdaptateurUUID,
} = require('../../src/adaptateurs/adaptateurUUID');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');

const Dossier = require('../../src/modeles/dossier');
const Service = require('../../src/modeles/service');
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
const EvenementServiceSupprime = require('../../src/bus/evenementServiceSupprime');
const fauxAdaptateurRechercheEntreprise = require('../mocks/adaptateurRechercheEntreprise');
const Entite = require('../../src/modeles/entite');
const Utilisateur = require('../../src/modeles/utilisateur');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');

const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;
const { ECRITURE } = Permissions;

describe('Le dépôt de données des services', () => {
  let busEvenements;

  beforeEach(() => {
    busEvenements = fabriqueBusPourLesTests();
  });

  it("connaît tous les services d'un utilisateur donné", async () => {
    const referentiel = Referentiel.creeReferentielVide();

    const persistance = unePersistanceMemoire()
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
      .avecConstructeurDePersistance(persistance)
      .avecReferentiel(referentiel)
      .construis();

    const services = await depot.services('456');

    expect(services.length).to.equal(1);
    expect(services[0]).to.be.a(Service);
    expect(services[0].id).to.equal('123');
    expect(services[0].referentiel).to.equal(referentiel);
  });

  it("utilise l'adaptateur de persistance pour récupérer tous les services du système", async () => {
    let adaptateurAppele;
    const adaptateurPersistance = unePersistanceMemoire().construis();
    adaptateurPersistance.tousLesServices = async () => {
      adaptateurAppele = true;
      return [];
    };

    const depot = DepotDonneesServices.creeDepot({
      adaptateurPersistance,
    });

    await depot.tousLesServices();

    expect(adaptateurAppele).to.be(true);
  });

  it('trie les services par ordre alphabétique de leur nom', async () => {
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
      .avecConstructeurDePersistance(persistance)
      .construis();

    const services = await depot.services('U');

    expect(services.length).to.equal(3);
    expect(services[0].nomService()).to.equal('A-service');
    expect(services[1].nomService()).to.equal('B-service');
    expect(services[2].nomService()).to.equal('C-service');
  });

  it('peut retrouver un service à partir de son identifiant', async () => {
    let donneeDechiffree;
    const adaptateurChiffrement = {
      dechiffre: async (objetDonnee) => {
        donneeDechiffree = objetDonnee;
        donneeDechiffree.chiffre = false;
        const { chiffre, ...reste } = objetDonnee;
        return reste;
      },
    };

    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService({
        id: '789',
        descriptionService: { nomService: 'nom' },
        chiffre: true,
      })
      .construis();
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesServices.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      referentiel,
    });

    const service = await depot.service('789');

    expect(service).to.be.a(Service);
    expect(service.id).to.equal('789');
    expect(service.referentiel).to.equal(referentiel);
    expect(service.nomService()).to.be('nom');
    expect(donneeDechiffree).to.eql({
      descriptionService: { nomService: 'nom' },
      chiffre: false,
    });
  });

  it('associe ses contributeurs au service', async () => {
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
      .avecConstructeurDePersistance(persistance)
      .construis();

    const service = await depot.service('S1');

    const { contributeurs } = service;
    expect(contributeurs.length).to.equal(2);
    expect(contributeurs[0].id).to.equal('U1');
    expect(contributeurs[1].id).to.equal('U2');
  });

  it("délègue au dépôt d'utilisateurs de déchiffrer les contributeurs", async () => {
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
    const unDepotUtilisateur = {
      dechiffreUtilisateur: async (donneesUtilisateur) => {
        donneesUtilisateur.donnees.nom = `${donneesUtilisateur.id}-déchiffré`;
        return new Utilisateur({
          id: donneesUtilisateur.id,
          ...donneesUtilisateur.donnees,
        });
      },
    };
    const depot = unDepotDeDonneesServices()
      .avecDepotDonneesUtilisateurs(unDepotUtilisateur)
      .avecReferentiel(r)
      .avecConstructeurDePersistance(persistance)
      .construis();

    const service = await depot.service('S1');

    expect(service.contributeurs[0].nom).to.equal('U1-déchiffré');
    expect(service.contributeurs[1].nom).to.equal('U2-déchiffré');
  });

  it('associe ses suggestions d’actions au service', async () => {
    const r = Referentiel.creeReferentiel({
      naturesSuggestionsActions: {
        siret: { lien: '/lien', permissionRequise: {} },
      },
    });
    const persistance = unePersistanceMemoire()
      .ajouteUnService(unService(r).avecId('S1').donnees)
      .avecUneSuggestionAction({ idService: 'S1', nature: 'siret' });
    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecConstructeurDePersistance(persistance)
      .construis();

    const service = await depot.service('S1');

    expect(service.routesDesSuggestionsActions()[0].route).to.be('/lien');
  });

  it('renseigne les mesures générales associées à un service', async () => {
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

    const depot = unDepotDeDonneesServices()
      .avecConstructeurDePersistance(
        unePersistanceMemoire().ajouteUnService(donneesService)
      )
      .avecReferentiel(referentiel)
      .construis();

    const {
      mesures: { mesuresGenerales },
    } = await depot.service('123');

    expect(mesuresGenerales.nombre()).to.equal(1);
    const mesure = mesuresGenerales.item(0);
    expect(mesure).to.be.a(MesureGenerale);
    expect(mesure.id).to.equal('identifiantMesure');
  });

  describe("sur demande de mise à jour de la description d'un service", () => {
    let adaptateurPersistance;
    let bus;
    let depot;
    let referentiel;
    let adaptateurRechercheEntite;
    let adaptateurChiffrement;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
      adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
      adaptateurChiffrement = fauxAdaptateurChiffrement();
      adaptateurPersistance = unePersistanceMemoire(adaptateurChiffrement)
        .ajouteUnUtilisateur(
          unUtilisateur().avecId('U1').avecEmail('jean.dupont@mail.fr').donnees
        )
        .ajouteUnService(
          unService(referentiel).avecId('S1').avecNomService('Service').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        )
        .construis();
      bus = fabriqueBusPourLesTests();
      depot = unDepotDeDonneesServices()
        .avecAdaptateurChiffrement(adaptateurChiffrement)
        .avecReferentiel(referentiel)
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecBusEvenements(bus)
        .avecAdaptateurRechercheEntite(adaptateurRechercheEntite)
        .construis();
    });

    it('met à jour la description du service', async () => {
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depot.service('S1');
      expect(descriptionService.nomService).to.equal('Nouveau Nom');
    });

    it('met à jour le SHA-256 du nom du service', async () => {
      const description = uneDescriptionValide(referentiel)
        .avecNomService('Nouveau Nom')
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const donnees = await adaptateurPersistance.service('S1');
      expect(donnees.nomServiceHash).to.be('Nouveau Nom-haché256');
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

    it("lève une exception si le siret de l'organisation responsable n'est pas renseigné", async () => {
      const descriptionSansOrganisationResponsable = uneDescriptionValide(
        referentiel
      )
        .deLOrganisation({})
        .construis();

      try {
        await depot.ajouteDescriptionService(
          'U1',
          'S1',
          descriptionSansOrganisationResponsable
        );
        expect().fail(
          'La mise à jour de la description du service aurait dû lever une exception'
        );
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
        expect(e.message).to.equal('La propriété "entite.siret" est requise');
      }
    });

    it("complète les informations de l'organisation responsable et les enregistre", async () => {
      adaptateurRechercheEntite.rechercheOrganisations = async () => [
        {
          nom: 'MonEntite',
          departement: '75',
          siret: '12345',
        },
      ];
      const depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
        referentiel,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });
      const description = uneDescriptionValide(referentiel)
        .deLOrganisation(new Entite({ siret: '12345' }))
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depotServices.service('S1');
      expect(descriptionService.organisationResponsable.siret).to.equal(
        '12345'
      );
      expect(descriptionService.organisationResponsable.departement).to.equal(
        '75'
      );
      expect(descriptionService.organisationResponsable.nom).to.equal(
        'MonEntite'
      );
    });

    it('ne détecte pas de doublon sur le nom de service pour le service en cours de mise à jour', async () => {
      const description = uneDescriptionValide(referentiel)
        .avecPresentation('Une autre présentation')
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const { descriptionService } = await depot.service('S1');
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

  it('sait associer des rôles et responsabilités à un service', async () => {
    const r = Referentiel.creeReferentielVide();
    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecConstructeurDePersistance(
        unePersistanceMemoire().ajouteUnService(
          unService(r).avecId('S1').donnees
        )
      )
      .construis();

    const roles = new RolesResponsabilites({ autoriteHomologation: 'Jean' });
    await depot.ajouteRolesResponsabilitesAService('S1', roles);

    const { rolesResponsabilites } = await depot.service('S1');
    expect(rolesResponsabilites.autoriteHomologation).to.equal('Jean');
  });

  describe('concernant les risques généraux', () => {
    let valideRisque;

    before(() => {
      valideRisque = RisqueGeneral.valide;
      RisqueGeneral.valide = () => {};
    });

    after(() => (RisqueGeneral.valide = valideRisque));

    it('sait associer un risque général à un service', async () => {
      RisqueGeneral.valide = () => {};

      const r = Referentiel.creeReferentielVide();
      const depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecConstructeurDePersistance(
          unePersistanceMemoire().ajouteUnService(
            unService(r).avecId('S1').donnees
          )
        )
        .construis();

      const risque = new RisqueGeneral({ id: 'R1' });
      await depot.ajouteRisqueGeneralAService('S1', risque);

      const { risques } = await depot.service('S1');
      expect(risques.risquesGeneraux.nombre()).to.equal(1);
      expect(risques.risquesGeneraux.item(0)).to.be.a(RisqueGeneral);
      expect(risques.risquesGeneraux.item(0).id).to.equal('R1');
    });
  });

  it('sait associer un risque spécifique à un service', async () => {
    const r = Referentiel.creeReferentielVide();

    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecConstructeurDePersistance(
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
    } = await depot.service('S1');
    expect(risquesSpecifiques.nombre()).to.equal(1);
    expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
    expect(risquesSpecifiques.item(0).description).to.equal('Un risque');
  });

  it('supprime les risques spécifiques précédemment associés', async () => {
    const r = Referentiel.creeReferentielVide();

    const depot = unDepotDeDonneesServices()
      .avecReferentiel(r)
      .avecConstructeurDePersistance(
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
    } = await depot.service('S1');
    expect(risquesSpecifiques.nombre()).to.equal(1);
    expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
    expect(risquesSpecifiques.item(0).description).to.be('Un nouveau risque');
  });

  describe("quand il reçoit une demande d'enregistrement d'un nouveau service", () => {
    let adaptateurChiffrement;
    let adaptateurPersistance;
    let adaptateurUUID;
    let adaptateurRechercheEntite;
    let depot;
    let referentiel;

    beforeEach(() => {
      adaptateurChiffrement = fauxAdaptateurChiffrement();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(
          unUtilisateur().avecId('123').avecEmail('jean.dupont@mail.fr').donnees
        )
        .construis();
      adaptateurUUID = { genereUUID: () => 'unUUID' };
      referentiel = Referentiel.creeReferentielVide();
      adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();

      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(adaptateurPersistance)
        .avecAdaptateurChiffrement(adaptateurChiffrement)
        .avecAdaptateurUUID(adaptateurUUID)
        .avecReferentiel(referentiel)
        .avecBusEvenements(busEvenements)
        .avecAdaptateurRechercheEntite(adaptateurRechercheEntite)
        .construis();
    });

    it('ajoute le nouveau service au dépôt', async () => {
      const avant = await depot.services('123');
      expect(avant.length).to.equal(0);

      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .toJSON();
      await depot.nouveauService('123', { descriptionService });

      const apres = await depot.services('123');
      expect(apres.length).to.equal(1);
      expect(apres[0].nomService()).to.equal('Super Service');
    });

    it('génère un UUID pour le service créée', async () => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const idService = await depot.nouveauService('123', {
        descriptionService: uneDescriptionValide(referentiel).donnees,
      });

      expect(idService).to.be('11111111-1111-1111-1111-111111111111');
      const services = await depot.services('123');
      expect(services[0].id).to.be('11111111-1111-1111-1111-111111111111');
    });

    it("complète les informations de l'organisation responsable avant de les stocker", async () => {
      adaptateurRechercheEntite.rechercheOrganisations = async () => [
        {
          nom: 'MonEntite',
          departement: '75',
          siret: '12345',
        },
      ];
      const descriptionService = uneDescriptionValide(referentiel)
        .deLOrganisation(new Entite({ siret: '12345' }))
        .construis()
        .toJSON();
      await depot.nouveauService('123', { descriptionService });

      const serviceSauvegarde = await depot.services('123');
      const descriptionServiceSauvegarde =
        serviceSauvegarde[0].descriptionService;
      expect(
        descriptionServiceSauvegarde.organisationResponsable.siret
      ).to.equal('12345');
      expect(
        descriptionServiceSauvegarde.organisationResponsable.departement
      ).to.equal('75');
      expect(descriptionServiceSauvegarde.organisationResponsable.nom).to.equal(
        'MonEntite'
      );
    });

    it('chiffre les données métier avant de les stocker', async () => {
      let donneesPersistees;

      const persistanceReelle = adaptateurPersistance.sauvegardeService;
      adaptateurPersistance.sauvegardeService = (id, donnees) => {
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

    it('stocke le SHA-256 du nom du service', async () => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .donneesSerialisees();

      const idNouveau = await depot.nouveauService('123', {
        descriptionService,
      });

      const donnees = await adaptateurPersistance.service(idNouveau);
      expect(donnees.nomServiceHash).to.be('Super Service-haché256');
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

    it('lève une exception si le niveau de sécurité choisi est inférieur au niveau minimal', async () => {
      const donneesDescriptionServiceNiveau3 =
        uneDescriptionValide(referentiel).deNiveau3().donnees;
      try {
        await depot.nouveauService('123', {
          descriptionService: {
            ...donneesDescriptionServiceNiveau3,
            niveauSecurite: 'niveau1',
          },
        });
        expect().fail(
          "La création de l'homologation aurait dû lever une exception"
        );
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesNiveauSecuriteInsuffisant);
      }
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

    it("lève une exception si le siret de l'organisation responsable n'est pas renseigné", async () => {
      const descriptionSansOrganisationResponsable = uneDescriptionValide(
        referentiel
      )
        .deLOrganisation({})
        .construis();

      try {
        await depot.nouveauService('123', {
          descriptionService: descriptionSansOrganisationResponsable,
        });
        expect().fail(
          'La mise à jour de la description du service aurait dû lever une exception'
        );
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
        expect(e.message).to.equal('La propriété "entite.siret" est requise');
      }
    });

    it('lève une exception si le nom du service est déjà pris par un autre service', (done) => {
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
        .avecConstructeurDePersistance(persistance)
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
        .avecConstructeurDePersistance(persistance)
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
        .avecConstructeurDePersistance(persistance)
        .construis();

      const considereEnCours = await depot.serviceExiste('U1', 'Le S1', 'S1');
      expect(considereEnCours).to.be(false);
      const considereAutre = await depot.serviceExiste('U1', 'Le S1', 'S2');
      expect(considereAutre).to.be(true);
    });
  });

  describe("sur demande de suppression d'un service", () => {
    let adaptateurPersistance;
    let depot;

    const adaptateurChiffrement = fauxAdaptateurChiffrement();
    beforeEach(() => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
        ],
        services: [donneesService],
        autorisations: [
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees,
        ],
      });

      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        busEvenements,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });
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
          { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          { id: '000', donnees: { email: 'contributeur@mail.fr' } },
        ],
        services: [
          { id: '111', descriptionService: { nomService: 'Un service' } },
          { id: '222', descriptionService: { nomService: 'Un autre service' } },
        ],
        autorisations: [
          uneAutorisation().avecId('123').deProprietaire('999', '111').donnees,
          uneAutorisation().avecId('456').deContributeur('000', '111').donnees,
          uneAutorisation().avecId('789').deContributeur('000', '222').donnees,
        ],
      });
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        busEvenements,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
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

    it("publie sur le bus d'événements le service supprimé", async () => {
      adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          { id: '000', donnees: { email: 'contributeur@mail.fr' } },
        ],
        services: [
          { id: '111', descriptionService: { nomService: 'Un service' } },
        ],
        autorisations: [
          uneAutorisation().avecId('123').deProprietaire('999', '111').donnees,
          uneAutorisation().avecId('456').deContributeur('000', '111').donnees,
        ],
      });
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        busEvenements,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });

      await depot.supprimeHomologation('111');

      expect(busEvenements.aRecuUnEvenement(EvenementServiceSupprime)).to.be(
        true
      );
      const recu = busEvenements.recupereEvenement(EvenementServiceSupprime);
      expect(recu.idService).to.be('111');
      expect(recu.autorisations.length).to.be(2);
      expect(recu.autorisations[0].idUtilisateur).to.eql('999');
      expect(recu.autorisations[1].idUtilisateur).to.eql('000');
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
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          services: [donneesService],
        });
      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
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
          services: [donneesHomologations],
        });
      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
        .then((h) => expect(h.nombreDossiers()).to.equal(1))
        .then(() => done())
        .catch(done);
    });

    it('associe un UUID au dossier créé', (done) => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          services: [donneesService],
        });
      adaptateurUUID.genereUUID = () => '999';
      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        adaptateurUUID,
      });

      depot
        .ajouteDossierCourantSiNecessaire('123')
        .then(() => depot.service('123'))
        .then((h) => expect(h.dossiers.item(0).id).to.equal('999'))
        .then(() => done())
        .catch(done);
    });

    it("lève une exception si le service n'existe pas", (done) => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          services: [donneesService],
        });
      const depot = DepotDonneesServices.creeDepot({
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
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          services: [donneesService],
        });
      const depot = DepotDonneesServices.creeDepot({
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
        .then(() => depot.service('123'))
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
          services: [copie(donneesHomologations)],
        });
      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        adaptateurUUID,
        referentiel,
      });
      const dossier = new Dossier({ id: '999' }, referentiel);

      depot
        .enregistreDossier('123', dossier)
        .then(() => depot.service('123'))
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
          services: [copie(donneesService)],
        });
      const depot = DepotDonneesServices.creeDepot({
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
        .then(() => depot.service('123'))
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
    let adaptateurPersistance;
    let depot;
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { sixMois: { nbMoisDecalage: 6 }, unAn: {} },
      statutsAvisDossierHomologation: { favorable: {} },
      categoriesMesures: { gouvernance: {} },
      statutsMesures: { fait: {}, enCours: {} },
      mesures: { mesureA: {} },
      indiceCyber: { noteMax: 5 },
    });

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire().construis();
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
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
      adaptateurPersistance.sauvegardeService = async (id, donnees) => {
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

  describe("sur demande de duplication d'un service", () => {
    let depot;

    beforeEach(() => {
      const referentiel = Referentiel.creeReferentielVide();

      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '123', email: 'jean.dupont@mail.fr' })
        .ajouteUnService(
          unService(referentiel)
            .avecId('123-1')
            .avecNomService('Service à dupliquer').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('123', '123-1').donnees
        );

      depot = unDepotDeDonneesServices()
        .avecConstructeurDePersistance(persistance)
        .avecAdaptateurUUID(fabriqueAdaptateurUUID())
        .avecReferentiel(referentiel)
        .construis();
    });

    it("reste robuste quand le service n'est pas trouvé", async () => {
      try {
        await depot.dupliqueService('id-invalide', '123');
        expect().fail(
          'La tentative de duplication aurait dû lever une exception'
        );
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
        expect(e.message).to.equal('Service "id-invalide" non trouvé');
      }
    });

    it('peut dupliquer un service à partir de son identifiant', async () => {
      await depot.dupliqueService('123-1', '123');

      const services = await depot.services('123');

      expect(services.length).to.equal(2);
    });

    it('utilise un nom disponible pour le service dupliqué', async () => {
      await depot.dupliqueService('123-1', '123');
      await depot.dupliqueService('123-1', '123');

      // eslint-disable-next-line no-unused-vars
      const [_, s2, s3] = await depot.services('123');

      expect(s2.nomService()).to.equal('Service à dupliquer - Copie 1');
      expect(s3.nomService()).to.equal('Service à dupliquer - Copie 2');
    });
  });

  describe("sur une demande d'un index de copie disponible pour un service à dupliquer", () => {
    let adaptateurChiffrement;

    beforeEach(() => {
      adaptateurChiffrement = {
        dechiffre: async (objetDonnee) => objetDonnee,
      };
    });
    it("utilise l'index 1 si disponible", (done) => {
      const referentiel = Referentiel.creeReferentielVide();
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('A')
        .construis()
        .toJSON();
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
          services: [{ id: '123', descriptionService }],
          autorisations: [
            uneAutorisation().deProprietaire('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        referentiel,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
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
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
          services: [{ id: '123', descriptionService: copie1 }],
          autorisations: [
            uneAutorisation().deProprietaire('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        referentiel,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
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
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
          services: [
            { id: '123', descriptionService: original },
            { id: '456', descriptionService: duplication },
          ],
          autorisations: [
            uneAutorisation().deProprietaire('999', '123').donnees,
            uneAutorisation().deProprietaire('999', '456').donnees,
          ],
        });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        referentiel,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
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
          utilisateurs: [
            { id: '999', donnees: { email: 'jean.dupont@mail.fr' } },
          ],
          services: [{ id: '123', descriptionService: original }],
          autorisations: [
            uneAutorisation().deProprietaire('999', '123').donnees,
          ],
        });

      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        referentiel,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
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
      const depot = DepotDonneesServices.creeDepot({
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
        .ajouteUnService(unService().avecId('S1').donnees)
        .construis();

      let donneesPersistees;
      adaptateurPersistance.sauvegardeService = async (id, donnees) => {
        donneesPersistees = { id, donnees };
      };

      const depot = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        referentiel,
      });

      await depot.metsAJourService(service);

      expect(donneesPersistees.id).to.eql('S1');
      expect(donneesPersistees.donnees).not.to.be(undefined);
    });
  });

  describe('sur demande de mise à jour des mesures spécifiques d’un service', () => {
    let persistance;
    let depot;
    const referentiel = Referentiel.creeReferentielVide();

    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel).avecId('123').avecNomService('nom').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('789', '123').donnees
        );
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();
    });

    it('associe les mesures spécifiques au service', async () => {
      const mesures = new MesuresSpecifiques({
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      await depot.metsAJourMesuresSpecifiquesDuService('123', '789', mesures);

      const {
        mesures: { mesuresSpecifiques },
      } = await depot.service('123');
      expect(mesuresSpecifiques.nombre()).to.equal(1);
      expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
      expect(mesuresSpecifiques.item(0).description).to.equal(
        'Une mesure spécifique'
      );
    });

    it("publie un événement de 'Mesures service modifiées'", async () => {
      await depot.metsAJourMesuresSpecifiquesDuService(
        '123',
        '789',
        new MesuresSpecifiques()
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesuresServiceModifiees)
      ).to.be(true);
    });
  });

  describe("sur demande de mise à jour d'une mesure générale d’un service", () => {
    let persistance;
    let depot;
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { audit: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['audit'] },
    });

    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel).avecId('123').avecNomService('nom').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('789', '123').donnees
        );
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();
    });

    it('associe la mesure générale au service', async () => {
      const mesure = new MesureGenerale(
        { id: 'audit', statut: 'fait' },
        referentiel
      );

      await depot.metsAJourMesureGeneraleDuService('123', '789', mesure);

      const {
        mesures: { mesuresGenerales },
      } = await depot.service('123');
      expect(mesuresGenerales.nombre()).to.equal(1);
      expect(mesuresGenerales.item(0)).to.be.a(MesureGenerale);
      expect(mesuresGenerales.item(0).id).to.equal('audit');
      expect(mesuresGenerales.item(0).statut).to.equal('fait');
    });

    it("publie un événement de 'Mesures service modifiées'", async () => {
      const mesure = new MesureGenerale(
        { id: 'audit', statut: 'fait' },
        referentiel
      );

      await depot.metsAJourMesureGeneraleDuService('123', '789', mesure);

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesuresServiceModifiees)
      ).to.be(true);
    });
  });

  describe("sur demande de suppression d'un contributeur du service", () => {
    it('supprime le contributeur des responsables des mesures générales du service', async () => {
      const referentiel = Referentiel.creeReferentiel({
        mesures: { mesureA: {} },
        categoriesMesures: { gouvernance: 'Gouvernance' },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            { id: 'mesureA', statut: 'fait', responsables: ['U1', 'U2'] },
          ],
        },
        referentiel
      );
      const service = unService(referentiel)
        .avecId('123')
        .avecMesures(mesures)
        .construis();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('U2').donnees)
        .ajouteUnService(service.donneesAPersister().toutes());
      const depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();

      await depot.supprimeContributeur('123', 'U1');

      const {
        mesures: { mesuresGenerales },
      } = await depot.service('123');
      expect(mesuresGenerales.toutes()[0].responsables).to.eql(['U2']);
    });

    it('supprime le contributeur des responsables des mesures spécifiques du service', async () => {
      const referentiel = Referentiel.creeReferentielVide();
      const mesures = new Mesures(
        {
          mesuresSpecifiques: [
            {
              description: 'Une mesure spécifique',
              modalites: 'Des modalités',
              responsables: ['U1', 'U2'],
            },
          ],
        },
        referentiel
      );
      const service = unService(referentiel)
        .avecId('123')
        .avecMesures(mesures)
        .construis();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('U2').donnees)
        .ajouteUnService(service.donneesAPersister().donnees);
      const depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();

      await depot.supprimeContributeur('123', 'U1');

      const {
        mesures: { mesuresSpecifiques },
      } = await depot.service('123');
      expect(mesuresSpecifiques.toutes()[0].responsables).to.eql(['U2']);
    });
  });

  describe('sur recherche dans les autres contributeurs de ses services', () => {
    let depot;
    let adaptateurPersistance;
    let depotDonneesUtilisateurs;

    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('moi').donnees)
        .ajouteUnUtilisateur(
          unUtilisateur()
            .avecId('pasmoi')
            .quiSAppelle('Pauline Doe')
            .avecEmail('pauline.doe@mail.com').donnees
        )
        .ajouteUnService(unService().avecId('S1').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('moi', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur('pasmoi', 'S1').donnees
        )
        .construis();
      depotDonneesUtilisateurs = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
      });
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        busEvenements,
        depotDonneesUtilisateurs,
      });
    });

    it('renvoie tous les contributeurs autres que moi', async () => {
      const contributeurs = await depot.rechercheContributeurs('moi', '');

      expect(contributeurs.length).to.be(1);
      expect(contributeurs[0]).to.be.an(Utilisateur);
      expect(contributeurs[0].id).to.be('pasmoi');
    });

    it('filtre les contributeurs sur leur nom', async () => {
      adaptateurPersistance.ajouteUtilisateur(
        'U1',
        unUtilisateur().avecId('U1').quiSAppelle('Jean Valjean').donnees
      );
      adaptateurPersistance.ajouteAutorisation(
        'A1',
        uneAutorisation().deContributeur('U1', 'S1').donnees
      );

      const contributeurs = await depot.rechercheContributeurs('moi', 'alj');

      expect(contributeurs.length).to.be(1);
      expect(contributeurs[0].id).to.be('U1');
    });

    it('filtre les contributeurs sur leur prénom', async () => {
      adaptateurPersistance.ajouteUtilisateur(
        'U1',
        unUtilisateur().avecId('U1').quiSAppelle('Jean Valjean').donnees
      );
      adaptateurPersistance.ajouteAutorisation(
        'A1',
        uneAutorisation().deContributeur('U1', 'S1').donnees
      );

      const contributeurs = await depot.rechercheContributeurs('moi', 'Jean');

      expect(contributeurs.length).to.be(1);
      expect(contributeurs[0].id).to.be('U1');
    });

    it('filtre les contributeurs sur leur email', async () => {
      adaptateurPersistance.ajouteUtilisateur(
        'U1',
        unUtilisateur().avecId('U1').avecEmail('jean.valjean@mail.fr').donnees
      );
      adaptateurPersistance.ajouteAutorisation(
        'A1',
        uneAutorisation().deContributeur('U1', 'S1').donnees
      );

      const contributeurs = await depot.rechercheContributeurs(
        'moi',
        'ean.val'
      );

      expect(contributeurs.length).to.be(1);
      expect(contributeurs[0].id).to.be('U1');
    });

    it('déchiffre les données des contributeurs', async () => {
      depotDonneesUtilisateurs.dechiffreUtilisateur = (donneesUtilisateur) => {
        donneesUtilisateur.donnees.nom = `${donneesUtilisateur.donnees.nom}-nom-déchiffré`;
        return new Utilisateur({
          id: donneesUtilisateur.id,
          ...donneesUtilisateur.donnees,
        });
      };

      const contributeurs = await depot.rechercheContributeurs('moi', '');

      expect(contributeurs[0].prenomNom()).to.be('Pauline Doe-nom-déchiffré');
    });
  });
});
