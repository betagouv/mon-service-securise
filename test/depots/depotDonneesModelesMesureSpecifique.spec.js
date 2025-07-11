const expect = require('expect.js');
const DepotDonneesModelesMesureSpecifique = require('../../src/depots/depotDonneesModelesMesureSpecifique');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
} = require('../../src/erreurs');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  let adaptateurChiffrement;
  let adaptateurPersistance;
  let adaptateurUUID;

  beforeEach(() => {
    adaptateurChiffrement = {
      chiffre: async (donnees) => ({ ...donnees, chiffree: true }),
    };
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService({
        id: 'S1',
        descriptionService: { nomService: 'Service 1' },
      })
      .ajouteUnService({
        id: 'S2',
        descriptionService: { nomService: 'Service 2' },
      })
      .ajouteUnUtilisateur({ id: 'U1' })
      .avecUnModeleDeMesureSpecifique({ id: 'MOD-1' })
      .construis();
    adaptateurUUID = {
      genereUUID: () => 'UUID-1',
    };
  });

  const unDepot = () =>
    DepotDonneesModelesMesureSpecifique.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      adaptateurUUID,
    });

  describe("concernant l'ajout d'un modèle de mesure", () => {
    it('sait ajouter un modèle en chiffrant son contenu', async () => {
      let donneesPersistees = {};
      adaptateurPersistance.ajouteModeleMesureSpecifique = async (
        idModele,
        idUtilisateur,
        donnees
      ) => {
        donneesPersistees = { idModele, idUtilisateur, donnees };
      };

      await unDepot().ajouteModeleMesureSpecifique('U1', {
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
      });

      expect(donneesPersistees.idModele).to.be('UUID-1');
      expect(donneesPersistees.idUtilisateur).to.be('U1');
      expect(donneesPersistees.donnees).to.eql({
        description: 'Une description',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
        chiffree: true,
      });
    });

    it("jette une erreur si l'utilisateur n'existe pas", async () => {
      try {
        await unDepot().ajouteModeleMesureSpecifique('U-INTROUVABLE-1', {});
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurUtilisateurInexistant);
      }
    });
  });

  describe("concernant l'association d'un modèle et de services", () => {
    it('associe les services au modèle via la persistance', async () => {
      let donneesPersistees = {};
      adaptateurPersistance.associeModeleMesureSpecifiqueAuxServices = async (
        idModele,
        idsServices
      ) => {
        donneesPersistees = { idModele, idsServices };
      };

      await unDepot().associeModeleMesureSpecifiqueAuxServices('MOD-1', [
        'S1',
        'S2',
      ]);

      expect(donneesPersistees.idModele).to.be('MOD-1');
      expect(donneesPersistees.idsServices).to.eql(['S1', 'S2']);
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      adaptateurPersistance.verifieModeleMesureSpecifiqueExiste = async () =>
        false;

      try {
        await unDepot().associeModeleMesureSpecifiqueAuxServices(
          'MOD-INTROUVABLE-1',
          ['S1']
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it("jette une erreur si au moins un des services n'existe pas", async () => {
      try {
        await unDepot().associeModeleMesureSpecifiqueAuxServices('MOD-1', [
          'S-INTROUVABLE-1',
        ]);
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
      }
    });
  });
});
