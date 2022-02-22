const axios = require('axios');
const expect = require('expect.js');

const { ErreurEmailManquant, ErreurUtilisateurExistant } = require('../src/erreurs');
const MSS = require('../src/mss');
const Referentiel = require('../src/referentiel');
const DepotDonnees = require('../src/depotDonnees');

const middleware = require('./mocks/middleware');

const verifieRequeteGenereErreurHTTP = (status, messageErreur, requete, suite) => {
  axios(requete)
    .then(() => suite('Réponse OK inattendue'))
    .catch((erreur) => {
      expect(erreur.response.status).to.equal(status);
      expect(erreur.response.data).to.equal(messageErreur);
      suite();
    })
    .catch(suite);
};

const verifieJetonDepose = (reponse, suite) => {
  const valeurHeader = reponse.headers['set-cookie'][0];
  expect(valeurHeader).to.match(/^token=.+; path=\/; expires=.+; samesite=strict; httponly$/);
  suite();
};

describe('Le serveur MSS', () => {
  let adaptateurMail;
  let depotDonnees;
  let referentiel;
  let serveur;

  beforeEach((done) => {
    middleware.reinitialise();
    referentiel = Referentiel.creeReferentielVide();
    adaptateurMail = {
      envoieMessageFinalisationInscription: () => Promise.resolve(),
      envoieMessageReinitialisationMotDePasse: () => Promise.resolve(),
    };

    DepotDonnees.creeDepotVide()
      .then((depot) => {
        depotDonnees = depot;
        depotDonnees.nouvelleHomologation = () => Promise.resolve();
        serveur = MSS.creeServeur(depotDonnees, middleware, referentiel, adaptateurMail, false);
        serveur.ecoute(1234, done);
      });
  });

  afterEach(() => { serveur.arreteEcoute(); });

  it('sert des pages HTML', (done) => {
    axios.get('http://localhost:1234/')
      .then((reponse) => {
        expect(reponse.status).to.equal(200);
        done();
      })
      .catch(done);
  });

  describe('quand une page est servie', () => {
    it('positionne les headers', (done) => {
      middleware.verifieRequetePositionneHeaders('http://localhost:1234/', done);
    });

    it("n'affiche pas d'information sur la nature du serveur", (done) => {
      axios.get('http://localhost:1234')
        .then((reponse) => {
          expect(reponse.headers).to.not.have.property('x-powered-by');
          done();
        })
        .catch(done);
    });

    it("repousse l'expiration du cookie", (done) => {
      middleware.verifieRequeteRepousseExpirationCookie('http://localhost:1234/', done);
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      middleware.verifieRequeteExigeSuppressionCookie('http://localhost:1234/connexion', done);
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      middleware.verifieRequeteExigeSuppressionCookie(
        'http://localhost:1234/reinitialisationMotDePasse', done
      );
    });
  });

  describe('quand requête GET sur `/initialisationMotDePasse/:idReset`', () => {
    describe('avec idReset valide', () => {
      const utilisateur = { id: '123', genereToken: () => 'un token', accepteCGU: () => false };

      beforeEach(() => {
        depotDonnees.utilisateurAFinaliser = () => Promise.resolve(utilisateur);
        depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
      });

      it('dépose le jeton dans un cookie', (done) => {
        depotDonnees.utilisateurAFinaliser = (idReset) => new Promise((resolve) => {
          expect(idReset).to.equal('999');
          resolve(utilisateur);
        });

        axios.get('http://localhost:1234/initialisationMotDePasse/999')
          .then((reponse) => verifieJetonDepose(reponse, done))
          .catch(done);
      });
    });

    it("aseptise l'identifiant reçu", (done) => {
      middleware.verifieAseptisationParametres(
        ['idReset'], 'http://localhost:1234/initialisationMotDePasse/999', done
      );
    });

    it('retourne une erreur HTTP 404 si idReset inconnu', (done) => {
      depotDonnees.utilisateurAFinaliser = () => Promise.resolve(undefined);

      verifieRequeteGenereErreurHTTP(
        404, "Identifiant d'initialisation de mot de passe \"999\" inconnu",
        'http://localhost:1234/initialisationMotDePasse/999', done
      );
    });
  });

  describe('quand requête GET sur `/admin/inscription`', () => {
    it("verrouille l'accès par une authentification basique", (done) => {
      middleware.verifieRequeteExigeAuthentificationBasique('http://localhost:1234/admin/inscription', done);
    });
  });

  describe('quand requête GET sur `/api/homologations`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      middleware.verifieRequeteExigeAcceptationCGU('http://localhost:1234/api/homologations', done);
    });

    it("interroge le dépôt de données pour récupérer les homologations de l'utilisateur", (done) => {
      middleware.reinitialise('123');

      const homologation = { toJSON: () => ({ id: '456' }) };
      depotDonnees.homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        return Promise.resolve([homologation]);
      };

      axios.get('http://localhost:1234/api/homologations')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { homologations } = reponse.data;
          expect(homologations.length).to.equal(1);
          expect(homologations[0].id).to.equal('456');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/espacePersonnel`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      middleware.verifieRequeteExigeAcceptationCGU('http://localhost:1234/espacePersonnel', done);
    });
  });

  describe('quand requête GET sur `/api/seuilCriticite`', () => {
    it('vérifie que les CGU sont acceptées', (done) => {
      middleware.verifieRequeteExigeAcceptationCGU('http://localhost:1234/api/seuilCriticite', done);
    });

    it('détermine le seuil de criticité pour le service', (done) => {
      referentiel.criticite = (idsFonctionnalites, idsDonnees, idDelai) => {
        expect(idsFonctionnalites).to.eql(['f1', 'f2']);
        expect(idsDonnees).to.eql(['d1', 'd2']);
        expect(idDelai).to.equal('unDelai');
        return 'moyen';
      };

      axios('http://localhost:1234/api/seuilCriticite', { params: {
        fonctionnalites: ['f1', 'f2'],
        donneesCaracterePersonnel: ['d1', 'd2'],
        delaiAvantImpactCritique: 'unDelai',
      } })
        .then((reponse) => expect(reponse.data).to.eql({ seuilCriticite: 'moyen' }))
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'get',
        url: 'http://localhost:1234/api/seuilCriticite',
        params: { delaiAvantImpactCritique: 'delaiInvalide' },
      }, done);
    });
  });

  describe('quand requête GET sur `/utilisateur/edition`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      const utilisateur = { accepteCGU: () => true };
      depotDonnees.utilisateur = () => new Promise((resolve) => resolve(utilisateur));
      middleware.verifieRequeteExigeJWT('http://localhost:1234/utilisateur/edition', done);
    });
  });

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const utilisateur = { id: '123', genereToken: () => 'un token' };

    beforeEach(() => (
      depotDonnees.nouvelUtilisateur = () => new Promise((resolve) => resolve(utilisateur))
    ));

    it('aseptise les paramètres de la requête', (done) => {
      middleware.verifieAseptisationParametres(
        ['prenom', 'nom', 'email'],
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' },
        done
      );
    });

    it("convertis l'email en minuscules", (done) => {
      depotDonnees.nouvelUtilisateur = ({ email }) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      axios.post('http://localhost:1234/api/utilisateur', { email: 'Jean.DUPONT@mail.fr' })
        .then(() => done())
        .catch(done);
    });

    it("demande au dépôt de créer l'utilisateur", (done) => {
      const donneesRequete = { prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' };

      depotDonnees.nouvelUtilisateur = (donneesUtilisateur) => {
        expect(donneesUtilisateur).to.eql(donneesRequete);
        return Promise.resolve(utilisateur);
      };

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch(done);
    });

    it("envoie un message de notification à l'utilisateur créé", (done) => {
      utilisateur.email = 'jean.dupont@mail.fr';
      utilisateur.idResetMotDePasse = '999';

      adaptateurMail.envoieMessageFinalisationInscription = (destinataire, idResetMotDePasse) => {
        expect(destinataire).to.equal('jean.dupont@mail.fr');
        expect(idResetMotDePasse).to.equal('999');
        return Promise.resolve();
      };

      axios.post('http://localhost:1234/api/utilisateur', { desDonnees: 'des donnees' })
        .then(() => done())
        .catch(done);
    });

    describe("si l'envoi de mail échoue", () => {
      beforeEach(() => {
        adaptateurMail.envoieMessageFinalisationInscription = () => Promise.reject(new Error('Oups.'));
        depotDonnees.supprimeUtilisateur = () => Promise.resolve();
      });

      it('retourne une erreur HTTP 424', (done) => {
        verifieRequeteGenereErreurHTTP(
          424, "L'envoi de l'email de finalisation d'inscription a échoué",
          { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
        );
      });

      it("supprime l'utilisateur créé", (done) => {
        let utilisateurSupprime = false;
        depotDonnees.supprimeUtilisateur = (id) => {
          expect(id).to.equal('123');

          utilisateurSupprime = true;
          return Promise.resolve();
        };

        axios.post('http://localhost:1234/api/utilisateur', { desDonnes: 'des données' })
          .catch(() => {
            expect(utilisateurSupprime).to.be(true);
            done();
          })
          .catch(done);
      });
    });

    it("génère une erreur HTTP 422 si l'utilisateur existe déjà", (done) => {
      depotDonnees.nouvelUtilisateur = () => Promise.reject(new ErreurUtilisateurExistant('oups'));

      verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", (done) => {
      depotDonnees.nouvelUtilisateur = () => Promise.reject(new ErreurEmailManquant('oups'));

      verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });
  });

  describe('quand requête POST sur `/api/reinitialisationMotDePasse`', () => {
    const utilisateur = { email: 'jean.dupont@mail.fr', idResetMotDePasse: '999' };

    beforeEach(() => (
      depotDonnees.reinitialiseMotDePasse = () => Promise.resolve(utilisateur)
    ));

    it("convertis l'email en minuscules", (done) => {
      depotDonnees.reinitialiseMotDePasse = (email) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      axios.post(
        'http://localhost:1234/api/reinitialisationMotDePasse', { email: 'Jean.DUPONT@mail.fr' }
      )
        .then(() => done())
        .catch(done);
    });

    it("échoue silencieusement si l'email n'est pas renseigné", (done) => {
      depotDonnees.nouvelUtilisateur = () => Promise.resolve();

      axios.post('http://localhost:1234/api/reinitialisationMotDePasse')
        .then(() => done())
        .catch(done);
    });

    it('demande au dépôt de réinitialiser le mot de passe', (done) => {
      depotDonnees.reinitialiseMotDePasse = (email) => new Promise((resolve) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        resolve(utilisateur);
      });

      axios.post(
        'http://localhost:1234/api/reinitialisationMotDePasse', { email: 'jean.dupont@mail.fr' }
      )
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({});
          done();
        })
        .catch(done);
    });

    it("envoie un mail à l'utilisateur", (done) => {
      let messageEnvoye = false;

      expect(utilisateur.idResetMotDePasse).to.equal('999');

      adaptateurMail.envoieMessageReinitialisationMotDePasse = (email, idReset) => (
        new Promise((resolve) => {
          expect(email).to.equal('jean.dupont@mail.fr');
          expect(idReset).to.equal('999');
          messageEnvoye = true;
          resolve();
        })
      );

      axios.post(
        'http://localhost:1234/api/reinitialisationMotDePasse', { email: 'jean.dupont@mail.fr' }
      )
        .then(() => expect(messageEnvoye).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });

  describe('quand requête PUT sur `/api/utilisateur`', () => {
    let utilisateur;

    beforeEach(() => {
      utilisateur = { id: '123', genereToken: () => 'un token', accepteCGU: () => true };
      depotDonnees.metsAJourMotDePasse = () => Promise.resolve(utilisateur);
      depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.valideAcceptationCGUPourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = () => Promise.resolve(utilisateur);
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      middleware.verifieRequeteExigeJWT(
        { method: 'put', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });

    describe("lorsque l'utilisateur a déjà accepté les CGU", () => {
      it("met à jour le mot de passe de l'utilisateur", (done) => {
        middleware.reinitialise(utilisateur.id);

        depotDonnees.metsAJourMotDePasse = (idUtilisateur, motDePasse) => new Promise(
          (resolve) => {
            expect(idUtilisateur).to.equal('123');
            expect(motDePasse).to.equal('mdp_12345');
            resolve(utilisateur);
          }
        );

        axios.put('http://localhost:1234/api/utilisateur', { motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ idUtilisateur: '123' });
            done();
          })
          .catch(done);
      });

      it('pose un nouveau cookie', (done) => {
        axios.put('http://localhost:1234/api/utilisateur', { motDePasse: 'mdp_12345' })
          .then((reponse) => verifieJetonDepose(reponse, done))
          .catch(done);
      });

      it("invalide l'identifiant de reset", (done) => {
        let idResetSupprime = false;

        expect(utilisateur.id).to.equal('123');
        depotDonnees.supprimeIdResetMotDePassePourUtilisateur = (u) => new Promise((resolve) => {
          expect(u.id).to.equal('123');
          idResetSupprime = true;
          resolve(u);
        });

        axios.put('http://localhost:1234/api/utilisateur', { motDePasse: 'mdp_12345' })
          .then(() => {
            expect(idResetSupprime).to.be(true);
            done();
          })
          .catch(done);
      });

      it('retourne une erreur HTTP 422 si le mot de passe est vide', (done) => {
        verifieRequeteGenereErreurHTTP(422, 'Le mot de passe ne doit pas être une chaîne vide', {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: { motDePasse: '' },
        }, done);
      });
    });

    describe("lorsque utilisateur n'a pas encore accepté les CGU", () => {
      beforeEach(() => (utilisateur.accepteCGU = () => false));

      it('met à jour le mot de passe si case CGU cochée dans formulaire', (done) => {
        let motDePasseMisAJour = false;
        depotDonnees.metsAJourMotDePasse = () => new Promise((resolve) => {
          motDePasseMisAJour = true;
          resolve(utilisateur);
        });

        expect(motDePasseMisAJour).to.be(false);
        axios.put('http://localhost:1234/api/utilisateur', { cguAcceptees: true, motDePasse: 'mdp_12345' })
          .then(() => expect(motDePasseMisAJour).to.be(true))
          .then(() => done())
          .catch(done);
      });

      it("indique que l'utilisateur a coché la case CGU dans le formulaire", (done) => {
        middleware.reinitialise(utilisateur.id);

        depotDonnees.valideAcceptationCGUPourUtilisateur = (u) => new Promise((resolve) => {
          expect(u.id).to.equal('123');
          resolve(u);
        });

        axios.put('http://localhost:1234/api/utilisateur', { cguAcceptees: true, motDePasse: 'mdp_12345' })
          .then(() => done())
          .catch(done);
      });

      it("retourne une erreur HTTP 422 si la case CGU du formulaire n'est pas cochée", (done) => {
        verifieRequeteGenereErreurHTTP(422, 'CGU non acceptées', {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: { cguAcceptees: false, motDePasse: 'mdp_12345' },
        }, done);
      });
    });
  });

  describe('quand requête POST sur `/api/token`', () => {
    it("authentifie l'utilisateur avec le login en minuscules", (done) => {
      const utilisateur = { toJSON: () => {}, genereToken: () => {} };

      depotDonnees.utilisateurAuthentifie = (login, motDePasse) => {
        try {
          expect(login).to.equal('jean.dupont@mail.fr');
          expect(motDePasse).to.equal('mdp_12345');
          return Promise.resolve(utilisateur);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios.post('http://localhost:1234/api/token', { login: 'Jean.DUPONT@mail.fr', motDePasse: 'mdp_12345' })
        .then(() => done())
        .catch(done);
    });

    describe("avec authentification réussie de l'utilisateur", () => {
      beforeEach(() => {
        const utilisateur = {
          toJSON: () => ({ prenomNom: 'Jean Dupont' }),
          genereToken: () => 'un token',
        };

        depotDonnees.utilisateurAuthentifie = () => Promise.resolve(utilisateur);
      });

      it("retourne les informations de l'utilisateur", (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
            done();
          })
          .catch(done);
      });

      it('pose un cookie', (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => verifieJetonDepose(reponse, done))
          .catch(done);
      });

      it("retourne les infos de l'utilisateur", (done) => {
        axios.post('http://localhost:1234/api/token', { login: 'jean.dupont@mail.fr', motDePasse: 'mdp_12345' })
          .then((reponse) => {
            expect(reponse.data).to.eql({ utilisateur: { prenomNom: 'Jean Dupont' } });
            done();
          })
          .catch(done);
      });
    });

    describe("avec échec de l'authentification de l'utilisateur", () => {
      it('retourne un HTTP 401', (done) => {
        depotDonnees.utilisateurAuthentifie = () => new Promise((resolve) => resolve(undefined));

        verifieRequeteGenereErreurHTTP(
          401, "L'authentification a échoué", {
            method: 'post',
            url: 'http://localhost:1234/api/token',
            data: {},
          }, done
        );
      });
    });
  });
});
