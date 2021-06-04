const axios = require('axios');
const expect = require('expect.js');

const MSS = require('../src/mss');
const DepotDonnees = require('../src/depotDonnees');

describe('Le serveur MSS', () => {
  const depotDonnees = DepotDonnees.creeDepotVide();
  const adaptateurJWT = {};
  const serveur = MSS.creeServeur(depotDonnees, adaptateurJWT, false);

  beforeEach((done) => {
    adaptateurJWT.decode = () => {};
    serveur.ecoute(1234, done);
  });

  afterEach(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });

  it("déconnecte l'utilisateur courant quand demande d'authentification", (done) => {
    axios.get('http://localhost:1234/connexion')
      .then((reponse) => {
        expect(reponse.headers['set-cookie'][0]).to.match(/token=;/);
        done();
      })
      .catch((error) => done(error));
  });

  it("interroge le dépôt de données pour récupérer les homologations d'un utilisateur donné", (done) => {
    adaptateurJWT.decode = () => ({ idUtilisateur: '123' });

    const homologation = { toJSON: () => ({ id: '456', nomService: 'Super Service' }) };
    depotDonnees.homologations = (idUtilisateur) => {
      expect(idUtilisateur).to.equal('123');
      return [homologation];
    };

    axios.get('http://localhost:1234/api/homologations')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((error) => done(error));
  });

  describe("quand l'utilisateur est correctement authentifié", () => {
    before(() => {
      const utilisateur = {
        toJSON: () => ({ prenomNom: 'Jean Dupont' }),
        genereToken: () => 'un token',
      };

      depotDonnees.utilisateurAuthentifie = (login, motDePasse) => new Promise(
        (resolve) => {
          expect(login).to.equal('jean.dupont@mail.fr');
          expect(motDePasse).to.equal('mdp_12345');
          resolve(utilisateur);
        }
      );
    });

    it('pose un cookie', (done) => {
      axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.headers['set-cookie'][0]).to.match(
            /^token=.+; path=\/; expires=.+; samesite=strict; httponly$/
          );
          expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
          done();
        })
        .catch((error) => done(error));
    });

    it("retourne les infos de l'utilisateur", (done) => {
      axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
        .then((reponse) => {
          expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
          done();
        })
        .catch((error) => done(error));
    });
  });

  describe("quand l'utilisateur n'est pas correctement authentifié", () => {
    before(() => (
      depotDonnees.utilisateurAuthentifie = () => new Promise(
        (resolve) => resolve(undefined)
      )
    ));

    it('retourne un HTTP 401', (done) => {
      axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
        .then(() => done('Réponse OK inattendue.'))
        .catch((error) => {
          expect(error.response.status).to.equal(401);
          expect(error.response.data).to.equal("L'authentification a échoué.");
          done();
        })
        .catch((error) => done(error));
    });

    it("redirige l'utilisateur vers la mire de login", (done) => {
      axios.get('http://localhost:1234/homologations')
        .then((reponse) => {
          expect(reponse.request.path).to.equal('/connexion');
          done();
        })
        .catch((error) => done(error));
    });
  });
});
