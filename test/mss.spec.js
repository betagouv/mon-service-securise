const axios = require('axios');
const expect = require('expect.js');

const MSS = require('../src/mss');
const DepotDonnees = require('../src/depotDonnees');
const Homologation = require('../src/modeles/homologation');

describe('Le serveur MSS', () => {
  let idUtilisateurCourant;
  let suppressionCookieEffectuee;
  let verificationJWTMenee;

  const verifieRequeteExigeSuppressionCookie = (requete, done) => {
    expect(suppressionCookieEffectuee).to.be(false);
    axios(requete)
      .then(() => {
        expect(suppressionCookieEffectuee).to.be(true);
        done();
      })
      .catch((erreur) => done(erreur));
  };

  const verifieRequeteExigeJWT = (requete, done) => {
    expect(verificationJWTMenee).to.be(false);

    idUtilisateurCourant = '123';
    axios(requete)
      .then(() => {
        expect(verificationJWTMenee).to.be(true);
        done();
      })
      .catch((erreur) => {
        const erreurHTTP = erreur.response && erreur.response.status;
        if (erreurHTTP >= 400 && erreurHTTP < 500) {
          expect(verificationJWTMenee).to.be(true);
          done();
        } else throw erreur;
      })
      .catch((erreur) => done(erreur));
  };

  const middleware = {
    suppressionCookie: (requete, reponse, suite) => {
      suppressionCookieEffectuee = true;
      suite();
    },
    verificationJWT: (requete, reponse, suite) => {
      requete.idUtilisateurCourant = idUtilisateurCourant;
      verificationJWTMenee = true;
      suite();
    },
  };

  let depotDonnees;
  let serveur;

  beforeEach((done) => {
    idUtilisateurCourant = undefined;
    suppressionCookieEffectuee = false;
    verificationJWTMenee = false;

    depotDonnees = DepotDonnees.creeDepotVide();
    serveur = MSS.creeServeur(depotDonnees, middleware, false);
    serveur.ecoute(1234, done);
  });

  afterEach(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch((erreur) => done(erreur));
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      verifieRequeteExigeSuppressionCookie('http://localhost:1234/connexion', done);
    });
  });

  describe('quand requête GET sur `/api/homologations`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/api/homologations' }, done
      );
    });

    it("interroge le dépôt de données pour récupérer les homologations de l'utilisateur", (done) => {
      idUtilisateurCourant = '123';

      const homologation = new Homologation({ id: '456', nomService: 'Super Service' });
      depotDonnees.homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        return [homologation];
      };

      axios.get('http://localhost:1234/api/homologations')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { homologations } = reponse.data;
          expect(homologations.length).to.equal(1);
          expect(homologation.id).to.equal('456');
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête GET sur `/homologation/:id`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/homologation/456' }, done
      );
    });

    it('retourne une erreur HTTP 404 si homologation inexistante', (done) => {
      expect(depotDonnees.homologation('456')).to.be(undefined);
      axios.get('http://localhost:1234/homologation/456')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(404);
          expect(erreur.response.data).to.equal('Homologation non trouvée');
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("retrouve l'homologation à partir de son identifiant", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.homologation = (idHomologation) => {
        expect(idHomologation).to.equal('456');
        return new Homologation({ id: '456', idUtilisateur: '123', nomService: 'Super Service' });
      };

      axios.get('http://localhost:1234/homologation/456')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.contain('Super Service');
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("retourne une erreur HTTP 403 si l'homologation n'est pas liée à l'utilisateur courant", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.homologation = () => new Homologation({
        id: '456', idUtilisateur: '999', nomService: 'Super Service',
      });

      axios.get('http://localhost:1234/homologation/456')
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(403);
          expect(erreur.response.data).to.equal("Accès à l'homologation refusé");
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/homologation`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      verifieRequeteExigeJWT(
        { method: 'post', url: 'http://localhost:1234/api/homologation' }, done
      );
    });

    it('retourne une erreur HTTP 422 si données insuffisantes pour création homologation', (done) => {
      axios.post('http://localhost:1234/api/homologation', {})
        .then(() => done('Réponse HTTP OK inattendue'))
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(422);
          expect(erreur.response.data).to.equal("Données insuffisantes pour créer l'homologation");
          done();
        })
        .catch((erreur) => done(erreur));
    });

    it("demande au dépôt de données d'enregistrer les nouvelles homologations", (done) => {
      idUtilisateurCourant = '123';

      depotDonnees.nouvelleHomologation = (idUtilisateur, donneesHomologation) => {
        expect(idUtilisateur).to.equal('123');
        expect(donneesHomologation).to.eql({ nomService: 'Super Service' });
        return '456';
      };

      axios.post('http://localhost:1234/api/homologation', { nomService: 'Super Service' })
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idHomologation: '456' });
          done();
        })
        .catch((erreur) => done(erreur));
    });
  });

  describe('quand requête POST sur `/api/token`', () => {
    describe("avec authentification réussie de l'utilisateur", () => {
      beforeEach(() => {
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
          .catch((erreur) => done(erreur));
      });

      it("retourne les infos de l'utilisateur", (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
            done();
          })
          .catch((erreur) => done(erreur));
      });
    });

    describe("avec échec de l'authentification de l'utilisateur", () => {
      before(() => (
        depotDonnees.utilisateurAuthentifie = () => new Promise(
          (resolve) => resolve(undefined)
        )
      ));

      it('retourne un HTTP 401', (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then(() => done('Réponse OK inattendue.'))
          .catch((erreur) => {
            expect(erreur.response.status).to.equal(401);
            expect(erreur.response.data).to.equal("L'authentification a échoué.");
            done();
          })
          .catch((erreur) => done(erreur));
      });
    });
  });
});
