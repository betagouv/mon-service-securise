import testeurMSS from '../testeurMSS.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

describe('Le serveur MSS des routes privées /api/cles-api', () => {
  const testeur = testeurMSS();

  beforeEach(async () => {
    await testeur.initialise();
    testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
  });

  describe('quand requête POST sur `/api/cles-api`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/cles-api',
        });
    });

    it("répond 404 si l'utilisateur n'a pas accès à la fonctionnalité", async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecAccesCreationCleApi: () => false,
      });

      const reponse = await testeur.post('/api/cles-api', {
        dureeValiditeEnJours: 30,
      });

      expect(reponse.status).toBe(404);
    });

    it('refuse une durée de validité qui ne fait pas partie des choix proposés', async () => {
      const reponse = await testeur.post('/api/cles-api', {
        dureeValiditeEnJours: 45,
      });

      expect(reponse.status).toBe(400);
    });

    it("crée une clé pour l'utilisateur courant, avec la durée de validité demandée", async () => {
      await testeur.post('/api/cles-api', { dureeValiditeEnJours: 60 });

      const [cle] = await testeur.depotDonnees().lisClesDe('U1');
      const { idUtilisateur, dateCreation, dateExpiration } = cle.donnees();
      const differenceEnJours =
        (dateExpiration.getTime() - dateCreation.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(idUtilisateur).toBe('U1');
      expect(differenceEnJours).toBeCloseTo(60, 5);
    });

    it('renvoie la valeur en clair de la clé, une seule fois, avec ses informations publiques', async () => {
      const reponse = await testeur.post('/api/cles-api', {
        dureeValiditeEnJours: 30,
      });

      expect(reponse.status).toBe(201);
      expect(reponse.body.valeurEnClair).toMatch(/^mss_live_/);
      expect(Object.keys(reponse.body).sort()).toEqual(
        [
          'dateCreation',
          'dateExpiration',
          'id',
          'prefixe',
          'valeurEnClair',
        ].sort()
      );
    });
  });

  describe('quand requête DELETE sur `/api/cles-api/:id`', () => {
    it("vérifie que l'utilisateur a accepté les CGU", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: `/api/cles-api/${unUUIDRandom()}`,
        });
    });

    it("répond 404 si l'utilisateur n'a pas accès à la fonctionnalité", async () => {
      testeur.adaptateurEnvironnement().featureFlag = () => ({
        avecAccesCreationCleApi: () => false,
      });

      const reponse = await testeur.delete(`/api/cles-api/${unUUIDRandom()}`);

      expect(reponse.status).toBe(404);
    });

    it("refuse un identifiant qui n'est pas un UUID", async () => {
      const reponse = await testeur.delete('/api/cles-api/PAS_UN_UUID');

      expect(reponse.status).toBe(400);
    });

    it("révoque la clé de l'utilisateur courant", async () => {
      const { cle } = await testeur.depotDonnees().nouvelleCle('U1', 30);

      const reponse = await testeur.delete(`/api/cles-api/${cle.donnees().id}`);

      const [cleLue] = await testeur.depotDonnees().lisClesDe('U1');
      expect(cleLue.estRevoquee()).toBe(true);
      expect(reponse.status).toBe(200);
    });

    it("ne révoque pas la clé d'un autre utilisateur", async () => {
      const { cle } = await testeur.depotDonnees().nouvelleCle('U2', 30);

      const reponse = await testeur.delete(`/api/cles-api/${cle.donnees().id}`);

      const [cleLue] = await testeur.depotDonnees().lisClesDe('U2');
      expect(cleLue.estRevoquee()).toBe(false);
      expect(reponse.status).toBe(404);
    });

    it("répond 404 si la clé n'existe pas", async () => {
      const reponse = await testeur.delete(`/api/cles-api/${unUUIDRandom()}`);

      expect(reponse.status).toBe(404);
    });
  });
});
