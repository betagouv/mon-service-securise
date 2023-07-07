const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');

describe('Le serveur MSS des routes publiques /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/nouvelleFonctionnalite`', () => {
    it("aseptise l'identifiant de nouvelle fonctionnalité", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['id'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/nouvelleFonctionnalite/nouveaute',
        },
        done
      );
    });

    it("retourne une erreur HTTP 404 si la nouvelle fonctionnalité n'existe pas", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        404,
        'Nouvelle fonctionnalité inconnue',
        {
          method: 'get',
          url: 'http://localhost:1234/api/nouvelleFonctionnalite/inconnue',
        },
        done
      );
    });

    it('retourne le contenu de la nouvelle fonctionnalité', (done) => {
      testeur.referentiel().recharge({
        nouvellesFonctionnalites: [
          { id: 'tdb', fichierPug: 'tableauDeBord.pug' },
        ],
      });
      axios
        .get('http://localhost:1234/api/nouvelleFonctionnalite/tdb')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });
});
