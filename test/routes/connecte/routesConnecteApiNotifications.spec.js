const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurIdentifiantTacheInconnu } = require('../../../src/erreurs');

describe('Le serveur MSS des routes privées /api/notifications', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  beforeEach(() => {
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    testeur.referentiel().recharge({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
    });
  });

  describe('quand requête GET sur `/api/notifications`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          { method: 'post', url: 'http://localhost:1234/api/notifications' },
          done
        );
    });

    it('retourne les notifications', async () => {
      const reponse = await axios.get(
        'http://localhost:1234/api/notifications'
      );

      expect(reponse.status).to.be(200);
      expect(reponse.data.notifications.length).to.be(2);
    });
  });

  describe('quand requête PUT sur `/api/notifications/nouveautes/:id`', () => {
    it('délègue au centre de notification le marquage à "lue"', async () => {
      let donneesRecues;
      testeur.depotDonnees().marqueNouveauteLue = async (
        idUtilisateur,
        idNouveaute
      ) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };

      const reponse = await axios.put(
        'http://localhost:1234/api/notifications/nouveautes/N1'
      );

      expect(reponse.status).to.be(200);
      expect(donneesRecues.idUtilisateur).to.be('U1');
    });

    it("reste robuste en cas d'erreur", async () => {
      try {
        await axios.put(
          'http://localhost:1234/api/notifications/nouveautes/ID_INCONNU'
        );
        expect().fail("L'appel aurait dû lever une exception");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('Identifiant de nouveauté inconnu');
      }
    });
  });

  describe('quand requête PUT sur `/api/notifications/taches/:id`', () => {
    it('délègue au centre de notification le marquage à "lue"', async () => {
      let donneesRecues;
      testeur.depotDonnees().tachesDesServices = async (_) => [{ id: 'T1' }];
      testeur.depotDonnees().marqueTacheLue = async (
        idUtilisateur,
        idTache
      ) => {
        donneesRecues = { idUtilisateur, idTache };
      };

      const reponse = await axios.put(
        'http://localhost:1234/api/notifications/taches/T1'
      );

      expect(reponse.status).to.be(200);
      expect(donneesRecues).to.be.an('object');
      expect(donneesRecues.idUtilisateur).to.be('U1');
      expect(donneesRecues.idTache).to.be('T1');
    });

    it("reste robuste en cas d'erreur", async () => {
      testeur.depotDonnees().marqueTacheLue = async () => {
        throw new ErreurIdentifiantTacheInconnu();
      };
      try {
        await axios.put(
          'http://localhost:1234/api/notifications/taches/ID_INCONNU'
        );
        expect().fail("L'appel aurait dû lever une exception");
      } catch (e) {
        expect(e.response.status).to.be(400);
        expect(e.response.data).to.be('Identifiant de tâche inconnu');
      }
    });
  });
});
