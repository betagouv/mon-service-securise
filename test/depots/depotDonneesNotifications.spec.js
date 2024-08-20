const expect = require('expect.js');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const { creeDepot } = require('../../src/depots/depotDonneesNotifications');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');
const { unService } = require('../constructeurs/constructeurService');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const { creeReferentielVide } = require('../../src/referentiel');
const Service = require('../../src/modeles/service');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');

describe('Le dépôt de données des notifications', () => {
  let depotNotifications;
  let adaptateurPersistance;
  let referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();

    adaptateurPersistance = unePersistanceMemoire().construis();
    const adaptateurChiffrement = fauxAdaptateurChiffrement();
    const depotServices = DepotDonneesServices.creeDepot({
      adaptateurChiffrement,
      adaptateurPersistance,
      referentiel,
      depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
        adaptateurChiffrement,
      }),
    });
    depotNotifications = creeDepot({
      adaptateurPersistance,
      depotServices,
    });
  });

  describe("sur demande de marquage d'une nouveauté comme lue", () => {
    it("délègue à l'adaptateur persistance le marquage", async () => {
      let donneesRecues;
      adaptateurPersistance.marqueNouveauteLue = async (
        idUtilisateur,
        idNouveaute
      ) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };
      await depotNotifications.marqueNouveauteLue('U1', 'N1');

      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idNouveaute).to.be('N1');
    });
  });

  describe("sur demande de marquage d'une tâche de service comme 'lue'", () => {
    it("délègue à l'adaptateur persistance le marquage", async () => {
      let donneesRecues;
      adaptateurPersistance.marqueTacheDeServiceLue = async (idTache) => {
        donneesRecues = { idTache };
      };

      await depotNotifications.marqueTacheDeServiceLue('T1');

      expect(donneesRecues.idTache).to.be('T1');
    });
  });

  describe('sur demande de la liste des tâches de service', () => {
    it('utiliser l’adaptateur de persistance pour récupérer toutes les tâches', async () => {
      let adaptateurAppele;
      let idUtilisateurUtilise;
      adaptateurPersistance.tachesDeServicePour = async (idUtilisateur) => {
        adaptateurAppele = true;
        idUtilisateurUtilise = idUtilisateur;
        return [];
      };

      await depotNotifications.tachesDesServices('U1');

      expect(adaptateurAppele).to.be(true);
      expect(idUtilisateurUtilise).to.be('U1');
    });

    it('complète chaque tâche avec son service', async () => {
      await adaptateurPersistance.ajouteUtilisateur(
        'U1',
        unUtilisateur().avecId('U1').donnees
      );
      await adaptateurPersistance.sauvegardeService(
        'S1',
        unService(referentiel).avecNomService('Nom du service').avecId('S1')
          .donnees
      );
      await adaptateurPersistance.ajouteAutorisation(
        'A1',
        uneAutorisation().deProprietaire('U1', 'S1').donnees
      );

      adaptateurPersistance.tachesDeServicePour = async (_) => [
        { idService: 'S1' },
      ];

      const taches = await depotNotifications.tachesDesServices('U1');

      expect(taches[0].service).to.be.an(Service);
      expect(taches[0].service.nomService()).to.be('Nom du service');
    });
  });
});
