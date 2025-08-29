import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { ErreurIdentifiantTacheInconnu } from '../../../src/erreurs.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';

describe('Le serveur MSS des routes privées /api/notifications', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  beforeEach(() => {
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
    testeur.referentiel().recharge({
      nouvellesFonctionnalites: [
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
      tachesCompletudeProfil: [],
    });
    testeur.depotDonnees().utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2020-01-01')
        .construis();
  });

  describe('quand requête GET sur `/api/notifications`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/notifications',
        });
    });

    it('retourne les notifications', async () => {
      const reponse = await testeur.get('/api/notifications');

      expect(reponse.status).to.be(200);
      expect(reponse.body.notifications.length).to.be(2);
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

      const reponse = await testeur.put('/api/notifications/nouveautes/N1');

      expect(reponse.status).to.be(200);
      expect(donneesRecues.idUtilisateur).to.be('U1');
    });

    it("reste robuste en cas d'erreur", async () => {
      const reponse = await testeur.put(
        '/api/notifications/nouveautes/ID_INCONNU'
      );
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('Identifiant de nouveauté inconnu');
    });
  });

  describe('quand requête PUT sur `/api/notifications/taches/:id`', () => {
    it('délègue au dépôt via le centre de notification le marquage à "lue"', async () => {
      let donneesRecues;
      testeur.depotDonnees().tachesDesServices = async (_) => [{ id: 'T1' }];
      testeur.depotDonnees().marqueTacheDeServiceLue = async (idTache) => {
        donneesRecues = { idTache };
      };

      const reponse = await testeur.put('/api/notifications/taches/T1');

      expect(reponse.status).to.be(200);
      expect(donneesRecues).to.be.an('object');
      expect(donneesRecues.idTache).to.be('T1');
    });

    it("reste robuste en cas d'erreur", async () => {
      testeur.depotDonnees().marqueTacheDeServiceLue = async () => {
        throw new ErreurIdentifiantTacheInconnu();
      };
      const reponse = await testeur.put('/api/notifications/taches/ID_INCONNU');
      expect(reponse.status).to.be(400);
      expect(reponse.text).to.be('Identifiant de tâche inconnu');
    });
  });
});
