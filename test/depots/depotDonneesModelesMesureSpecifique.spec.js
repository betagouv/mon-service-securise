const expect = require('expect.js');
const DepotDonneesModelesMesureSpecifique = require('../../src/depots/depotDonneesModelesMesureSpecifique');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurAutorisationInexistante,
  ErreurServiceNonAssocieAuModele,
} = require('../../src/erreurs');
const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  let adaptateurChiffrement;
  let adaptateurPersistance;
  let adaptateurUUID;
  let depotServices;

  const leDepot = () =>
    DepotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurUUID,
      adaptateurChiffrement,
      adaptateurPersistance,
      depotAutorisations: DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance,
      }),
      depotServices,
    });

  beforeEach(() => {
    adaptateurChiffrement = fauxAdaptateurChiffrement();
    adaptateurUUID = { genereUUID: () => 'UUID-1' };
  });

  describe("concernant l'ajout d'un modèle de mesure", () => {
    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();
    });

    it('sait ajouter un modèle en chiffrant son contenu', async () => {
      let donneesPersistees = {};
      adaptateurChiffrement.chiffre = async (donnees) => ({
        ...donnees,
        chiffree: true,
      });
      adaptateurPersistance.ajouteModeleMesureSpecifique = async (
        idModele,
        idUtilisateur,
        donnees
      ) => {
        donneesPersistees = { idModele, idUtilisateur, donnees };
      };
      const depot = leDepot();

      await depot.ajouteModeleMesureSpecifique('U1', {
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });

      expect(donneesPersistees.idModele).to.be('UUID-1');
      expect(donneesPersistees.idUtilisateur).to.be('U1');
      expect(donneesPersistees.donnees).to.eql({
        chiffree: true,
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });
    });

    it("jette une erreur si l'utilisateur n'existe pas", async () => {
      const depot = leDepot();
      try {
        await depot.ajouteModeleMesureSpecifique('U-INTROUVABLE-1', {});
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurUtilisateurInexistant);
      }
    });
  });

  describe("concernant l'association d'un modèle et de services", () => {
    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService({
          id: 'S1',
          descriptionService: { nomService: 'Service 1' },
        })
        .ajouteUnService({
          id: 'S2',
          descriptionService: { nomService: 'Service 2' },
        })
        // U1 a deux services et un modèle
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U1', 'S2').donnees
        )
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'Il faut faire A,B,C' },
        })
        // U2 a seulement un modèle
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-2', idUtilisateur: 'U2' })
        .construis();

      depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });
    });

    it('associe les services au modèle via la persistance', async () => {
      let donneesPersistees = {};
      adaptateurPersistance.associeModeleMesureSpecifiqueAuxServices = async (
        idModele,
        idsServices
      ) => {
        donneesPersistees = { idModele, idsServices };
      };
      const depot = leDepot();

      await depot.associeModeleMesureSpecifiqueAuxServices(
        'MOD-1',
        ['S1', 'S2'],
        'U1'
      );

      expect(donneesPersistees.idModele).to.be('MOD-1');
      expect(donneesPersistees.idsServices).to.eql(['S1', 'S2']);
    });

    it("met à jour chaque service pour qu'il connaisse la mesure associée", async () => {
      let compteur = 0;
      adaptateurUUID = {
        genereUUID: () => {
          compteur += 1;
          return `UUID-${compteur}`;
        },
      };
      const depot = leDepot();

      await depot.associeModeleMesureSpecifiqueAuxServices(
        'MOD-1',
        ['S1', 'S2'],
        'U1'
      );

      const s1 = await depotServices.service('S1');
      expect(s1.mesuresSpecifiques().toutes()[0].toJSON()).to.eql({
        idModele: 'MOD-1',
        id: 'UUID-1',
        statut: 'aLancer',
        responsables: [],
        description: 'Il faut faire A,B,C',
      });
      const s2 = await depotServices.service('S2');
      expect(s2.mesuresSpecifiques().toutes()[0].toJSON()).to.eql({
        idModele: 'MOD-1',
        id: 'UUID-2',
        statut: 'aLancer',
        responsables: [],
        description: 'Il faut faire A,B,C',
      });
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      adaptateurPersistance.verifieModeleMesureSpecifiqueExiste = async () =>
        false;
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-INTROUVABLE-1',
          ['S1'],
          'U1'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it("jette une erreur si au moins un des services n'existe pas", async () => {
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-1',
          ['S-INTROUVABLE-1'],
          'U1'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
      }
    });

    it("jette une erreur si l'utilisateur qui veut associer la mesure n'a pas les droits en écriture sur tous les services", async () => {
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-2',
          ['S1'],
          'U2'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(
          ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        );
        expect(e.message).to.be(
          'L\'utilisateur U2 n\'a pas les droits suffisants sur S1. Droits requis pour associer/détacher un modèle : {"SECURISER":2}'
        );
      }
    });

    it("jette une erreur si le modèle n'appartient pas à l'utilisateur qui veut associer", async () => {
      adaptateurPersistance.modeleMesureSpecifiqueAppartientA = async (
        idUtilisateur,
        idModele
      ) => {
        if (idUtilisateur !== 'U-NON-PROPRIETAIRE' || idModele !== 'MOD-1')
          throw new Error('Adaptateur mal appelé');
        return false;
      };
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-1',
          ['S1'],
          'U-NON-PROPRIETAIRE'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurAutorisationInexistante);
        expect(e.message).to.be(
          "L'utilisateur U-NON-PROPRIETAIRE n'est pas propriétaire du modèle MOD-1 qu'il veut associer/détacher"
        );
      }
    });

    it("ne modifie aucun service si l'un des services est déjà associé au modèle : pour garder une cohérence globale", async () => {
      const depot = leDepot();

      await depot.associeModeleMesureSpecifiqueAuxServices(
        'MOD-1',
        ['S1'],
        'U1'
      );
      const apresUneAssociation = await depotServices.service('S1');
      expect(apresUneAssociation.mesuresSpecifiques().toutes().length).to.be(1);

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-1',
          ['S1', 'S2'],
          'U1'
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        const s1ApresTentative = await depotServices.service('S1');
        expect(s1ApresTentative.mesuresSpecifiques().toutes().length).to.be(1);

        const s2ApresTentative = await depotServices.service('S2');
        expect(s2ApresTentative.mesuresSpecifiques().toutes().length).to.be(0);
      }
    });
  });

  describe('concernant le détachement entre un modèle de mesure et des services y étant associés', () => {
    beforeEach(() => {
      adaptateurPersistance = unePersistanceMemoire()
        // S10 est déjà associé à MOD-10 et MOD-11
        .ajouteUnService({
          id: 'S10',
          descriptionService: { nomService: 'Service 10' },
          mesuresSpecifiques: [{ idModele: 'MOD-10' }, { idModele: 'MOD-11' }],
        })
        .associeLeServiceAuxModelesDeMesureSpecifique('S10', [
          'MOD-10',
          'MOD-11',
        ])
        .ajouteUnService({ id: 'S11', descriptionService: {} })
        // U10 a un service et un modèle
        .ajouteUnUtilisateur(unUtilisateur().avecId('U10').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U10', 'S10').donnees
        )
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-10',
          idUtilisateur: 'U10',
          donnees: { description: 'Le modèle 10' },
        })
        // U11 a seulement un modèle
        .ajouteUnUtilisateur(unUtilisateur().avecId('U11').donnees)
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-11',
          idUtilisateur: 'U11',
        })
        // U12 est seulement propriétaire de S10
        .ajouteUnUtilisateur(unUtilisateur().avecId('U12').donnees)
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U12', 'S10').donnees
        )
        .construis();

      depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement,
        }),
      });
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      adaptateurPersistance.verifieModeleMesureSpecifiqueExiste = async () =>
        false;

      const depot = leDepot();

      try {
        await depot.detacheModeleMesureSpecifiqueDesServices(
          'MOD-10',
          ['S10'],
          'U10'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it("jette une erreur dès qu'un service n'est pas associé au modèle", async () => {
      const depot = leDepot();

      try {
        await depot.detacheModeleMesureSpecifiqueDesServices(
          'MOD-10',
          ['S11'],
          'U10'
        );
        expect().fail("L'appel aurait du lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceNonAssocieAuModele);
        expect(e.message).to.be(
          'Les services [S11] ne sont pas tous associés au modèle MOD-10'
        );
      }
    });

    it("jette une erreur si l'utilisateur qui veut détacher la mesure n'a pas les droits en écriture sur tous les services", async () => {
      const depot = leDepot();

      try {
        await depot.detacheModeleMesureSpecifiqueDesServices(
          'MOD-11',
          ['S10'],
          'U11'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(
          ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        );
        expect(e.message).to.be(
          'L\'utilisateur U11 n\'a pas les droits suffisants sur S10. Droits requis pour associer/détacher un modèle : {"SECURISER":2}'
        );
      }
    });

    it("jette une erreur si le modèle n'appartient pas à l'utilisateur qui veut détacher", async () => {
      const depot = leDepot();

      try {
        await depot.detacheModeleMesureSpecifiqueDesServices(
          'MOD-10',
          ['S10'],
          'U12'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurAutorisationInexistante);
        expect(e.message).to.be(
          "L'utilisateur U12 n'est pas propriétaire du modèle MOD-10 qu'il veut associer/détacher"
        );
      }
    });

    it("jette une erreur si au moins un des services n'existe pas", async () => {
      const depot = leDepot();

      try {
        await depot.detacheModeleMesureSpecifiqueDesServices(
          'MOD-10',
          ['S-INTROUVABLE-1'],
          'U10'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
      }
    });
  });
});
