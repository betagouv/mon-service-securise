const axios = require('axios');
const expect = require('expect.js');

const { ErreurEmailManquant, ErreurModele, ErreurUtilisateurExistant } = require('../../src/erreurs');

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
    let donneesRequete;

    beforeEach(() => {
      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        telephone: '0100000000',
        rssi: 'true',
        delegueProtectionDonnees: 'false',
        poste: "Chargé des systèmes d'informations",
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
        cguAcceptees: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () => Promise.resolve();
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () => Promise.resolve();

      testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve(utilisateur);
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'prenom',
          'nom',
          'email',
          'telephone',
          'cguAcceptees',
          'poste',
          'rssi',
          'delegueProtectionDonnees',
          'nomEntitePublique',
          'departementEntitePublique',
        ],
        { method: 'post', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete },
        done
      );
    });

    it("convertit l'email en minuscules", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ email }) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      donneesRequete.email = 'Jean.DUPONT@mail.fr';

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it('convertit le RSSI en booléen', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ rssi }) => {
        expect(rssi).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.rssi = 'true';

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it('convertit le délégué à la protection des données en booléen', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ delegueProtectionDonnees }) => {
        expect(delegueProtectionDonnees).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.delegueProtectionDonnees = 'true';

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it('convertit les cgu acceptées en valeur booléenne', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ cguAcceptees }) => {
        expect(cguAcceptees).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.cguAcceptees = 'true';

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", (done) => {
      donneesRequete.prenom = '';

      testeur.verifieRequeteGenereErreurHTTP(
        422, "La création d'un nouvel utilisateur a échoué car les paramètres sont invalides",
        { method: 'post', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
      );
    });

    it("demande au dépôt de créer l'utilisateur", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
        const donneesAttendues = {
          ...donneesRequete,
          rssi: true,
          delegueProtectionDonnees: false,
          cguAcceptees: true,
        };
        expect(donneesUtilisateur).to.eql(donneesAttendues);
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

      axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
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
          { method: 'post', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
        );
      });

      it("supprime l'utilisateur créé", (done) => {
        let utilisateurSupprime = false;
        testeur.depotDonnees().supprimeUtilisateur = (id) => {
          expect(id).to.equal('123');

          utilisateurSupprime = true;
          return Promise.resolve();
        };

        axios.post('http://localhost:1234/api/utilisateur', donneesRequete)
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
        { method: 'post', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
      );
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = () => Promise.reject(new ErreurEmailManquant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
      );
    });
  });

  describe('quand requête POST sur `/api/reinitialisationMotDePasse`', () => {
    const utilisateur = { email: 'jean.dupont@mail.fr', idResetMotDePasse: '999' };

    beforeEach(() => {
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () => Promise.resolve();
      testeur.depotDonnees().reinitialiseMotDePasse = () => Promise.resolve(utilisateur);
    });

    it("convertit l'email en minuscules", (done) => {
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
    let donneesRequete;

    beforeEach(() => {
      utilisateur = { id: '123', genereToken: () => 'un token', accepteCGU: () => true };

      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        telephone: '0100000000',
        rssi: 'true',
        delegueProtectionDonnees: 'false',
        poste: "Chargé des systèmes d'informations",
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
        motDePasse: 'mdp_12345',
        cguAcceptees: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourMotDePasse = () => Promise.resolve(utilisateur);
      depotDonnees.metsAJourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.valideAcceptationCGUPourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = () => Promise.resolve(utilisateur);
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        { method: 'put', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
      );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'motDePasse',
          'prenom',
          'nom',
          'telephone',
          'cguAcceptees',
          'poste',
          'rssi',
          'delegueProtectionDonnees',
          'nomEntitePublique',
          'departementEntitePublique',
        ],
        { method: 'put', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete },
        done
      );
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", (done) => {
      donneesRequete.prenom = '';

      testeur.verifieRequeteGenereErreurHTTP(
        422, "La mise à jour de l'utilisateur a échoué car les paramètres sont invalides",
        { method: 'put', url: 'http://localhost:1234/api/utilisateur', data: donneesRequete }, done
      );
    });

    describe("lorsque l'utilisateur a déjà accepté les CGU", () => {
      it("met à jour le mot de passe de l'utilisateur", (done) => {
        let motDePasseMisAJour = false;

        testeur.middleware().reinitialise(utilisateur.id);
        testeur.depotDonnees().metsAJourMotDePasse = (idUtilisateur, motDePasse) => {
          try {
            expect(idUtilisateur).to.equal('123');
            expect(motDePasse).to.equal('mdp_12345');
            motDePasseMisAJour = true;
            return Promise.resolve(utilisateur);
          } catch (e) {
            return Promise.reject(e);
          }
        };

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then((reponse) => {
            expect(motDePasseMisAJour).to.be(true);
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ idUtilisateur: '123' });
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it('convertit le RSSI en booléen', (done) => {
        testeur.middleware().reinitialise(utilisateur.id);

        testeur.depotDonnees().metsAJourUtilisateur = (id, { rssi }) => {
          try {
            expect(id).to.equal('123');
            expect(rssi).to.equal(false);
            return Promise.resolve(utilisateur);
          } catch (e) {
            return Promise.reject(e);
          }
        };

        donneesRequete.rssi = 'false';

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ idUtilisateur: '123' });
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it('convertit le délégué à la protection des données en booléen', (done) => {
        testeur.middleware().reinitialise(utilisateur.id);

        testeur.depotDonnees().metsAJourUtilisateur = (id, { delegueProtectionDonnees }) => {
          try {
            expect(id).to.equal('123');
            expect(delegueProtectionDonnees).to.equal(true);
            return Promise.resolve(utilisateur);
          } catch (e) {
            return Promise.reject(e);
          }
        };

        donneesRequete.delegueProtectionDonnees = 'true';

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ idUtilisateur: '123' });
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it("met à jour les autres informations de l'utilisateur", (done) => {
        let infosMisesAJour = false;

        testeur.middleware().reinitialise(utilisateur.id);

        testeur.depotDonnees().metsAJourUtilisateur = (id, donnees) => {
          try {
            expect(id).to.equal('123');
            expect(donnees.prenom).to.equal('Jean');
            expect(donnees.nom).to.equal('Dupont');
            expect(donnees.telephone).to.equal('0100000000');
            expect(donnees.poste).to.equal("Chargé des systèmes d'informations");
            expect(donnees.nomEntitePublique).to.equal('Ville de Paris');
            expect(donnees.departementEntitePublique).to.equal('75');
            infosMisesAJour = true;
            return Promise.resolve(utilisateur);
          } catch (e) {
            return Promise.reject(e);
          }
        };

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then((reponse) => {
            expect(infosMisesAJour).to.be(true);
            expect(reponse.status).to.equal(200);
            expect(reponse.data).to.eql({ idUtilisateur: '123' });
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it('pose un nouveau cookie', (done) => {
        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
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

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => {
            expect(idResetSupprime).to.be(true);
            done();
          })
          .catch(done);
      });

      it("ne met pas à jour le mot de passe s'il est vide", (done) => {
        let motDePasseMisAJour = false;

        testeur.depotDonnees().metsAJourMotDePasse = () => {
          motDePasseMisAJour = true;
          return Promise.resolve();
        };

        donneesRequete.motDePasse = '';

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => expect(motDePasseMisAJour).to.be(false))
          .then(() => done())
          .catch(done);
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
        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
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

        axios.put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => done())
          .catch(done);
      });

      it("retourne une erreur HTTP 422 si la case CGU du formulaire n'est pas cochée", (done) => {
        donneesRequete.cguAcceptees = 'false';
        testeur.verifieRequeteGenereErreurHTTP(422, 'CGU non acceptées', {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        }, done);
      });
    });
  });

  describe('quand requête GET sur `/api/utilisateurCourant`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        { method: 'get', url: 'http://localhost:1234/api/utilisateurCourant' }, done
      );
    });

    it("renvoie l'utilisateur correspondant à l'identifiant", (done) => {
      testeur.middleware().reinitialise('123');

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = (idUtilisateur) => {
        try {
          expect(idUtilisateur).to.equal('123');
          return Promise.resolve({ toJSON: () => ({ id: '123' }) });
        } catch (erreur) {
          return Promise.reject(erreur);
        }
      };

      axios.get('http://localhost:1234/api/utilisateurCourant')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { utilisateur } = reponse.data;
          expect(utilisateur.id).to.equal('123');
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("répond avec un code 401 quand il n'y a pas d'identifiant", (done) => {
      testeur.middleware().reinitialise('');

      axios.get('http://localhost:1234/api/utilisateurCourant')
        .then(() => {
          done(new Error('La requête aurait du être en erreur'));
        })
        .catch((erreur) => {
          expect(erreur.response.status).to.equal(401);
          done();
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

  describe('quand requête POST sur `/api/autorisation`', () => {
    const autorisation = { id: '111' };
    const utilisateur = { id: '999', genereToken: () => 'un token', accepteCGU: () => true };

    beforeEach(() => {
      testeur.middleware().reinitialise('456');
      autorisation.permissionAjoutContributeur = true;

      testeur.depotDonnees().autorisationExiste = () => Promise.resolve(false);
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(autorisation);
      testeur.depotDonnees().utilisateurAvecEmail = () => Promise.resolve(utilisateur);
      testeur.depotDonnees().ajouteContributeurAHomologation = () => Promise.resolve();

      const utilisateurCourant = { prenomNom: () => '' };
      testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateurCourant);

      const homologation = { nomService: () => '' };
      testeur.depotDonnees().homologation = () => Promise.resolve(homologation);

      testeur.adaptateurMail().envoieMessageInvitationContribution = () => Promise.resolve();
    });

    it("aseptise l'email du contributeur", (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['emailContributeur'],
        { method: 'post', url: 'http://localhost:1234/api/autorisation' },
        done
      );
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU({
        method: 'post',
        url: 'http://localhost:1234/api/autorisation',
      }, done);
    });

    it("vérifie que l'utilisateur a le droit d'ajouter un contributeur", (done) => {
      let autorisationInterogee = false;
      testeur.depotDonnees().autorisationPour = (idUtilisateur, idHomologation) => {
        try {
          expect(testeur.middleware().idUtilisateurCourant()).to.equal('456');

          expect(idUtilisateur).to.equal('456');
          expect(idHomologation).to.equal('123');
          autorisationInterogee = true;
          return Promise.resolve(autorisation);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios.post('http://localhost:1234/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idHomologation: '123',
      })
        .then(() => {
          expect(autorisationInterogee).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit d'ajouter un contributeur", (done) => {
      autorisation.permissionAjoutContributeur = false;
      testeur.depotDonnees().autorisationPour = () => Promise.resolve(autorisation);

      axios.post('http://localhost:1234/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idHomologation: '123',
      })
        .then(() => {
          done('La requête aurait dû lever une erreur HTTP 403');
        })
        .catch((e) => {
          expect(e.response.status).to.equal(403);
          expect(e.response.data).to.equal("Ajout non autorisé d'un contributeur");
          done();
        })
        .catch(done);
    });

    describe('si le contributeur existe déjà', () => {
      beforeEach(() => {
        const contributeur = { email: 'jean.dupont@mail.fr' };
        testeur.depotDonnees().utilisateurAvecEmail = () => Promise.resolve(contributeur);

        const utilisateurCourant = { prenomNom: () => 'Utilisateur Courant' };
        testeur.depotDonnees().utilisateur = () => Promise.resolve(utilisateurCourant);

        const homologation = { id: '123', nomService: () => 'Nom Service' };
        testeur.depotDonnees().homologation = () => Promise.resolve(homologation);
      });

      describe("si le contributeur n'a pas déjà été invité", () => {
        it('envoie un email de notification au contributeur', (done) => {
          let emailEnvoye = false;

          testeur.adaptateurMail().envoieMessageInvitationContribution = (
            destinataire, prenomNomEmetteur, nomService, idHomologation
          ) => {
            try {
              expect(destinataire).to.equal('jean.dupont@mail.fr');
              expect(prenomNomEmetteur).to.equal('Utilisateur Courant');
              expect(nomService).to.equal('Nom Service');
              expect(idHomologation).to.equal('123');
              emailEnvoye = true;
              return Promise.resolve();
            } catch (e) {
              return Promise.reject(e);
            }
          };

          axios.post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'jean.dupont@mail.fr',
            idHomologation: '123',
          })
            .then(() => expect(emailEnvoye).to.be(true))
            .then(() => done())
            .catch((e) => done(e.response?.data || e));
        });
      });

      describe('si le contributeur a déjà été invité', () => {
        beforeEach(() => {
          testeur.depotDonnees().autorisationExiste = () => Promise.resolve(true);
        });

        it("n'envoie pas d'email d'invitation à contribuer", (done) => {
          let emailEnvoye = false;

          testeur.adaptateurMail().envoieMessageInvitationContribution = () => {
            emailEnvoye = true;
            return Promise.resolve();
          };

          axios.post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'jean.dupont@mail.fr',
            idHomologation: '123',
          })
            .then(() => done('Le serveur aurait dû lever une erreur HTTP 424'))
            .catch(() => {
              expect(emailEnvoye).to.be(false);
              done();
            })
            .catch((e) => done(e.response?.data || e));
        });

        it("n'envoie pas d'email d'invitation à s'inscrire", (done) => {
          let emailEnvoye = false;

          testeur.adaptateurMail().envoieMessageInvitationInscription = () => {
            emailEnvoye = true;
            return Promise.resolve();
          };

          axios.post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'jean.dupont@mail.fr',
            idHomologation: '123',
          })
            .then(() => done('Le serveur aurait dû lever une erreur HTTP 424'))
            .catch(() => {
              expect(emailEnvoye).to.be(false);
              done();
            })
            .catch((e) => done(e.response?.data || e));
        });
      });
    });

    describe("si le contributeur n'existe pas déjà", () => {
      let contributeurCree;

      beforeEach(() => {
        let utilisateurInexistant;
        testeur.depotDonnees().utilisateurAvecEmail = () => Promise.resolve(utilisateurInexistant);
        testeur.adaptateurMail().envoieMessageInvitationInscription = () => Promise.resolve();

        contributeurCree = { id: '789', email: 'jean.dupont@mail.fr', idResetMotDePasse: 'reset' };
        testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve(contributeurCree);
      });

      it('demande au dépôt de le créer', (done) => {
        let nouveauContributeurCree = false;
        testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
          try {
            expect(donneesUtilisateur.email).to.equal('jean.dupont@mail.fr');
            nouveauContributeurCree = true;
            return Promise.resolve(contributeurCree);
          } catch (e) {
            return Promise.reject(e);
          }
        };

        axios.post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
          .then(() => {
            expect(nouveauContributeurCree).to.be(true);
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it("envoie un mail d'invitation au contributeur créé", (done) => {
        let messageEnvoye = false;
        testeur.middleware().reinitialise('456');

        testeur.depotDonnees().utilisateur = (id) => {
          try {
            expect(id).to.equal('456');
            return Promise.resolve({ prenomNom: () => 'Utilisateur Courant' });
          } catch (e) {
            return Promise.reject(e);
          }
        };

        testeur.depotDonnees().homologation = (id) => {
          try {
            expect(id).to.equal('123');
            return Promise.resolve({ nomService: () => 'Nom Service' });
          } catch (e) {
            return Promise.reject(e);
          }
        };

        testeur.adaptateurMail().envoieMessageInvitationInscription = (
          destinataire, prenomNomEmetteur, nomService, idResetMotDePasse
        ) => {
          try {
            expect(destinataire).to.equal('jean.dupont@mail.fr');
            expect(prenomNomEmetteur).to.equal('Utilisateur Courant');
            expect(nomService).to.equal('Nom Service');
            expect(idResetMotDePasse).to.equal('reset');
            messageEnvoye = true;
            return Promise.resolve();
          } catch (e) {
            return Promise.reject(e);
          }
        };

        axios.post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
          .then(() => {
            expect(messageEnvoye).to.be(true);
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });
    });

    it("demande au dépôt de données d'ajouter l'autorisation", (done) => {
      testeur.depotDonnees().ajouteContributeurAHomologation = (
        (idContributeur, idHomologation) => {
          try {
            expect(utilisateur.id).to.equal('999');
            expect(idContributeur).to.equal('999');
            expect(idHomologation).to.equal('123');
            return Promise.resolve();
          } catch (e) {
            return Promise.reject(e);
          }
        }
      );

      axios.post('http://localhost:1234/api/autorisation', {
        emailContributeur: 'jean.dupont@mail.fr',
        idHomologation: '123',
      })
        .then((reponse) => {
          expect(reponse.status).to.be(200);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('retourne une erreur HTTP 422 si le dépôt a levé une `ErreurModele`', (done) => {
      testeur.depotDonnees().ajouteContributeurAHomologation = () => {
        throw new ErreurModele('oups');
      };

      testeur.verifieRequeteGenereErreurHTTP(
        422, 'oups',
        { method: 'post', url: 'http://localhost:1234/api/autorisation', data: {} },
        done
      );
    });
  });

  describe('quand requête GET sur `/api/dureeSession`', () => {
    it('renvoie la durée de session', (done) => {
      axios.get('http://localhost:1234/api/dureeSession')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { dureeSession } = reponse.data;
          expect(dureeSession).to.equal(3600000);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });
});
