const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des routes privées /api/notifications', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/notifications`', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        nouvellesFonctionnalites: [
          { id: 'N1', dateDeDeploiement: '2024-01-01' },
          { id: 'N2', dateDeDeploiement: '2024-02-02' },
        ],
      });
    });

    it('retourne les notifications', async () => {
      const reponse = await axios.get(
        'http://localhost:1234/api/notifications'
      );

      expect(reponse.status).to.be(200);
      expect(reponse.data.notifications.length).to.be(2);
    });
  });
});
