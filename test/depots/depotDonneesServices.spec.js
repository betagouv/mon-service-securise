import expect from 'expect.js';
import uneDescriptionValide from '../constructeurs/constructeurDescriptionService.js';

import {
  ErreurDonneesObligatoiresManquantes,
  ErreurServiceInexistant,
  ErreurNomServiceDejaExistant,
  ErreurDonneesNiveauSecuriteInsuffisant,
  ErreurRisqueInconnu,
  ErreurStatutMesureManquant,
  ErreurVersionServiceIncompatible,
} from '../../src/erreurs.js';

import * as Referentiel from '../../src/referentiel.js';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import * as DepotDonneesAutorisations from '../../src/depots/depotDonneesAutorisations.js';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import Dossier from '../../src/modeles/dossier.js';
import Service from '../../src/modeles/service.js';
import MesureGenerale from '../../src/modeles/mesureGenerale.js';
import MesureSpecifique from '../../src/modeles/mesureSpecifique.js';
import RisqueGeneral from '../../src/modeles/risqueGeneral.js';
import RisqueSpecifique from '../../src/modeles/risqueSpecifique.js';
import RolesResponsabilites from '../../src/modeles/rolesResponsabilites.js';
import copie from '../../src/utilitaires/copie.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { unService } from '../constructeurs/constructeurService.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unDepotDeDonneesServices } from '../constructeurs/constructeurDepotDonneesServices.js';
import { unDossier } from '../constructeurs/constructeurDossier.js';
import {
  Rubriques,
  Permissions,
} from '../../src/modeles/autorisations/gestionDroits.js';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import EvenementNouveauServiceCree from '../../src/bus/evenementNouveauServiceCree.js';
import EvenementMesureModifieeEnMasse from '../../src/bus/evenementMesureModifieeEnMasse.js';
import { EvenementDescriptionServiceModifiee } from '../../src/bus/evenementDescriptionServiceModifiee.js';
import Mesures from '../../src/modeles/mesures.js';
import EvenementDossierHomologationFinalise from '../../src/bus/evenementDossierHomologationFinalise.js';
import EvenementServiceSupprime from '../../src/bus/evenementServiceSupprime.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import Entite from '../../src/modeles/entite.js';
import Utilisateur from '../../src/modeles/utilisateur.js';
import * as DepotDonneesUtilisateurs from '../../src/depots/depotDonneesUtilisateurs.js';
import { creeReferentielVide } from '../../src/referentiel.js';
import EvenementMesureServiceModifiee from '../../src/bus/evenementMesureServiceModifiee.js';
import EvenementMesureServiceSupprimee from '../../src/bus/evenementMesureServiceSupprimee.js';
import Risques from '../../src/modeles/risques.js';
import EvenementRisqueServiceModifie from '../../src/bus/evenementRisqueServiceModifie.js';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.js';
import { VersionService } from '../../src/modeles/versionService.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';
import EvenementServiceV1MigreEnV2 from '../../src/bus/evenementServiceV1MigreEnV2.js';

const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;
const { ECRITURE } = Permissions;

