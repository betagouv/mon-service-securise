const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const ParcoursUtilisateur = require('../../../src/modeles/parcoursUtilisateur');
const {
  ErreurUtilisateurExistant,
  ErreurEmailManquant,
} = require('../../../src/erreurs');

describe('Le serveur MSS des routes publiques /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const utilisateur = { id: '123', genereToken: () => 'un token' };
    let donneesRequete;

    beforeEach(() => {
      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
        cguAcceptees: 'true',
        infolettreAcceptee: 'true',
        transactionnelAccepte: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      testeur.adaptateurMail().creeContact = () => Promise.resolve();
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () =>
        Promise.resolve();
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () =>
        Promise.resolve();

      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.resolve(utilisateur);
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'prenom',
          'nom',
          'email',
          'telephone',
          'cguAcceptees',
          'nomEntitePublique',
          'departementEntitePublique',
          'infolettreAcceptee',
          'transactionnelAccepte',
          'postes.*',
        ],
        {
          method: 'post',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it("convertit l'email en minuscules", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ email }) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      donneesRequete.email = 'Jean.DUPONT@mail.fr';

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it('convertit les cgu acceptées en valeur booléenne', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ cguAcceptees }) => {
        expect(cguAcceptees).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.cguAcceptees = 'true';

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it("convertit l'infolettre acceptée en valeur booléenne", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ infolettreAcceptee }) => {
        expect(infolettreAcceptee).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.infolettreAcceptee = 'true';

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", (done) => {
      donneesRequete.prenom = '';

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'La création d\'un nouvel utilisateur a échoué car les paramètres sont invalides. La propriété "prenom" est requise',
        {
          method: 'post',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it("demande au dépôt de créer l'utilisateur", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
        const donneesAttendues = {
          ...donneesRequete,
          cguAcceptees: true,
          infolettreAcceptee: true,
          transactionnelAccepte: true,
        };
        expect(donneesUtilisateur).to.eql(donneesAttendues);
        return Promise.resolve(utilisateur);
      };

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch(done);
    });

    it("utilise l'adaptateur de tracking pour envoyer un événement d'inscription", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.resolve({ email: 'jean.dupont@mail.fr' });

      let donneesPassees = {};
      testeur.adaptateurTracking().envoieTrackingInscription = (
        destinataire
      ) => {
        donneesPassees = { destinataire };
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => {
          expect(donneesPassees).to.eql({
            destinataire: 'jean.dupont@mail.fr',
          });
          done();
        })
        .catch(done);
    });

    it('crée un contact email', (done) => {
      utilisateur.email = 'jean.dupont@mail.fr';
      utilisateur.prenom = 'Jean';
      utilisateur.nom = 'Dupont';
      utilisateur.infolettreAcceptee = false;

      testeur.adaptateurMail().creeContact = (
        destinataire,
        prenom,
        nom,
        bloqueEmails
      ) => {
        expect(destinataire).to.equal('jean.dupont@mail.fr');
        expect(prenom).to.equal('Jean');
        expect(nom).to.equal('Dupont');
        expect(bloqueEmails).to.equal(true);
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it("envoie un message de notification à l'utilisateur créé", (done) => {
      utilisateur.email = 'jean.dupont@mail.fr';
      utilisateur.idResetMotDePasse = '999';

      testeur.adaptateurMail().envoieMessageFinalisationInscription = (
        destinataire,
        idResetMotDePasse
      ) => {
        expect(destinataire).to.equal('jean.dupont@mail.fr');
        expect(idResetMotDePasse).to.equal('999');
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    describe("si l'envoi de mail échoue", () => {
      beforeEach(() => {
        testeur.adaptateurMail().envoieMessageFinalisationInscription = () =>
          Promise.reject(new Error('Oups.'));
        testeur.depotDonnees().supprimeUtilisateur = () => Promise.resolve();
      });

      it('retourne une erreur HTTP 424', (done) => {
        testeur.verifieRequeteGenereErreurHTTP(
          424,
          "L'envoi de l'email de finalisation d'inscription a échoué",
          {
            method: 'post',
            url: 'http://localhost:1234/api/utilisateur',
            data: donneesRequete,
          },
          done
        );
      });

      it("supprime l'utilisateur créé", (done) => {
        let utilisateurSupprime = false;
        testeur.depotDonnees().supprimeUtilisateur = (id) => {
          expect(id).to.equal('123');

          utilisateurSupprime = true;
          return Promise.resolve();
        };

        axios
          .post('http://localhost:1234/api/utilisateur', donneesRequete)
          .catch(() => {
            expect(utilisateurSupprime).to.be(true);
            done();
          })
          .catch(done);
      });
    });

    it('envoie un email de notification de tentative de réinscription', (done) => {
      expect(donneesRequete.email).to.equal('jean.dupont@mail.fr');
      let notificationEnvoyee = false;

      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.reject(new ErreurUtilisateurExistant('oups', '123'));

      testeur.adaptateurMail().envoieNotificationTentativeReinscription = (
        destinataire
      ) => {
        expect(destinataire).to.equal('jean.dupont@mail.fr');
        notificationEnvoyee = true;
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => {
          expect(notificationEnvoyee).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.reject(new ErreurEmailManquant('oups'));

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'oups',
        {
          method: 'post',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });
  });

  describe('quand requête POST sur `/api/reinitialisationMotDePasse`', () => {
    const utilisateur = {
      email: 'jean.dupont@mail.fr',
      idResetMotDePasse: '999',
    };

    beforeEach(() => {
      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = () =>
        Promise.resolve();
      testeur.depotDonnees().reinitialiseMotDePasse = () =>
        Promise.resolve(utilisateur);
    });

    it("convertit l'email en minuscules", (done) => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      axios
        .post('http://localhost:1234/api/reinitialisationMotDePasse', {
          email: 'Jean.DUPONT@mail.fr',
        })
        .then(() => done())
        .catch(done);
    });

    it("échoue silencieusement si l'email n'est pas renseigné", (done) => {
      testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve();

      axios
        .post('http://localhost:1234/api/reinitialisationMotDePasse')
        .then(() => done())
        .catch(done);
    });

    it('demande au dépôt de réinitialiser le mot de passe', (done) => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) =>
        new Promise((resolve) => {
          expect(email).to.equal('jean.dupont@mail.fr');
          resolve(utilisateur);
        });

      axios
        .post('http://localhost:1234/api/reinitialisationMotDePasse', {
          email: 'jean.dupont@mail.fr',
        })
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

      testeur.adaptateurMail().envoieMessageReinitialisationMotDePasse = (
        email,
        idReset
      ) =>
        new Promise((resolve) => {
          expect(email).to.equal('jean.dupont@mail.fr');
          expect(idReset).to.equal('999');
          messageEnvoye = true;
          resolve();
        });

      axios
        .post('http://localhost:1234/api/reinitialisationMotDePasse', {
          email: 'jean.dupont@mail.fr',
        })
        .then(() => expect(messageEnvoye).to.be(true))
        .then(() => done())
        .catch(done);
    });
  });

  describe('quand requête POST sur `/api/token`', () => {
    it("authentifie l'utilisateur avec le login en minuscules", (done) => {
      testeur.depotDonnees().lisParcoursUtilisateur = async () => {
        const p = new ParcoursUtilisateur();
        p.recupereNouvelleFonctionnalite = () => 'fonctionnalité-bouchon';
        return p;
      };

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

      axios
        .post('http://localhost:1234/api/token', {
          login: 'Jean.DUPONT@mail.fr',
          motDePasse: 'mdp_12345',
        })
        .then(() => done())
        .catch(done);
    });

    describe("avec authentification réussie de l'utilisateur", () => {
      beforeEach(() => {
        const utilisateur = {
          email: 'jean.dupont@mail.fr',
          id: '456',
          toJSON: () => ({ prenomNom: 'Jean Dupont' }),
          genereToken: () => 'un token',
        };

        testeur.depotDonnees().utilisateurAuthentifie = () =>
          Promise.resolve(utilisateur);

        testeur.depotDonnees().lisParcoursUtilisateur = async () => {
          const p = new ParcoursUtilisateur();
          p.recupereNouvelleFonctionnalite = () => 'fonctionnalité-bouchon';
          return p;
        };
      });

      it("retourne les informations de l'utilisateur", (done) => {
        axios
          .post('http://localhost:1234/api/token', {
            login: 'jean.dupont@mail.fr',
            motDePasse: 'mdp_12345',
          })
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.data.utilisateur).to.eql({
              prenomNom: 'Jean Dupont',
            });
            done();
          })
          .catch(done);
      });

      it('pose un cookie', (done) => {
        axios
          .post('http://localhost:1234/api/token', {
            login: 'jean.dupont@mail.fr',
            motDePasse: 'mdp_12345',
          })
          .then((reponse) => testeur.verifieJetonDepose(reponse, done))
          .catch(done);
      });

      it("utilise l'adaptateur de tracking pour envoyer un événement de connexion", (done) => {
        let donneesPassees = {};
        testeur.depotDonnees().homologations = () =>
          Promise.resolve([{ id: '123' }]);
        testeur.adaptateurTracking().envoieTrackingConnexion = (
          destinataire,
          donneesEvenement
        ) => {
          donneesPassees = { destinataire, donneesEvenement };
          return Promise.resolve();
        };

        axios
          .post('http://localhost:1234/api/token', {
            login: 'jean.dupont@mail.fr',
            motDePasse: 'mdp_12345',
          })
          .then(() => {
            expect(donneesPassees).to.eql({
              destinataire: 'jean.dupont@mail.fr',
              donneesEvenement: { nombreServices: 1 },
            });
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it('utilise le dépôt pour lire et mettre à jour le parcours utilisateur', async () => {
        let idPasse;
        let donneesPassees = {};
        testeur.depotDonnees().lisParcoursUtilisateur = (id) => {
          idPasse = id;
          return Promise.resolve(
            new ParcoursUtilisateur({ idUtilisateur: id })
          );
        };
        testeur.depotDonnees().sauvegardeParcoursUtilisateur = (parcours) => {
          donneesPassees = parcours.toJSON();
          return Promise.resolve();
        };

        await axios.post('http://localhost:1234/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });
        expect(idPasse).to.eql('456');
        expect(donneesPassees.idUtilisateur).to.eql('456');
        expect(donneesPassees.dateDerniereConnexion).not.to.be(undefined);
      });

      it('retourne la nouvelle fonctionnalité dictée par le parcours utilisateur', async () => {
        const reponse = await axios.post('http://localhost:1234/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });
        expect(reponse.data.nouvelleFonctionnalite).to.eql(
          'fonctionnalité-bouchon'
        );
      });
    });

    describe("avec échec de l'authentification de l'utilisateur", () => {
      it('retourne un HTTP 401', (done) => {
        testeur.depotDonnees().utilisateurAuthentifie = () =>
          Promise.resolve(undefined);

        testeur.verifieRequeteGenereErreurHTTP(
          401,
          "L'authentification a échoué",
          {
            method: 'post',
            url: 'http://localhost:1234/api/token',
            data: {},
          },
          done
        );
      });
    });
  });

  describe('quand requête GET sur `/api/annuaire/organisations`', () => {
    beforeEach(() => {
      testeur.referentiel().estCodeDepartement = () => true;
    });

    it('retourne une erreur HTTP 400 si le terme de recherche est vide', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le terme de recherche ne peut pas être vide',
        {
          method: 'get',
          url: 'http://localhost:1234/api/annuaire/organisations?departement=75',
        },
        done
      );
    });

    it("retourne une erreur HTTP 400 si le département n'est pas dans le referentiel", (done) => {
      testeur.referentiel().estCodeDepartement = () => false;
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le département doit être valide (01 à 989)',
        {
          method: 'get',
          url: 'http://localhost:1234/api/annuaire/organisations?recherche=mairie&departement=990',
        },
        done
      );
    });

    it("recherche les organisations correspondantes grâce au service d'annuaire", (done) => {
      let adaptateurAppele = false;
      testeur.serviceAnnuaire().rechercheOrganisations = (
        terme,
        departement
      ) => {
        adaptateurAppele = true;
        expect(terme).to.equal('mairie');
        expect(departement).to.equal('01');
        return Promise.resolve([{ nom: 'un résultat', departement: '01' }]);
      };

      axios
        .get(
          'http://localhost:1234/api/annuaire/organisations?recherche=mairie&departement=01'
        )
        .then((reponse) => {
          expect(adaptateurAppele).to.be(true);
          expect(reponse.status).to.be(200);
          expect(reponse.data.suggestions).to.eql([
            { nom: 'un résultat', departement: '01' },
          ]);
        })
        .then(done)
        .catch((e) => done(e.response?.data || e));
    });
  });

  describe('quand requête POST sur `/api/desinscriptionInfolettre`', () => {
    const donneesRequete = {
      email: 'jean.dujardin@mail.com',
      event: 'unsubscribe',
    };

    it("retourne une erreur HTTP 400 si l'événement n'est pas une désinscription", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "L'événement doit être de type 'unsubscribe'" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
        },
        done
      );
    });

    it("retourne une erreur HTTP 400 si le champ email n'est pas présent", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "Le champ 'email' doit être présent" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: { event: 'unsubscribe' },
        },
        done
      );
    });

    it("retourne une erreur HTTP 424 si l'adresse email est introuvable", (done) => {
      testeur.depotDonnees().utilisateurAvecEmail = () =>
        Promise.resolve(undefined);

      testeur.verifieRequeteGenereErreurHTTP(
        424,
        { erreur: "L'email 'jean.dujardin@mail.com' est introuvable" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: donneesRequete,
        },
        done
      );
    });

    it("vérifie l'adresse IP de la requête", (done) => {
      testeur.middleware().verifieAdresseIP(
        ['185.107.232.1/24', '1.179.112.1/20'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: donneesRequete,
        },
        done
      );
    });

    it("désabonne l'utilisateur de l'infolettre", (done) => {
      const utilisateur = { id: '123', infolettreAcceptee: true };
      testeur.depotDonnees().utilisateurAvecEmail = (email) => {
        expect(email).to.equal('jean.dujardin@mail.com');
        return Promise.resolve(utilisateur);
      };
      testeur.depotDonnees().metsAJourUtilisateur = (id, donnees) => {
        expect(id).to.equal('123');
        expect(donnees.id).to.equal('123');
        expect(donnees.infolettreAcceptee).to.be(false);
        return Promise.resolve();
      };

      axios
        .post(
          'http://localhost:1234/api/desinscriptionInfolettre',
          donneesRequete
        )
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });
});
