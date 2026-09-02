import testeurMSS from '../testeurMSS.js';
import { ErreurIdentifiantTacheInconnu } from '../../../src/erreurs.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { UUID } from '../../../src/typesBasiques.ts';
import { creeReferentiel } from '../../../src/referentiel.ts';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

describe('Le serveur MSS des routes privées /api/notifications', () => {
  const testeur = testeurMSS();

  beforeEach(async () => {
    const referentiel = creeReferentiel();
    referentiel.recharge({
      nouvellesFonctionnalites: [
        // @ts-expect-error on charge partiellement
        { id: 'N1', dateDeDeploiement: '2024-01-01' },
        // @ts-expect-error on charge partiellement
        { id: 'N2', dateDeDeploiement: '2024-02-02' },
      ],
      tachesCompletudeProfil: [],
    });
    await testeur.initialise(referentiel);
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });

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

      expect(reponse.status).toBe(200);
      expect(reponse.body.notifications.length).toBe(2);
    });
  });

  describe('quand requête PUT sur `/api/notifications/nouveautes/:id`', () => {
    it("jette une erreur si l'identifiant n'est pas connu", async () => {
      const reponse = await testeur.put(
        '/api/notifications/nouveautes/PAS_UN_ID_NOUVEAUTE'
      );

      expect(reponse.status).toBe(400);
    });

    it('délègue au centre de notification le marquage à "lue"', async () => {
      let donneesRecues;
      testeur.depotDonnees().marqueNouveauteLue = async (
        idUtilisateur: UUID,
        idNouveaute: UUID
      ) => {
        donneesRecues = { idUtilisateur, idNouveaute };
      };

      const reponse = await testeur.put('/api/notifications/nouveautes/N1');

      expect(reponse.status).toBe(200);
      expect(donneesRecues!.idUtilisateur).toBe('U1');
    });

    it("reste robuste en cas d'erreur", async () => {
      const reponse = await testeur.put(
        '/api/notifications/nouveautes/ID_INCONNU'
      );
      expect(reponse.status).toBe(400);
    });
  });

  describe('quand requête DELETE sur `/api/notifications/nouveautes/:id`', () => {
    it("jette une erreur si l'identifiant n'est pas connu", async () => {
      const reponse = await testeur.delete(
        '/api/notifications/nouveautes/PAS_UN_ID_NOUVEAUTE'
      );

      expect(reponse.status).toBe(400);
    });

    it('supprime la notification de nouveauté', async () => {
      const idUtilisateur = unUUID('D');
      testeur.middleware().reinitialise({ idUtilisateur });

      const reponse = await testeur.delete(`/api/notifications/nouveautes/N1`);

      expect(reponse.status).toBe(200);
      const notifications = await testeur
        .depotDonnees()
        .nouveautesPourUtilisateur(unUUID('D'));
      expect(notifications).toHaveLength(1);
      expect(notifications[0].supprimee).toBeTruthy();
    });
  });

  describe('quand requête PUT sur `/api/notifications/taches/:id`', () => {
    it('délègue au dépôt via le centre de notification le marquage à "lue"', async () => {
      let donneesRecues;
      const id = unUUIDRandom();
      testeur.depotDonnees().tachesDesServices = async () => [{ id }];
      testeur.depotDonnees().marqueTacheDeServiceLue = async (
        idTache: UUID
      ) => {
        donneesRecues = { idTache };
      };

      const reponse = await testeur.put(`/api/notifications/taches/${id}`);

      expect(reponse.status).toBe(200);
      expect(donneesRecues).toBeDefined();
      expect(donneesRecues!.idTache).toBe(id);
    });

    it("jette une erreur si l'identifiant n'est pas un uuid", async () => {
      testeur.depotDonnees().marqueTacheDeServiceLue = async () => {
        throw new ErreurIdentifiantTacheInconnu();
      };
      const reponse = await testeur.put('/api/notifications/taches/ID_INCONNU');
      expect(reponse.status).toBe(400);
    });

    it("reste robuste en cas d'erreur", async () => {
      testeur.depotDonnees().marqueTacheDeServiceLue = async () => {
        throw new ErreurIdentifiantTacheInconnu();
      };
      const reponse = await testeur.put(
        `/api/notifications/taches/${unUUIDRandom()}`
      );
      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('Identifiant de tâche inconnu');
    });
  });

  describe('quand requête PUT sur `/api/notifications/transactionnelles/:id`', () => {
    it("jette une erreur si l'identifiant n'est pas un uuid", async () => {
      const reponse = await testeur.put(
        '/api/notifications/transactionnelles/PAS_UN_UUID'
      );

      expect(reponse.status).toBe(400);
    });

    it('marque la notification transactionnelle lue et la persiste', async () => {
      const idUtilisateur = unUUID('D');
      testeur.middleware().reinitialise({ idUtilisateur });
      const notification = NotificationTransactionnelle.nouveau({
        idActeur: unUUID('A'),
        idDestinataire: idUtilisateur,
        type: 'mentionDansMesure',
        date: new Date(),
        metadonnees: { proprietes: 42 },
      });
      await testeur
        .depotDonnees()
        .sauvegardeNotificationTransactionnelle(notification);

      const reponse = await testeur.put(
        `/api/notifications/transactionnelles/${notification.donnees().id}`
      );

      expect(reponse.status).toBe(200);
      const notificationAJour = await testeur
        .depotDonnees()
        .lisNotificationDe(notification.donnees().id, unUUID('D'));
      expect(notificationAJour.donnees().lue).toBeTruthy();
    });

    it("jette une erreur si la notification n'existe pas", async () => {
      const reponse = await testeur.put(
        `/api/notifications/transactionnelles/${unUUIDRandom()}`
      );

      expect(reponse.status).toBe(404);
    });
  });

  describe('quand requête DELETE sur `/api/notifications/transactionnelles/:id`', () => {
    it("jette une erreur si l'identifiant n'est pas un uuid", async () => {
      const reponse = await testeur.delete(
        '/api/notifications/transactionnelles/PAS_UN_UUID'
      );

      expect(reponse.status).toBe(400);
    });

    it('supprime la notification transactionnelle', async () => {
      const idUtilisateur = unUUID('D');
      testeur.middleware().reinitialise({ idUtilisateur });
      const notification = NotificationTransactionnelle.nouveau({
        idActeur: unUUID('A'),
        idDestinataire: idUtilisateur,
        type: 'mentionDansMesure',
        date: new Date(),
        metadonnees: { proprietes: 42 },
      });
      await testeur
        .depotDonnees()
        .sauvegardeNotificationTransactionnelle(notification);

      const reponse = await testeur.delete(
        `/api/notifications/transactionnelles/${notification.donnees().id}`
      );

      expect(reponse.status).toBe(200);
      const notifications = await testeur
        .depotDonnees()
        .lisNotifications(unUUID('D'));
      expect(notifications).toHaveLength(0);
    });

    it("jette une erreur si la notification n'existe pas", async () => {
      const reponse = await testeur.delete(
        `/api/notifications/transactionnelles/${unUUIDRandom()}`
      );

      expect(reponse.status).toBe(404);
    });
  });
});