describe('Le dépôt de données des services', () => {
  let busEvenements;

  beforeEach(() => {
    busEvenements = fabriqueBusPourLesTests();
  });

  describe("sur les demandes qui concernent les services d'un utilisateur donné", () => {
    let depot;
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        naturesSuggestionsActions: { siret: {} },
      });
      const persistance = unePersistanceMemoire()
        .ajouteUnService(unService(referentiel).avecId('123').donnees)
        .ajouteUnService(unService(referentiel).avecId('789').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('456').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('456', '123').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('999', '789').donnees
        )
        .avecUneSuggestionAction({ idService: '123', nature: 'siret' });
      depot = unDepotDeDonneesServices()
        .avecConstructeurDePersistance(persistance)
        .avecReferentiel(referentiel)
        .construis();
    });

    it("connaît tous les services d'un utilisateur donné", async () => {
      const services = await depot.services('456');

      expect(services.length).to.equal(1);
      expect(services[0]).to.be.a(Service);
      expect(services[0].id).to.equal('123');
      expect(services[0].referentiel).to.equal(referentiel);

      expect(services[0].contributeurs.length).to.equal(1);
      expect(services[0].contributeurs[0].idUtilisateur).to.equal('456');

      expect(services[0].suggestionsActions.length).to.equal(1);
      expect(services[0].suggestionsActions[0].nature).to.equal('siret');
    });

    it("connaît le nombre de services d'un utilisateur donné", async () => {
      const nombreServices = await depot.nombreServices('456');

      expect(nombreServices).to.equal(1);
    });
  });

  it("utilise l'adaptateur de persistance pour récupérer tous les services du système", async () => {
    let adaptateurAppele;
    const adaptateurPersistance = unePersistanceMemoire().construis();
    adaptateurPersistance.servicesComplets = async ({ tous }) => {
      adaptateurAppele = tous;
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

  describe("sur demande de lecture d'un service", () => {
    it('peut retrouver un service à partir de son identifiant', async () => {
      const adaptateurChiffrement = {
        dechiffre: async (objetDonnee) => {
          objetDonnee.descriptionService.nomService = `${objetDonnee.descriptionService.nomService}-dechiffre`;
          return objetDonnee;
        },
      };

      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService({
          id: '789',
          descriptionService: { nomService: 'nom' },
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
      expect(service.nomService()).to.be('nom-dechiffre');
    });

    it('instancie un service v2 avec un referentiel v2', async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService({
          id: 'S1',
          descriptionService: uneDescriptionV2Valide().donneesDescription(),
          versionService: VersionService.v2,
        })
        .construis();
      const referentiel = Referentiel.creeReferentielVide();
      const referentielV2 = creeReferentielV2();
      const depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        referentiel,
        referentielV2,
      });

      const service = await depot.service('S1');

      expect(service).to.be.a(Service);
      expect(service.id).to.equal('S1');
      expect(service.referentiel.version()).to.equal('v2');
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
      expect(contributeurs[0].idUtilisateur).to.equal('U1');
      expect(contributeurs[1].idUtilisateur).to.equal('U2');
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

      expect(service.contributeurs[0].prenomNom()).to.equal('U1-déchiffré');
      expect(service.contributeurs[1].prenomNom()).to.equal('U2-déchiffré');
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

    it('associe et déchiffre les modèles de mesure spécifique', async () => {
      const r = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnService(unService(r).avecId('S1').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        )
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'une description', chiffre: true },
        });

      const depot = unDepotDeDonneesServices()
        .avecAdaptateurChiffrement({
          dechiffre: async (donnees) => ({ ...donnees, chiffre: false }),
        })
        .avecReferentiel(r)
        .avecConstructeurDePersistance(persistance)
        .construis();

      const service = await depot.service('S1');

      expect(
        service.mesuresSpecifiques().modelesDisponiblesDeMesureSpecifique
      ).to.eql({
        'MOD-1': {
          idUtilisateur: 'U1',
          description: 'une description',
          chiffre: false,
        },
      });
    });
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

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: 'S1',
      });
      expect(donnees.nomServiceHash).to.be('Nouveau Nom-haché256');
    });

    it('met à jour le SHA-256 du SIRET du service', async () => {
      const description = uneDescriptionValide(referentiel)
        .deLOrganisation({ siret: 'unSIRET' })
        .construis();

      await depot.ajouteDescriptionService('U1', 'S1', description);

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: 'S1',
      });
      expect(donnees.siretHash).to.be('unSIRET-haché256');
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
    let depot;
    let service;

    beforeEach(() => {
      valideRisque = RisqueGeneral.valide;
      RisqueGeneral.valide = () => {};
      const r = Referentiel.creeReferentielVide();
      const constructeurService = unService(r).avecId('S1');
      service = constructeurService.construis();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(r)
        .avecBusEvenements(busEvenements)
        .avecConstructeurDePersistance(
          unePersistanceMemoire().ajouteUnService(constructeurService.donnees)
        )
        .construis();
    });

    afterEach(() => (RisqueGeneral.valide = valideRisque));

    it('sait associer un risque général à un service', async () => {
      const risque = new RisqueGeneral({ id: 'R1' });
      await depot.ajouteRisqueGeneralAService(service, risque);

      const { risques } = await depot.service('S1');
      expect(risques.risquesGeneraux.nombre()).to.equal(1);
      expect(risques.risquesGeneraux.item(0)).to.be.a(RisqueGeneral);
      expect(risques.risquesGeneraux.item(0).id).to.equal('R1');
    });

    it("publie un événement de 'Risques service modifiés' avec le service à jour", async () => {
      const risque = new RisqueGeneral({ id: 'R1' });
      await depot.ajouteRisqueGeneralAService(service, risque);

      expect(
        busEvenements.aRecuUnEvenement(EvenementRisqueServiceModifie)
      ).to.be(true);
      const evenement = busEvenements.recupereEvenement(
        EvenementRisqueServiceModifie
      );
      expect(evenement.service).not.to.be(undefined);
      expect(evenement.service.id).to.be('S1');
      expect(evenement.service.risques.risquesGeneraux.nombre()).to.equal(1);
    });
  });

  describe('concernant les risques spécifiques', () => {
    let valideRisque;
    let depot;
    let referentiel;

    beforeAll(() => {
      valideRisque = RisqueSpecifique.valide;
      RisqueSpecifique.valide = () => {};
    });

    beforeEach(() => {
      const adaptateurUUID = { genereUUID: () => 'NouveauRS' };
      referentiel = Referentiel.creeReferentielVide();
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecBusEvenements(busEvenements)
        .avecConstructeurDePersistance(
          unePersistanceMemoire().ajouteUnService(
            unService(referentiel).avecId('S1').donnees
          )
        )
        .avecAdaptateurUUID(adaptateurUUID)
        .construis();
    });

    afterAll(() => (RisqueSpecifique.valide = valideRisque));

    describe("sur demande d'ajout d'un risque specifique", () => {
      it('sait associer un risque spécifique à un service', async () => {
        const risque = new RisqueSpecifique({ intitule: 'risque' });

        await depot.ajouteRisqueSpecifiqueAService('S1', risque);

        const { risques } = await depot.service('S1');
        expect(risques.risquesSpecifiques.nombre()).to.equal(1);
        expect(risques.risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
      });

      it("publie un événement de 'Risques service modifiés'", async () => {
        const risque = new RisqueSpecifique({ intitule: 'risque' });

        await depot.ajouteRisqueSpecifiqueAService('S1', risque);

        expect(
          busEvenements.aRecuUnEvenement(EvenementRisqueServiceModifie)
        ).to.be(true);
        const evenement = busEvenements.recupereEvenement(
          EvenementRisqueServiceModifie
        );
        expect(evenement.service).not.to.be(undefined);
        expect(evenement.service.id).to.be('S1');
      });
    });

    describe("sur demande de suppression d'un risque spécifique", () => {
      beforeEach(() => {
        const unRisqueExistant = new Risques(
          {
            risquesSpecifiques: [
              { id: 'RS1', categories: ['C1'], intitule: 'un risque' },
            ],
          },
          referentiel
        );
        const persistance = unePersistanceMemoire().ajouteUnService(
          unService(referentiel)
            .avecId('S1')
            .avecRisques(unRisqueExistant)
            .avecNomService('nom')
            .construis()
            .donneesAPersister().donnees
        );
        depot = unDepotDeDonneesServices()
          .avecReferentiel(referentiel)
          .avecBusEvenements(busEvenements)
          .avecConstructeurDePersistance(persistance)
          .construis();
      });

      it("sait supprimer un risque spécifique d'un service", async () => {
        await depot.supprimeRisqueSpecifiqueDuService('S1', 'RS1');

        const { risques } = await depot.service('S1');
        expect(risques.risquesSpecifiques.nombre()).to.equal(0);
      });

      it("publie un événement de 'Risques service modifiés'", async () => {
        await depot.supprimeRisqueSpecifiqueDuService('S1', 'RS1');

        expect(
          busEvenements.aRecuUnEvenement(EvenementRisqueServiceModifie)
        ).to.be(true);
        const evenement = busEvenements.recupereEvenement(
          EvenementRisqueServiceModifie
        );
        expect(evenement.service).not.to.be(undefined);
        expect(evenement.service.id).to.be('S1');
      });
    });

    describe("sur demande de mise à jour d'un risque spécifique", () => {
      let persistance;

      beforeEach(() => {
        const unRisqueExistant = new Risques(
          {
            risquesSpecifiques: [
              { id: 'RS1', categories: ['C1'], intitule: 'un risque' },
            ],
          },
          referentiel
        );
        persistance = unePersistanceMemoire().ajouteUnService(
          unService(referentiel)
            .avecId('S1')
            .avecRisques(unRisqueExistant)
            .avecNomService('nom')
            .construis()
            .donneesAPersister().donnees
        );
        depot = unDepotDeDonneesServices()
          .avecReferentiel(referentiel)
          .avecBusEvenements(busEvenements)
          .avecConstructeurDePersistance(persistance)
          .construis();
      });

      it("sait mettre à jour un risque spécifique d'un service", async () => {
        const risque = new RisqueSpecifique({
          id: 'RS1',
          intitule: 'un autre intitulé',
        });

        await depot.metsAJourRisqueSpecifiqueDuService('S1', risque);

        const { risques } = await depot.service('S1');
        expect(risques.risquesSpecifiques.nombre()).to.equal(1);
        expect(risques.risquesSpecifiques.item(0).id).to.equal('RS1');
        expect(risques.risquesSpecifiques.item(0).intitule).to.equal(
          'un autre intitulé'
        );
      });

      it('lance une exception si le risque spécifique est inconnu', async () => {
        try {
          const risque = new RisqueSpecifique({
            id: 'INTROUVABLE',
            intitule: 'un intitulé',
          });

          await depot.metsAJourRisqueSpecifiqueDuService('S1', risque);
        } catch (e) {
          expect(e).to.be.an(ErreurRisqueInconnu);
          expect(e.message).to.be('Le risque "INTROUVABLE" est introuvable.');
        }
      });

      it("publie un événement de 'Risques service modifiés'", async () => {
        const risque = new RisqueSpecifique({
          id: 'RS1',
          intitule: 'un autre intitulé',
        });

        await depot.metsAJourRisqueSpecifiqueDuService('S1', risque);

        expect(
          busEvenements.aRecuUnEvenement(EvenementRisqueServiceModifie)
        ).to.be(true);
        const evenement = busEvenements.recupereEvenement(
          EvenementRisqueServiceModifie
        );
        expect(evenement.service).not.to.be(undefined);
        expect(evenement.service.id).to.be('S1');
      });
    });

    it('génère un id pour le nouveau risque', async () => {
      const risque = new RisqueSpecifique({ intitule: 'risque' });

      await depot.ajouteRisqueSpecifiqueAService('S1', risque);

      const { risques } = await depot.service('S1');
      expect(risques.risquesSpecifiques.item(0).id).to.equal('NouveauRS');
    });
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
      referentiel = Referentiel.creeReferentiel({
        versionServiceParDefaut: 'vTest',
      });
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
      expect(donneesPersistees.chiffre).to.equal(true);
    });

    it('stocke le SHA-256 du nom du service', async () => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Super Service')
        .construis()
        .donneesSerialisees();

      const idNouveau = await depot.nouveauService('123', {
        descriptionService,
      });

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: idNouveau,
      });
      expect(donnees.nomServiceHash).to.be('Super Service-haché256');
    });

    it('stocke le SHA-256 du SIRET du service', async () => {
      const descriptionService = uneDescriptionValide(referentiel)
        .deLOrganisation({ siret: 'unSIRET' })
        .construis()
        .donneesSerialisees();

      const idNouveau = await depot.nouveauService('123', {
        descriptionService,
      });

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: idNouveau,
      });
      expect(donnees.siretHash).to.be('unSIRET-haché256');
    });

    it('stocke la version du service sans la chiffrer', async () => {
      let chiffrementFait;
      adaptateurChiffrement.chiffre = async (donneesAChiffrer) => {
        expect(donneesAChiffrer.versionService).to.be(undefined);
        chiffrementFait = true;
        return { ...donneesAChiffrer, chiffre: true };
      };

      const idNouveau = await depot.nouveauService('123', {
        versionService: 'v4',
        descriptionService: uneDescriptionValide(referentiel)
          .construis()
          .donneesSerialisees(),
      });

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: idNouveau,
      });
      expect(donnees.versionService).to.be('v4');
      expect(chiffrementFait).to.be(true);
    });

    it("utilise la version par défaut du référentiel ('v1' en Production) si aucune version n'est indiquée", async () => {
      const donneesSansVersion = {
        descriptionService: uneDescriptionValide(referentiel)
          .construis()
          .donneesSerialisees(),
      };
      const idNouveau = await depot.nouveauService('123', donneesSansVersion);

      const [donnees] = await adaptateurPersistance.servicesComplets({
        idService: idNouveau,
      });
      expect(donnees.versionService).to.be('vTest');
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
        expect().fail('La création du service aurait dû lever une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesNiveauSecuriteInsuffisant);
      }
    });

    it('lève une exception si une propriété obligatoire de la description du service est manquante', async () => {
      const donneesDescriptionServiceIncompletes = uneDescriptionValide(
        referentiel
      )
        .avecNomService('')
        .construis()
        .toJSON();

      try {
        await depot.nouveauService('123', {
          descriptionService: donneesDescriptionServiceIncompletes,
        });

        expect().fail('La création du service aurait dû lever une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
      }
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

    it('lève une exception si le nom du service est déjà pris par un autre service', async () => {
      const descriptionService = uneDescriptionValide(referentiel)
        .avecNomService('Nom service')
        .construis()
        .toJSON();

      try {
        await depot.nouveauService('123', { descriptionService });
        await depot.nouveauService('123', { descriptionService });
        expect().fail('La création du service aurait dû lever une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurNomServiceDejaExistant);
        expect(e.message).to.equal(
          'Le nom du service "Nom service" existe déjà pour un autre service'
        );
      }
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

    it('supprime le service', async () => {
      const [avant] = await adaptateurPersistance.servicesComplets({
        idService: '123',
      });
      expect(avant).to.be.an(Object);

      await depot.supprimeService('123');

      const apres = await adaptateurPersistance.servicesComplets({
        idService: '123',
      });
      expect(apres).to.eql([]);
    });

    it('supprime les autorisations associées', async () => {
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

      await depot.supprimeService('111');

      const deUtilisateur999 = await depotAutorisations.autorisations('999');
      expect(deUtilisateur999.length).to.equal(0);
      const deUtilisateur000 = await depotAutorisations.autorisations('000');
      expect(deUtilisateur000.length).to.equal(1);
      const autorisation789 = await depotAutorisations.autorisation('789');
      expect(autorisation789).not.to.be(undefined);
    });

    it('supprime les liens avec des modèles de mesure spécifique', async () => {
      let idRecu;
      adaptateurPersistance.supprimeTousLiensEntreUnServiceEtModelesMesureSpecifique =
        async (idService) => {
          idRecu = idService;
        };

      await depot.supprimeService('123');

      expect(idRecu).to.be('123');
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

      await depot.supprimeService('111');

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

    it('ne fait rien si un dossier courant existe déjà', async () => {
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

      await depot.ajouteDossierCourantSiNecessaire('123');

      const s = await depot.service('123');
      expect(s.nombreDossiers()).to.equal(1);
    });

    it("ajoute le dossier s'il n'existe pas déjà", async () => {
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

      await depot.ajouteDossierCourantSiNecessaire('123');

      const s = await depot.service('123');
      expect(s.nombreDossiers()).to.equal(1);
    });

    it('associe un UUID au dossier créé', async () => {
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

      await depot.ajouteDossierCourantSiNecessaire('123');

      const s = await depot.service('123');
      expect(s.dossiers.item(0).id).to.equal('999');
    });

    it("lève une exception si le service n'existe pas", async () => {
      const donneesService = {
        id: '123',
        descriptionService: { nomService: 'Un service' },
      };
      const adaptateurPersistance =
        AdaptateurPersistanceMemoire.nouvelAdaptateur({
          services: [donneesService],
        });
      const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance });

      try {
        await depot.ajouteDossierCourantSiNecessaire('999');
        expect().fail(
          "La tentative d'ajout de dossier aurait dû lever une exception"
        );
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
        expect(e.message).to.equal('Service "999" non trouvé');
      }
    });
  });

  describe("sur demande d'enregistrement du dossier courant", () => {
    let adaptateurUUID;
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { sixMois: {}, unAn: {} },
    });

    beforeEach(() => (adaptateurUUID = { genereUUID: () => 'un UUID' }));

    it('enregistre le dossier courant', async () => {
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

      await depot.enregistreDossier('123', dossier);

      const s = await depot.service('123');
      expect(s.nombreDossiers()).to.equal(1);
      const dossierCourant = s.dossierCourant();
      expect(dossierCourant.decision.dateHomologation).to.equal('2022-11-30');
      expect(dossierCourant.decision.dureeValidite).to.equal('sixMois');
    });

    it("n'écrase pas les autres dossiers si l'ID est différent", async () => {
      const donneesHomologations = {
        id: '123',
        donnees: {
          descriptionService: { nomService: 'Un service' },
          dossiers: [{ id: '888', finalise: true }],
        },
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
      await depot.enregistreDossier('123', dossier);

      const s = await depot.service('123');
      expect(s.nombreDossiers()).to.equal(2);
      expect(s.dossiers.item(0).id).to.equal('888');
      expect(s.dossiers.item(1).id).to.equal('999');
    });

    it('écrase les données déjà stockées avec les nouvelles données', async () => {
      const decision = {
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      };
      const donneesDossierAvecDecision = { id: '999', decision };
      const donneesService = {
        id: '123',
        donnees: {
          descriptionService: { nomService: 'Un service' },
          dossiers: [donneesDossierAvecDecision],
        },
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

      await depot.enregistreDossier('123', seulementAutorite);

      const s = await depot.service('123');
      const donneesDossierCourant = s.dossierCourant().toJSON();
      expect(donneesDossierCourant.autorite).to.eql(autorite);
      expect(donneesDossierCourant.decision).to.eql({});
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

      const { id, versionService, ...donnees } = service
        .donneesAPersister()
        .toutes();
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

    it('peut utiliser un nom et un siret prédéfini pour le service dupliqué', async () => {
      await depot.dupliqueService('123-1', '123', {
        nomService: 'Un nom prédéfini',
        siret: 'UN_SIRET',
      });

      // eslint-disable-next-line no-unused-vars
      const [_, s2] = await depot.services('123');

      expect(s2.nomService()).to.equal('Un nom prédéfini');
      expect(s2.siretDeOrganisation()).to.equal('UN_SIRET');
    });

    it("détache les mesures associées à des modèles n'appartenant pas au propriétaire dans le service dupliqué", async () => {
      const referentiel = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'description' },
        })
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-2',
          idUtilisateur: 'U2',
          donnees: { description: 'description' },
        })
        .ajouteUnService({
          id: 'S1',
          descriptionService: uneDescriptionValide(referentiel).donnees,
          mesuresSpecifiques: [{ idModele: 'MOD-1' }, { idModele: 'MOD-2' }],
        })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('U2').donnees)
        .nommeCommeProprietaire('U1', ['S1'])
        .nommeCommeProprietaire('U2', ['S1'])
        .associeLeServiceAuxModelesDeMesureSpecifique('S1', ['MOD-1', 'MOD-2'])
        .construis();

      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(persistance)
        .avecAdaptateurUUID(fabriqueAdaptateurUUID())
        .avecReferentiel(referentiel)
        .construis();

      const idServiceDuplique = await depot.dupliqueService('S1', 'U1');

      const serviceDuplique = await depot.service(idServiceDuplique);
      const toutesMesuresSpecifiques = serviceDuplique
        .mesuresSpecifiques()
        .toutes();
      expect(toutesMesuresSpecifiques.length).to.be(2);
      expect(toutesMesuresSpecifiques[0].idModele).to.be('MOD-1');
      expect(toutesMesuresSpecifiques[1].idModele).to.be(undefined);
    });

    it('associe les mesures liées à des modèles appartenant au propriétaire au service dupliqué', async () => {
      const referentiel = Referentiel.creeReferentielVide();
      const persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'description' },
        })
        .ajouteUnService({
          id: 'S1',
          descriptionService: uneDescriptionValide(referentiel).donnees,
          mesuresSpecifiques: [{ idModele: 'MOD-1' }],
        })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .nommeCommeProprietaire('U1', ['S1'])
        .associeLeServiceAuxModelesDeMesureSpecifique('S1', ['MOD-1'])
        .construis();

      let donneesRecues;
      persistance.associeModelesMesureSpecifiqueAuService = async (
        idsModeles,
        idService
      ) => {
        donneesRecues = { idsModeles, idService };
      };

      depot = unDepotDeDonneesServices()
        .avecAdaptateurPersistance(persistance)
        .avecAdaptateurUUID(fabriqueAdaptateurUUID())
        .avecReferentiel(referentiel)
        .construis();

      const idServiceDuplique = await depot.dupliqueService('S1', 'U1', null, [
        'MOD-1',
      ]);

      expect(donneesRecues.idsModeles).to.eql(['MOD-1']);
      expect(donneesRecues.idService).to.be(idServiceDuplique);
    });

    it("retourne l'id du service dupliqué", async () => {
      const idServiceDuplique = await depot.dupliqueService('123-1', '123');

      expect(idServiceDuplique).to.match(/[a-zA-Z0-9-]{36}/);
    });
  });

  describe("sur une demande d'un index de copie disponible pour un service à dupliquer", () => {
    let adaptateurChiffrement;

    beforeEach(() => {
      adaptateurChiffrement = { dechiffre: async (objetDonnee) => objetDonnee };
    });

    it("utilise l'index 1 si disponible", async () => {
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

      const index = await depot.trouveIndexDisponible('999', 'A - UnSuffixe');

      expect(index).to.equal(1);
    });

    it("incrémente l'index si nécessaire", async () => {
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

      const index = await depot.trouveIndexDisponible('999', 'A - UnSuffixe');

      expect(index).to.equal(2);
    });

    it("incrémente l'index le plus élevé", async () => {
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

      const index = await depot.trouveIndexDisponible('999', 'A - UnSuffixe');

      expect(index).to.equal(3);
    });

    it("sait extraire l'index disponible même dans des noms contenant des parenthèses", async () => {
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

      const index = await depot.trouveIndexDisponible(
        '999',
        'Service A (mairie) - Copie'
      );

      expect(index).to.equal(2);
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
        busEvenements.aRecuUnEvenement(EvenementMesureServiceModifiee)
      ).to.be(true);
    });

    it('fournit la version précédente de la mesure dans l’événement', async () => {
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'audit', statut: 'nonFait' }] },
        referentiel
      );
      const mesure = new MesureGenerale(
        { id: 'audit', statut: 'fait' },
        referentiel
      );
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel)
            .avecId('123')
            .avecMesures(mesures)
            .construis()
            .donneesAPersister().donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('789', '123').donnees
        );
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();

      await depot.metsAJourMesureGeneraleDuService('123', '789', mesure);

      const evenement = busEvenements.recupereEvenement(
        EvenementMesureServiceModifiee
      );
      expect(evenement.ancienneMesure).to.eql(
        new MesureGenerale({ id: 'audit', statut: 'nonFait' }, referentiel)
      );
      expect(evenement.nouvelleMesure).to.eql(
        new MesureGenerale({ id: 'audit', statut: 'fait' }, referentiel)
      );
      expect(evenement.typeMesure).to.be('generale');
    });
  });

  describe("sur demande de mise à jour d'une mesure spécifique d’un service", () => {
    let persistance;
    let depot;
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
      mesures: { audit: { categorie: 'gouvernance' } },
      reglesPersonnalisation: { mesuresBase: ['audit'] },
    });

    beforeEach(() => {
      const uneMesure = new Mesures(
        { mesuresSpecifiques: [{ id: 'MS1', statut: 'nonFait' }] },
        referentiel
      );
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel)
            .avecId('123')
            .avecMesures(uneMesure)
            .avecNomService('nom')
            .construis()
            .donneesAPersister().donnees
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

    it('met à jour la mesure', async () => {
      const mesure = new MesureSpecifique(
        { id: 'MS1', statut: 'fait' },
        referentiel
      );

      await depot.metsAJourMesureSpecifiqueDuService('123', '789', mesure);

      const {
        mesures: { mesuresSpecifiques },
      } = await depot.service('123');
      expect(mesuresSpecifiques.nombre()).to.equal(1);
      expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
      expect(mesuresSpecifiques.item(0).id).to.equal('MS1');
      expect(mesuresSpecifiques.item(0).statut).to.equal('fait');
    });

    it("publie un événement de 'Mesures service modifiées'", async () => {
      const mesure = new MesureSpecifique(
        { id: 'MS1', statut: 'fait' },
        referentiel
      );

      await depot.metsAJourMesureSpecifiqueDuService('123', '789', mesure);

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureServiceModifiee)
      ).to.be(true);
    });

    it('fournit la version précédente de la mesure dans l’événement', async () => {
      const mesure = new MesureSpecifique(
        { id: 'MS1', statut: 'fait' },
        referentiel
      );

      await depot.metsAJourMesureSpecifiqueDuService('123', '789', mesure);

      const evenement = busEvenements.recupereEvenement(
        EvenementMesureServiceModifiee
      );
      expect(evenement.typeMesure).to.be('specifique');
      expect(evenement.ancienneMesure).to.eql(
        new MesureSpecifique({ id: 'MS1', statut: 'nonFait' }, referentiel)
      );
      expect(evenement.nouvelleMesure).to.eql(
        new MesureSpecifique({ id: 'MS1', statut: 'fait' }, referentiel)
      );
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

  describe('sur demande de tous les services', () => {
    let depot;
    let adaptateurPersistance;
    let depotDonneesUtilisateurs;
    let referentiel;

    beforeEach(() => {
      referentiel = creeReferentielVide();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('moi').donnees)
        .ajouteUnService(unService(referentiel).avecId('S1').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('moi', 'S1').donnees
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
        referentiel,
      });
    });

    it('récupère les contributeurs', async () => {
      const tousLesServices = await depot.tousLesServices();

      expect(tousLesServices[0].contributeurs.length).to.be(1);
    });
  });

  describe('sur demande de tous les services associés à un SIRET', () => {
    let depot;
    let adaptateurPersistance;
    let depotDonneesUtilisateurs;
    let referentiel;

    beforeEach(() => {
      referentiel = creeReferentielVide();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('moi').donnees)
        .ajouteUnService(
          unService(referentiel)
            .avecId('S1')
            .avecOrganisationResponsable({ siret: 'unSIRET' }).donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('moi', 'S1').donnees
        )
        .construis();
      depotDonneesUtilisateurs = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
      });
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
        adaptateurPersistance,
        depotDonneesUtilisateurs,
        referentiel,
      });
    });

    it('délègue à la persistance la lecture de ces services', async () => {
      let hashSiretRecu;
      depot = DepotDonneesServices.creeDepot({
        adaptateurChiffrement: {
          hacheSha256: (chaine) => `${chaine}-SHA256`,
        },
        adaptateurPersistance: {
          servicesComplets: async ({ hashSiret }) => {
            hashSiretRecu = hashSiret;
            return [];
          },
        },
      });

      await depot.tousLesServicesAvecSiret('unSIRET');

      expect(hashSiretRecu).to.be('unSIRET-SHA256');
    });

    it('enrichis les services récupérés', async () => {
      const services = await depot.tousLesServicesAvecSiret('unSIRET');

      expect(services[0].contributeurs.length).to.be(1);
    });
  });

  describe("sur demande d'ajout de mesure spécifique", () => {
    let depot;
    let adaptateurPersistance;
    let depotDonneesUtilisateurs;
    let referentiel;

    beforeEach(() => {
      referentiel = creeReferentielVide();
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('moi').donnees)
        .ajouteUnService(unService(referentiel).avecId('S1').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('moi', 'S1').donnees
        );
      depotDonneesUtilisateurs = DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance: adaptateurPersistance.construis(),
        adaptateurChiffrement: fauxAdaptateurChiffrement(),
      });
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(adaptateurPersistance)
        .avecBusEvenements(busEvenements)
        .avecDepotDonneesUtilisateurs(depotDonneesUtilisateurs)
        .construis();
    });

    it('ajoute la mesure aux mesures spécifiques du service', async () => {
      const mesure = new MesureSpecifique({}, referentiel);

      await depot.ajouteMesureSpecifiqueAuService(mesure, 'moi', 'S1');

      const service = await depot.service('S1');
      expect(service.mesures.nombreMesuresSpecifiques()).to.be(1);
    });

    it("publie un événement de 'Mesure service modifiée'", async () => {
      const mesure = new MesureSpecifique({}, referentiel);

      await depot.ajouteMesureSpecifiqueAuService(mesure, 'moi', 'S1');

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureServiceModifiee)
      ).to.be(true);
      expect(
        busEvenements.recupereEvenement(EvenementMesureServiceModifiee)
          .nouvelleMesure
      ).to.be(mesure);
    });

    it('affecte un id à la mesure', async () => {
      const mesure = new MesureSpecifique({}, referentiel);

      await depot.ajouteMesureSpecifiqueAuService(mesure, 'moi', 'S1');

      const service = await depot.service('S1');
      expect(service.mesures.mesuresSpecifiques.item(0).id).to.be('unUUID');
    });
  });

  describe('sur demande de suppression de mesure spécifique', () => {
    let depot;
    let referentiel;
    let persistance;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
      const uneMesure = new Mesures(
        { mesuresSpecifiques: [{ id: 'MS1', statut: 'nonFait' }] },
        referentiel
      );
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('789').donnees)
        .ajouteUnService(
          unService(referentiel)
            .avecId('123')
            .avecMesures(uneMesure)
            .avecNomService('nom')
            .construis()
            .donneesAPersister().donnees
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

    it('retire la mesure des mesures spécifiques du service', async () => {
      await depot.supprimeMesureSpecifiqueDuService('123', '789', 'MS1');

      const service = await depot.service('123');
      expect(service.mesures.nombreMesuresSpecifiques()).to.be(0);
    });

    it("publie un événement de 'Mesure service supprimé'", async () => {
      await depot.supprimeMesureSpecifiqueDuService('123', '789', 'MS1');

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureServiceSupprimee)
      ).to.be(true);
      const evenement = busEvenements.recupereEvenement(
        EvenementMesureServiceSupprimee
      );
      expect(evenement.utilisateur.id).to.be('789');
      expect(evenement.idMesure).to.be('MS1');
    });
  });

  describe("sur demande de mise à jour d'une mesure générale pour plusieurs services", () => {
    let depot;
    let referentiel;
    let persistance;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: { uneMesure: {} },
        statutsMesures: { fait: {}, nonFait: {} },
        prioritesMesures: { p1: {} },
      });
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            {
              id: 'uneMesure',
              statut: 'nonFait',
              modalites: 'une modalité',
              priorite: 'p1',
            },
          ],
        },
        referentiel,
        {
          uneMesure: { categorie: 'gouvernance' },
        }
      );
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnService(
          unService(referentiel).avecId('S1').construis().donneesAPersister()
            .donnees
        )
        .ajouteUnService(
          unService(referentiel)
            .avecId('S2')
            .avecMesures(mesures)
            .construis()
            .donneesAPersister().donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S2').donnees
        );
      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();
    });

    it('jette une erreur si une modification des modalités seules est tentée sur une mesure sans statut', async () => {
      try {
        await depot.metsAJourMesureGeneraleDesServices(
          'U1',
          ['S1'],
          'uneMesure',
          '',
          'une modalité',
          'v1'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e).to.be.an(ErreurStatutMesureManquant);
      }
    });

    it('jette une erreur si une modification de mesure est tentée sur des services de version différente', async () => {
      try {
        await depot.metsAJourMesureGeneraleDesServices(
          'U1',
          ['S1'],
          'uneMesure',
          '',
          'une modalité',
          'v2'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e).to.be.an(ErreurVersionServiceIncompatible);
      }
    });

    it('met à jour la mesure générale pour un service', async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S2'],
        'uneMesure',
        'fait',
        'une nouvelle modalité',
        'v1'
      );

      const serviceAJour = await depot.service('S2');
      const mesureAJour = serviceAJour.mesuresGenerales().avecId('uneMesure');

      expect(mesureAJour.statut).to.be('fait');
      expect(mesureAJour.modalites).to.be('une nouvelle modalité');
    });

    it('met à jour la mesure personnalisée pour un service', async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S1'],
        'uneMesure',
        'fait',
        'une nouvelle modalité',
        'v1'
      );

      const serviceAJour = await depot.service('S1');
      const mesureAJour = serviceAJour.mesuresGenerales().avecId('uneMesure');

      expect(mesureAJour.statut).to.be('fait');
      expect(mesureAJour.modalites).to.be('une nouvelle modalité');
    });

    it('met à jour la mesure générale sans écraser les informations existantes', async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S2'],
        'uneMesure',
        'fait',
        'une nouvelle modalité',
        'v1'
      );

      const serviceAJour = await depot.service('S2');
      const mesureAJour = serviceAJour.mesuresGenerales().avecId('uneMesure');

      expect(mesureAJour.priorite).to.be('p1');
    });

    it('sait mettre à jour uniquement la modalité si elle est définie', async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S2'],
        'uneMesure',
        '',
        'une nouvelle modalité',
        'v1'
      );

      const serviceAJour = await depot.service('S2');
      const mesureAJour = serviceAJour.mesuresGenerales().avecId('uneMesure');

      expect(mesureAJour.statut).to.be('nonFait');
      expect(mesureAJour.modalites).to.be('une nouvelle modalité');
    });

    it("sait mettre à jour uniquement le statut s'il est défini", async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S2'],
        'uneMesure',
        'fait',
        '',
        'v1'
      );

      const serviceAJour = await depot.service('S2');
      const mesureAJour = serviceAJour.mesuresGenerales().avecId('uneMesure');

      expect(mesureAJour.statut).to.be('fait');
      expect(mesureAJour.modalites).to.be('une modalité');
    });

    it("publie un événement de 'Mesure service modifiée' pour chaque service", async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S1', 'S2'],
        'uneMesure',
        'fait',
        '',
        'v1'
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureServiceModifiee)
      ).to.be(true);
      const tousEvenements = busEvenements.recupereEvenements(
        EvenementMesureServiceModifiee
      );
      expect(tousEvenements.length).to.be(2);
      expect(tousEvenements[0].ancienneMesure).to.be(undefined);
      expect(tousEvenements[0].nouvelleMesure.id).to.be('uneMesure');
      expect(tousEvenements[0].service.id).to.be('S1');
      expect(tousEvenements[1].ancienneMesure.id).to.be('uneMesure');
      expect(tousEvenements[1].nouvelleMesure.id).to.be('uneMesure');
      expect(tousEvenements[1].service.id).to.be('S2');
    });

    it("publie un événement de 'Mesure modifiée en masse'", async () => {
      await depot.metsAJourMesureGeneraleDesServices(
        'U1',
        ['S1', 'S2'],
        'uneMesure',
        'fait',
        '',
        'v1'
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureModifieeEnMasse)
      ).to.be(true);
      const evenement = busEvenements.recupereEvenement(
        EvenementMesureModifieeEnMasse
      );
      expect(evenement.utilisateur.id).to.be('U1');
      expect(evenement.idMesure).to.be('uneMesure');
      expect(evenement.statutModifie).to.be(true);
      expect(evenement.modalitesModifiees).to.be(false);
      expect(evenement.nombreServicesConcernes).to.be(2);
      expect(evenement.type).to.be('generale');
    });
  });

  describe('sur demande de mise à jour de mesures spécifiques pour plusieurs services', () => {
    let depot;
    let referentiel;
    let persistance;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        statutsMesures: { fait: {}, nonFait: {} },
        prioritesMesures: { p1: {} },
        categoriesMesures: { gouvernance: {} },
      });
      const mesuresDeS1 = new Mesures(
        { mesuresSpecifiques: [{ idModele: 'MOD1', id: 'MS1' }] },
        referentiel,
        {},
        { MOD1: { categorie: 'gouvernance' } }
      );
      const mesuresDeS2 = new Mesures(
        {
          mesuresSpecifiques: [
            {
              idModele: 'MOD1',
              id: 'MS2',
              statut: 'nonFait',
              modalites: 'une modalité',
              priorite: 'p1',
            },
          ],
        },
        referentiel,
        {},
        { MOD1: { categorie: 'gouvernance' } }
      );

      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD1',
          idUtilisateur: 'U1',
          donnees: { categorie: 'gouvernance' },
        })
        .ajouteUnService(
          unService(referentiel)
            .avecId('S1')
            .avecMesures(mesuresDeS1)
            .construis()
            .donneesAPersister().donnees
        )
        .associeLeServiceAuxModelesDeMesureSpecifique('S1', ['MOD1'])
        .ajouteUnService(
          unService(referentiel)
            .avecId('S2')
            .avecMesures(mesuresDeS2)
            .construis()
            .donneesAPersister().donnees
        )
        .associeLeServiceAuxModelesDeMesureSpecifique('S2', ['MOD1'])
        .nommeCommeProprietaire('U1', ['S1', 'S2']);

      depot = unDepotDeDonneesServices()
        .avecReferentiel(referentiel)
        .avecConstructeurDePersistance(persistance)
        .avecBusEvenements(busEvenements)
        .construis();
    });

    it('jette une erreur si une modification des modalités seules est tentée sur une mesure sans statut', async () => {
      try {
        await depot.metsAJourMesuresSpecifiquesDesServices(
          'U1',
          ['S1'],
          'MOD1',
          '',
          'une modalité'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e).to.be.an(ErreurStatutMesureManquant);
      }
    });

    it('met à jour les mesures spécifiques pour des services', async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S1', 'S2'],
        'MOD1',
        'fait',
        'une nouvelle modalité'
      );

      const s1Apres = await depot.service('S1');
      const mesureDeS1AJour = s1Apres.mesuresSpecifiques().avecId('MS1');
      expect(mesureDeS1AJour.statut).to.be('fait');
      expect(mesureDeS1AJour.modalites).to.be('une nouvelle modalité');
      const s2Apres = await depot.service('S2');
      const mesureDeS2AJour = s2Apres.mesuresSpecifiques().avecId('MS2');
      expect(mesureDeS2AJour.statut).to.be('fait');
      expect(mesureDeS2AJour.modalites).to.be('une nouvelle modalité');
    });

    it('met à jour la mesure spécifique sans écraser les informations existantes', async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S2'],
        'MOD1',
        'fait',
        'une nouvelle modalité'
      );

      const s2Apres = await depot.service('S2');
      const mesureAJour = s2Apres.mesuresSpecifiques().avecId('MS2');
      expect(mesureAJour.priorite).to.be('p1');
    });

    it('sait mettre à jour uniquement la modalité si elle est définie', async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S2'],
        'MOD1',
        '',
        'une nouvelle modalité'
      );

      const s2Apres = await depot.service('S2');
      const mesureAJour = s2Apres.mesuresSpecifiques().avecId('MS2');
      expect(mesureAJour.statut).to.be('nonFait');
      expect(mesureAJour.modalites).to.be('une nouvelle modalité');
    });

    it("sait mettre à jour uniquement le statut s'il est défini", async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S2'],
        'MOD1',
        'fait',
        ''
      );

      const s2Apres = await depot.service('S2');
      const mesureAJour = s2Apres.mesuresSpecifiques().avecId('MS2');
      expect(mesureAJour.statut).to.be('fait');
      expect(mesureAJour.modalites).to.be('une modalité');
    });

    it("publie un événement de 'Mesure service modifiée' pour chaque service", async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S1', 'S2'],
        'MOD1',
        'fait',
        ''
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureServiceModifiee)
      ).to.be(true);
      const tousEvenements = busEvenements.recupereEvenements(
        EvenementMesureServiceModifiee
      );
      expect(tousEvenements.length).to.be(2);
      expect(tousEvenements[0].ancienneMesure.id).to.be('MS1');
      expect(tousEvenements[0].nouvelleMesure.id).to.be('MS1');
      expect(tousEvenements[0].service.id).to.be('S1');
      expect(tousEvenements[0].typeMesure).to.be('specifique');
      expect(tousEvenements[1].ancienneMesure.id).to.be('MS2');
      expect(tousEvenements[1].nouvelleMesure.id).to.be('MS2');
      expect(tousEvenements[1].service.id).to.be('S2');
      expect(tousEvenements[1].typeMesure).to.be('specifique');
    });

    it("publie un événement de 'Mesure modifiée en masse'", async () => {
      await depot.metsAJourMesuresSpecifiquesDesServices(
        'U1',
        ['S1', 'S2'],
        'MOD1',
        'fait',
        ''
      );

      expect(
        busEvenements.aRecuUnEvenement(EvenementMesureModifieeEnMasse)
      ).to.be(true);
      const evenement = busEvenements.recupereEvenement(
        EvenementMesureModifieeEnMasse
      );
      expect(evenement.utilisateur.id).to.be('U1');
      expect(evenement.idMesure).to.be(undefined);
      expect(evenement.statutModifie).to.be(true);
      expect(evenement.modalitesModifiees).to.be(false);
      expect(evenement.nombreServicesConcernes).to.be(2);
      expect(evenement.type).to.be('specifique');
    });
  });

  describe("sur demande de migration d'un service en V2", () => {
    let depot;
    let persistance;
    let referentiel;
    const referentielV2 = creeReferentielV2();

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        statutsMesures: { fait: {}, nonFait: {} },
      });
      busEvenements = fabriqueBusPourLesTests();
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnService(
          unService(referentiel).avecId('S1').construis().donneesAPersister()
            .donnees
        )
        .nommeCommeProprietaire('U1', ['S1'])
        .construis();

      depot = unDepotDeDonneesServices()
        .avecBusEvenements(busEvenements)
        .avecAdaptateurPersistance(persistance)
        .avecReferentiel(referentiel)
        .avecReferentielV2(referentielV2)
        .construis();
    });

    it('mets à jour le service et le sauvegarde', async () => {
      await depot.migreServiceVersV2(
        'U1',
        'S1',
        uneDescriptionV2Valide().avecNomService('Un nouveau nom').construis(),
        [{ id: 'RECENSEMENT.1', statut: 'fait' }]
      );

      const [{ versionService, donnees }] = await persistance.servicesComplets({
        idService: 'S1',
      });
      expect(versionService).to.be('v2');
      expect(donnees.descriptionService.nomService).to.be('Un nouveau nom');
    });

    it('publie un événement de « service v1 migré en v2»', async () => {
      await depot.migreServiceVersV2(
        'U1',
        'S1',
        uneDescriptionV2Valide().construis(),
        []
      );

      expect(busEvenements.aRecuUnEvenement(EvenementServiceV1MigreEnV2)).to.be(
        true
      );
      const evenement = busEvenements.recupereEvenement(
        EvenementServiceV1MigreEnV2
      );
      expect(evenement.service.id).to.be('S1');
      expect(evenement.utilisateur.id).to.be('U1');
    });

    it("délègue au dépôt de données des suggestions d'action la suppression des suggestion du service migré", async () => {
      let idRecu;
      const depotSuggestions = {
        supprimeSuggestionsActionsPourService: (idService) => {
          idRecu = idService;
        },
      };

      depot = unDepotDeDonneesServices()
        .avecBusEvenements(busEvenements)
        .avecAdaptateurPersistance(persistance)
        .avecReferentiel(referentiel)
        .avecReferentielV2(referentielV2)
        .avecDepotDonneesSuggestionsActions(depotSuggestions)
        .construis();

      await depot.migreServiceVersV2(
        'U1',
        'S1',
        uneDescriptionV2Valide().avecNomService('Un nouveau nom').construis(),
        [{ id: 'RECENSEMENT.1', statut: 'fait' }]
      );

      expect(idRecu).to.be('S1');
    });
  });
});
