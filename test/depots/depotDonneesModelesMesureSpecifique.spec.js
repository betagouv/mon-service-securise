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
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  let adaptateurChiffrement;
  let persistance;
  let adaptateurUUID;
  let depotServices;

  const leDepot = () =>
    DepotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurUUID,
      adaptateurChiffrement,
      adaptateurPersistance: persistance,
      depotAutorisations: DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance: persistance,
      }),
      depotServices,
    });

  beforeEach(() => {
    adaptateurChiffrement = fauxAdaptateurChiffrement();
    adaptateurUUID = { genereUUID: () => 'UUID-1' };
  });

  describe("concernant l'ajout d'un modèle de mesure", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();
    });

    it('sait ajouter un modèle en chiffrant son contenu', async () => {
      let donneesPersistees = {};
      adaptateurChiffrement.chiffre = async (donnees) => ({
        ...donnees,
        chiffree: true,
      });
      persistance.ajouteModeleMesureSpecifique = async (
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

  describe("concernant la mise à jour d'un modèle de mesure", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();
    });

    it("jette une erreur si l'utilisateur n'existe pas", async () => {
      const depot = leDepot();
      try {
        await depot.metsAJourModeleMesureSpecifique(
          'U-INTROUVABLE-1',
          'MOD-1',
          {}
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurUtilisateurInexistant);
      }
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      const depot = leDepot();
      try {
        await depot.metsAJourModeleMesureSpecifique('U1', 'MOD-INEXISTANT', {});
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it('sait mettre à jour le modèle en chiffrant son contenu', async () => {
      await persistance.ajouteModeleMesureSpecifique('MOD-1', 'U1', {
        description: 'avant description',
        descriptionLongue: 'avant longue',
        categorie: 'gouvernance',
      });

      let lesDonneesSontChiffrees = false;
      adaptateurChiffrement.chiffre = async (donnees) => {
        lesDonneesSontChiffrees = true;
        return donnees;
      };

      const depot = leDepot();

      await depot.metsAJourModeleMesureSpecifique('U1', 'MOD-1', {
        description: 'après description',
        descriptionLongue: 'après longue',
        categorie: 'gouvernance',
      });

      const modelesPersistes =
        await depot.lisModelesMesureSpecifiquePourUtilisateur('U1');

      expect(lesDonneesSontChiffrees).to.be(true);
      expect(modelesPersistes[0]).to.eql({
        description: 'après description',
        descriptionLongue: 'après longue',
        categorie: 'gouvernance',
        id: 'MOD-1',
        idsServicesAssocies: [],
      });
    });
  });

  describe("concernant l'association d'un modèle et de services", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoire()
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
        .nommeCommeProprietaire('U1', ['S1', 'S2'])
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'Il faut faire A,B,C' },
        })
        // U2 a seulement un modèle
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-2', idUtilisateur: 'U2' })
        .construis();

      depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: persistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance: persistance,
          adaptateurChiffrement,
        }),
      });
    });

    it('associe les services au modèle via la persistance', async () => {
      let donneesPersistees = {};
      persistance.associeModeleMesureSpecifiqueAuxServices = async (
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
      persistance.verifieModeleMesureSpecifiqueExiste = async () => false;
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
          'L\'utilisateur U2 n\'a pas les droits suffisants sur S1. Droits requis pour modifier un modèle : {"SECURISER":2}'
        );
      }
    });

    it("jette une erreur si le modèle n'appartient pas à l'utilisateur qui veut associer", async () => {
      persistance.modeleMesureSpecifiqueAppartientA = async (
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
          "L'utilisateur U-NON-PROPRIETAIRE n'est pas propriétaire du modèle MOD-1 qu'il veut modifier."
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
      persistance = unePersistanceMemoire()
        // On a un service (S10) déjà associé à deux modèles (MOD-10 et MOD-11).
        // On a un service vide (S11).
        // L'utilisateur U10 est propriétaire des services et du premier modèle.
        // L'utilisateur U11 est propriétaire du second modèle.
        // C'est un gros jeu de données… mais ça semble nécessaire pour tester nos cas.
        .ajouteUnService({
          id: 'S10',
          descriptionService: { nomService: 'Service 10' },
          mesuresSpecifiques: [{ idModele: 'MOD-10' }],
        })
        .associeLeServiceAuxModelesDeMesureSpecifique('S10', [
          'MOD-10',
          'MOD-11',
        ])
        .ajouteUnService({ id: 'S11', descriptionService: {} })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U10').donnees)
        .nommeCommeProprietaire('U10', ['S10', 'S11'])
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-10',
          idUtilisateur: 'U10',
          donnees: { description: 'Le modèle 10' },
        })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U11').donnees)
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-11', idUtilisateur: 'U11' })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U12').donnees)
        .nommeCommeProprietaire('U12', ['S10'])
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-12', idUtilisateur: 'U12' })
        .construis();

      depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: persistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance: persistance,
          adaptateurChiffrement,
        }),
      });
    });

    it('transforme la mesure spécifique liée au modèle en une mesure indépendante, mais qui reste dans le service : elle perd son `idModele`', async () => {
      const depot = leDepot();

      await depot.detacheModeleMesureSpecifiqueDesServices(
        'MOD-10',
        ['S10'],
        'U10'
      );

      const apres = await depotServices.service('S10');
      const mesureDetachee = apres.mesuresSpecifiques().toutes()[0];
      expect(mesureDetachee.toJSON().idModele).to.be(undefined);
    });

    it('supprime le lien entre le modèle et le service, dans la table de liaison', async () => {
      const avant =
        await persistance.tousServicesSontAssociesAuModeleMesureSpecifique(
          ['S10'],
          'MOD-10'
        );
      expect(avant).to.be(true);

      const depot = leDepot();
      await depot.detacheModeleMesureSpecifiqueDesServices(
        'MOD-10',
        ['S10'],
        'U10'
      );

      const apres =
        await persistance.tousServicesSontAssociesAuModeleMesureSpecifique(
          ['S10'],
          'MOD-10'
        );
      expect(apres).to.be(false);
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      persistance.verifieModeleMesureSpecifiqueExiste = async () => false;

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
          'L\'utilisateur U11 n\'a pas les droits suffisants sur S10. Droits requis pour modifier un modèle : {"SECURISER":2}'
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
          "L'utilisateur U12 n'est pas propriétaire du modèle MOD-10 qu'il veut modifier."
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

  describe("concernant la lecture des modèles de mesure spécifique d'un utilisateur", () => {
    it('retourne les modèles', async () => {
      persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-1', idUtilisateur: 'U1' })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();

      const modeles =
        await leDepot().lisModelesMesureSpecifiquePourUtilisateur('U1');

      expect(modeles).to.eql([{ id: 'MOD-1', idsServicesAssocies: [] }]);
    });

    it('déchiffre les données des modèles', async () => {
      persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'une description', chiffre: true },
        })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .construis();

      adaptateurChiffrement.dechiffre = async (donnees) => ({
        ...donnees,
        chiffre: false,
      });

      const modeles =
        await leDepot().lisModelesMesureSpecifiquePourUtilisateur('U1');

      expect(modeles[0]).to.eql({
        id: 'MOD-1',
        chiffre: false,
        description: 'une description',
        idsServicesAssocies: [],
      });
    });

    it('aggrége les identifiants des services associés', async () => {
      persistance = unePersistanceMemoire()
        .avecUnModeleDeMesureSpecifique({ id: 'MOD-1', idUtilisateur: 'U1' })
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .associeLeServiceAuxModelesDeMesureSpecifique('S1', ['MOD-1'])
        .construis();

      const modeles =
        await leDepot().lisModelesMesureSpecifiquePourUtilisateur('U1');

      expect(modeles[0].idsServicesAssocies).to.eql(['S1']);
    });
  });

  describe("concernant la suppression d'un modèle et de toutes les mesures associées", () => {
    beforeEach(() => {
      persistance = unePersistanceMemoire()
        .ajouteUnUtilisateur(unUtilisateur().avecId('U1').donnees)
        .ajouteUnUtilisateur(unUtilisateur().avecId('U12').donnees)
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-1',
          idUtilisateur: 'U1',
          donnees: { description: 'description' },
        })
        .avecUnModeleDeMesureSpecifique({
          id: 'MOD-12',
          idUtilisateur: 'U12',
          donnees: { description: 'description' },
        })
        .ajouteUnService({
          id: 'S1',
          descriptionService: { nomService: 'Service 1' },
          mesuresSpecifiques: [{ idModele: 'MOD-1' }, { idModele: 'MOD-12' }],
        })
        .nommeCommeProprietaire('U1', ['S1'])
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur('U12', 'S1').avecDroits({}).donnees
        )
        .associeLeServiceAuxModelesDeMesureSpecifique('S1', ['MOD-1', 'MOD-12'])
        .construis();
      depotServices = DepotDonneesServices.creeDepot({
        adaptateurPersistance: persistance,
        adaptateurChiffrement,
        depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance: persistance,
          adaptateurChiffrement,
        }),
      });
    });
    it('supprime le modèle', async () => {
      const depot = leDepot();
      await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
        'U1',
        'MOD-1'
      );

      const modelesVides =
        await depot.lisModelesMesureSpecifiquePourUtilisateur('U1');
      expect(modelesVides).to.eql([]);
    });

    it('supprime les associations des services à ce modèle', async () => {
      const depot = leDepot();
      await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
        'U1',
        'MOD-1'
      );

      const estAssocie =
        await persistance.tousServicesSontAssociesAuModeleMesureSpecifique(
          ['S1'],
          'MOD-1'
        );
      expect(estAssocie).to.eql(false);
    });

    it('supprime les mesures spécifiques associées au sein des services', async () => {
      const depot = leDepot();
      await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
        'U1',
        'MOD-1'
      );

      const service = await depotServices.service('S1');
      expect(service.mesuresSpecifiques().toutes().length).to.eql(1);
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      persistance.verifieModeleMesureSpecifiqueExiste = async () => false;

      const depot = leDepot();

      try {
        await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
          'U1',
          'MOD-10'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it("jette une erreur si l'utilisateur qui veut supprimer le modèle n'a pas les droits en écriture sur tous les services", async () => {
      const depot = leDepot();

      try {
        await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
          'U12',
          'MOD-12'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(
          ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        );
        expect(e.message).to.be(
          'L\'utilisateur U12 n\'a pas les droits suffisants sur S1. Droits requis pour modifier un modèle : {"SECURISER":2}'
        );
      }
    });

    it("jette une erreur si le modèle n'appartient pas à l'utilisateur qui veut supprimer", async () => {
      const depot = leDepot();

      try {
        await depot.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
          'U12',
          'MOD-1'
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurAutorisationInexistante);
        expect(e.message).to.be(
          "L'utilisateur U12 n'est pas propriétaire du modèle MOD-1 qu'il veut modifier."
        );
      }
    });
  });
});
