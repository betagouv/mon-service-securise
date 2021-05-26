const axios = require('axios');
const expect = require('expect.js');

const MSS = require('../src/mss');
const DepotDonnees = require('../src/depotDonnees');

describe('Le serveur MSS', () => {
  const depotDonnees = DepotDonnees.creeDepotVide();
  const serveur = MSS.creeServeur(depotDonnees);

  before((done) => { serveur.ecoute(1234, done); });

  after(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });

  it("interroge le dépôt de données pour récupérer les homologations d'un utilisateur donné", (done) => {
    const homologation = { toJSON: () => ({ id: '456', nomService: 'Super Service' }) };
    depotDonnees.homologations = (idUtilisateur) => {
      expect(idUtilisateur).to.equal('123');
      return [homologation];
    };

    axios.get('http://localhost:1234/api/homologations', { headers: { 'x-id-utilisateur': '123' } })
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });
});
