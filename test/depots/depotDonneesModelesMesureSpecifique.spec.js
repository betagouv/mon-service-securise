const expect = require('expect.js');
const DepotDonneesModelesMesureSpecifique = require('../../src/depots/depotDonneesModelesMesureSpecifique');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
} = require('../../src/erreurs');

describe('Le dépôt de données des modèles de mesure spécifique', () => {
  let adaptateurChiffrement;
  let adaptateurPersistance;
  let adaptateurUUID;

  beforeEach(() => {
    adaptateurChiffrement = {
      chiffre: async (donnees) => ({ ...donnees, chiffree: true }),
    };
    adaptateurUUID = { genereUUID: () => 'UUID-1' };
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService({
        id: 'S1',
        descriptionService: { nomService: 'Service 1' },
      })
      .ajouteUnService({
        id: 'S2',
        descriptionService: { nomService: 'Service 2' },
      })
      .avecUnModeleDeMesureSpecifique({ id: 'MOD-1' })
      .construis();
  });

  const leDepot = () =>
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
      const depot = leDepot();

      await depot.associeModeleMesureSpecifiqueAuxServices('MOD-1', [
        'S1',
        'S2',
      ]);

      expect(donneesPersistees.idModele).to.be('MOD-1');
      expect(donneesPersistees.idsServices).to.eql(['S1', 'S2']);
    });

    it("jette une erreur si le modèle n'existe pas", async () => {
      adaptateurPersistance.verifieModeleMesureSpecifiqueExiste = async () =>
        false;
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices(
          'MOD-INTROUVABLE-1',
          ['S1']
        );
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      }
    });

    it("jette une erreur si au moins un des services n'existe pas", async () => {
      const depot = leDepot();

      try {
        await depot.associeModeleMesureSpecifiqueAuxServices('MOD-1', [
          'S-INTROUVABLE-1',
        ]);
        expect().fail("L'appel aurait dû lever une erreur.");
      } catch (e) {
        expect(e).to.be.an(ErreurServiceInexistant);
      }
    });
  });
});
