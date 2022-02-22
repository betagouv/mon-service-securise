const axios = require('axios');
const expect = require('expect.js');

const { ErreurEmailManquant, ErreurUtilisateurExistant } = require('../../src/erreurs');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/homologations`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        'http://localhost:1234/api/homologations',
        done,
      );
    });

    it("interroge le dépôt de données pour récupérer les homologations de l'utilisateur", (done) => {
      testeur.middleware().reinitialise('123');

      const homologation = { toJSON: () => ({ id: '456' }) };
      testeur.depotDonnees().homologations = (idUtilisateur) => {
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

  describe('quand requête GET sur `/api/seuilCriticite`', () => {
    it('vérifie que les CGU sont acceptées', (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        'http://localhost:1234/api/seuilCriticite',
        done,
      );
    });

    it('détermine le seuil de criticité pour le service', (done) => {
      testeur.referentiel().criticite = (idsFonctionnalites, idsDonnees, idDelai) => {
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
      testeur.verifieRequeteGenereErreurHTTP(422, 'Données invalides', {
        method: 'get',
        url: 'http://localhost:1234/api/seuilCriticite',
        params: { delaiAvantImpactCritique: 'delaiInvalide' },
      }, done);
    });
  });

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const utilisateur = { id: '123', genereToken: () => 'un token' };

    beforeEach(() => {
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () => Promise.resolve();
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () => Promise.resolve();

      testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve(utilisateur);
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['prenom', 'nom', 'email'],
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' },
        done
      );
    });

    it("convertis l'email en minuscules", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ email }) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      axios.post('http://localhost:1234/api/utilisateur', { email: 'Jean.DUPONT@mail.fr' })
        .then(() => done())
        .catch(done);
    });

    it("demande au dépôt de créer l'utilisateur", (done) => {
      const donneesRequete = { prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' };

      testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
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

      testeur.adaptateurMail().envoieMessageFinalisationInscription = (
        (destinataire, idResetMotDePasse) => {
          expect(destinataire).to.equal('jean.dupont@mail.fr');
          expect(idResetMotDePasse).to.equal('999');
          return Promise.resolve();
        }
      );

      axios.post('http://localhost:1234/api/utilisateur', { desDonnees: 'des donnees' })
        .then(() => done())
        .catch(done);
    });

    describe("si l'envoi de mail échoue", () => {
      beforeEach(() => {
        testeur.adaptateurMail().envoieMessageFinalisationInscription = (
          () => Promise.reject(new Error('Oups.'))
        );
        testeur.depotDonnees().supprimeUtilisateur = () => Promise.resolve();
      });

      it('retourne une erreur HTTP 424', (done) => {
        testeur.verifieRequeteGenereErreurHTTP(
          424, "L'envoi de l'email de finalisation d'inscription a échoué",
          { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
        );
      });

      it("supprime l'utilisateur créé", (done) => {
        let utilisateurSupprime = false;
        testeur.depotDonnees().supprimeUtilisateur = (id) => {
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
      testeur.depotDonnees().nouvelUtilisateur = () => (
        Promise.reject(new ErreurUtilisateurExistant('oups'))
      );

      testeur.verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = () => Promise.reject(new ErreurEmailManquant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });
  });

  describe('quand requête POST sur `/api/reinitialisationMotDePasse`', () => {
    const utilisateur = { email: 'jean.dupont@mail.fr', idResetMotDePasse: '999' };

    beforeEach(() => {
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () => Promise.resolve();
      testeur.depotDonnees().reinitialiseMotDePasse = () => Promise.resolve(utilisateur);
    });

    it("convertis l'email en minuscules", (done) => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) => {
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
      testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve();

      axios.post('http://localhost:1234/api/reinitialisationMotDePasse')
        .then(() => done())
        .catch(done);
    });

    it('demande au dépôt de réinitialiser le mot de passe', (done) => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) => new Promise((resolve) => {
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

      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = (email, idReset) => (
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

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourMotDePasse = () => Promise.resolve(utilisateur);
      depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.valideAcceptationCGUPourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = () => Promise.resolve(utilisateur);
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        { method: 'put', url: 'http://localhost:1234/api/utilisateur' }, done
      );
    });

    describe("lorsque l'utilisateur a déjà accepté les CGU", () => {
      it("met à jour le mot de passe de l'utilisateur", (done) => {
        testeur.middleware().reinitialise(utilisateur.id);

        testeur.depotDonnees().metsAJourMotDePasse = (idUtilisateur, motDePasse) => {
          expect(idUtilisateur).to.equal('123');
          expect(motDePasse).to.equal('mdp_12345');
          return Promise.resolve(utilisateur);
        };

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
          .then((reponse) => testeur.verifieJetonDepose(reponse, done))
          .catch(done);
      });

      it("invalide l'identifiant de reset", (done) => {
        let idResetSupprime = false;

        expect(utilisateur.id).to.equal('123');
        testeur.depotDonnees().supprimeIdResetMotDePassePourUtilisateur = (u) => {
          expect(u.id).to.equal('123');
          idResetSupprime = true;
          return Promise.resolve(u);
        };

        axios.put('http://localhost:1234/api/utilisateur', { motDePasse: 'mdp_12345' })
          .then(() => {
            expect(idResetSupprime).to.be(true);
            done();
          })
          .catch(done);
      });

      it('retourne une erreur HTTP 422 si le mot de passe est vide', (done) => {
        testeur.verifieRequeteGenereErreurHTTP(422, 'Le mot de passe ne doit pas être une chaîne vide', {
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
        testeur.depotDonnees().metsAJourMotDePasse = () => {
          motDePasseMisAJour = true;
          return Promise.resolve(utilisateur);
        };

        expect(motDePasseMisAJour).to.be(false);
        axios.put('http://localhost:1234/api/utilisateur', { cguAcceptees: true, motDePasse: 'mdp_12345' })
          .then(() => expect(motDePasseMisAJour).to.be(true))
          .then(() => done())
          .catch(done);
      });

      it("indique que l'utilisateur a coché la case CGU dans le formulaire", (done) => {
        testeur.middleware().reinitialise(utilisateur.id);

        testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = (u) => {
          expect(u.id).to.equal('123');
          return Promise.resolve(u);
        };

        axios.put('http://localhost:1234/api/utilisateur', { cguAcceptees: true, motDePasse: 'mdp_12345' })
          .then(() => done())
          .catch(done);
      });

      it("retourne une erreur HTTP 422 si la case CGU du formulaire n'est pas cochée", (done) => {
        testeur.verifieRequeteGenereErreurHTTP(422, 'CGU non acceptées', {
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

      testeur.depotDonnees().utilisateurAuthentifie = (login, motDePasse) => {
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

        testeur.depotDonnees().utilisateurAuthentifie = () => Promise.resolve(utilisateur);
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
          .then((reponse) => testeur.verifieJetonDepose(reponse, done))
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
        testeur.depotDonnees().utilisateurAuthentifie = () => Promise.resolve(undefined);

        testeur.verifieRequeteGenereErreurHTTP(401, "L'authentification a échoué", {
          method: 'post',
          url: 'http://localhost:1234/api/token',
          data: {},
        }, done);
      });
    });
  });
});
