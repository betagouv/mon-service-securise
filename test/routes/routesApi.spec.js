const axios = require('axios');
const expect = require('expect.js');

const {
  verifieNomFichierServi,
  verifieTypeFichierServiEstCSV,
} = require('../aides/verifieFichierServi');
const {
  ErreurEmailManquant,
  ErreurModele,
  ErreurUtilisateurExistant,
} = require('../../src/erreurs');

const testeurMSS = require('./testeurMSS');
const Service = require('../../src/modeles/service');
const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');

describe('Le serveur MSS des routes /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/services`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          'http://localhost:1234/api/services',
          done
        );
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });

      testeur.depotDonnees().homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        return Promise.resolve([
          new Service({
            id: '456',
            descriptionService: {
              nomService: 'Un service',
              organisationsResponsables: [],
            },
            createur: { email: 'email.createur@mail.fr' },
          }),
        ]);
      };

      axios
        .get('http://localhost:1234/api/services')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { services } = reponse.data;
          expect(services.length).to.equal(1);
          expect(services[0].id).to.equal('456');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/services/indices-cyber`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          'http://localhost:1234/api/services/indices-cyber',
          done
        );
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        return Promise.resolve([
          new Service({
            id: '456',
            descriptionService: {
              nomService: 'Un service',
              organisationsResponsables: [],
            },
            createur: { email: 'email.createur@mail.fr' },
          }),
        ]);
      };

      axios
        .get('http://localhost:1234/api/services/indices-cyber')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { services } = reponse.data;
          expect(services.length).to.equal(1);
          expect(services[0].id).to.equal('456');
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/services/export.csv`', () => {
    beforeEach(() => {
      testeur.adaptateurCsv().genereCsvServices = () => Promise.resolve();
      testeur.referentiel().recharge({
        statutsHomologation: {
          nonRealisee: { libelle: 'Non réalisée', ordre: 1 },
        },
      });
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          'http://localhost:1234/api/services/export.csv',
          done
        );
    });

    it('aseptise les identifiants des services à exporter', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['idsServices.*'],
        {
          method: 'get',
          url: 'http://localhost:1234/api/services/export.csv',
        },
        done
      );
    });

    it("interroge le dépôt de données pour récupérer les services de l'utilisateur", (done) => {
      let depotAppele = false;
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().homologations = (idUtilisateur) => {
        expect(idUtilisateur).to.equal('123');
        depotAppele = true;
        return Promise.resolve([
          new Service({
            id: '456',
            descriptionService: {
              nomService: 'Un service',
              organisationsResponsables: [],
            },
            createur: { email: 'email.createur@mail.fr' },
          }),
        ]);
      };

      axios
        .get('http://localhost:1234/api/services/export.csv')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(depotAppele).to.be(true);
          done();
        })
        .catch(done);
    });

    it('filtre les services en fonction de la requête', (done) => {
      testeur.depotDonnees().homologations = () =>
        Promise.resolve([
          new Service({
            id: '456',
            descriptionService: {
              nomService: 'Un service',
              organisationsResponsables: [],
            },
            createur: { email: 'email.createur@mail.fr' },
          }),
          new Service({
            id: '789',
            descriptionService: {
              nomService: 'Un deuxième service',
              organisationsResponsables: [],
            },
            createur: { email: 'email.createur@mail.fr' },
          }),
        ]);

      testeur.adaptateurCsv().genereCsvServices = (donneesServices) => {
        expect(donneesServices.length).to.be(1);
        expect(donneesServices[0].id).to.equal('456');
        done();
        return Promise.resolve('Fichier CSV');
      };

      axios
        .get('http://localhost:1234/api/services/export.csv?idsServices=456')
        .catch((e) => done(e.response?.data || e));
    });

    it('utilise un adaptateur de CSV pour la génération', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      testeur.depotDonnees().homologations = () =>
        Promise.resolve([
          new Service({
            id: '456',
            descriptionService: {
              nomService: 'Un service',
              organisationsResponsables: ['ANSSI'],
            },
            createur: { id: '123', email: 'email.createur@mail.fr' },
          }),
        ]);

      let adaptateurCsvAppele = false;
      testeur.adaptateurCsv().genereCsvServices = (donnees) => {
        adaptateurCsvAppele = true;

        const service = donnees[0];
        expect(service.nomService).to.eql('Un service');
        expect(service.organisationsResponsables).to.eql(['ANSSI']);
        expect(service.nombreContributeurs).to.eql(1);
        expect(service.estCreateur).to.be(true);
        expect(service.indiceCyber).not.to.be(undefined);
        expect(service.statutHomologation.libelle).to.be('Non réalisée');

        return Promise.resolve('Fichier CSV');
      };

      axios
        .get('http://localhost:1234/api/services/export.csv?idsServices=456')
        .then(() => {
          expect(adaptateurCsvAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('sert un fichier de type CSV', (done) => {
      verifieTypeFichierServiEstCSV(
        'http://localhost:1234/api/services/export.csv',
        done
      );
    });

    it('sert un fichier dont le nom contient la date du jour en format court', (done) => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      verifieNomFichierServi(
        'http://localhost:1234/api/services/export.csv',
        'MSS_services_20230128.csv',
        done
      );
    });

    it("reste robuste en cas d'échec de génération de CSV", (done) => {
      testeur.adaptateurCsv().genereCsvServices = () => Promise.reject();

      axios
        .get('http://localhost:1234/api/services/export.csv')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/seuilCriticite`', () => {
    it('vérifie que les CGU sont acceptées', (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          'http://localhost:1234/api/seuilCriticite',
          done
        );
    });

    it('détermine le seuil de criticité pour le service', (done) => {
      testeur.referentiel().criticite = (
        idsFonctionnalites,
        idsDonnees,
        idDelai
      ) => {
        expect(idsFonctionnalites).to.eql(['f1', 'f2']);
        expect(idsDonnees).to.eql(['d1', 'd2']);
        expect(idDelai).to.equal('unDelai');
        return 'moyen';
      };

      axios('http://localhost:1234/api/seuilCriticite', {
        params: {
          fonctionnalites: ['f1', 'f2'],
          donneesCaracterePersonnel: ['d1', 'd2'],
          delaiAvantImpactCritique: 'unDelai',
        },
      })
        .then((reponse) =>
          expect(reponse.data).to.eql({ seuilCriticite: 'moyen' })
        )
        .then(() => done())
        .catch(done);
    });

    it('retourne une erreur HTTP 422 si les données sont invalides', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Données invalides',
        {
          method: 'get',
          url: 'http://localhost:1234/api/seuilCriticite',
          params: { delaiAvantImpactCritique: 'delaiInvalide' },
        },
        done
      );
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
        infolettreAcceptee: 'true',
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
          'poste',
          'rssi',
          'delegueProtectionDonnees',
          'nomEntitePublique',
          'departementEntitePublique',
          'infolettreAcceptee',
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

    it('convertit le RSSI en booléen', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({ rssi }) => {
        expect(rssi).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.rssi = 'true';

      axios
        .post('http://localhost:1234/api/utilisateur', donneesRequete)
        .then(() => done())
        .catch(done);
    });

    it('convertit le délégué à la protection des données en booléen', (done) => {
      testeur.depotDonnees().nouvelUtilisateur = ({
        delegueProtectionDonnees,
      }) => {
        expect(delegueProtectionDonnees).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.delegueProtectionDonnees = 'true';

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
          rssi: true,
          delegueProtectionDonnees: false,
          cguAcceptees: true,
          infolettreAcceptee: true,
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

  describe('quand requête PUT sur `/api/motDePasse`', () => {
    let utilisateur;

    beforeEach(() => {
      utilisateur = { id: '123', genereToken: () => 'un token' };

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourMotDePasse = () => Promise.resolve(utilisateur);
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = () =>
        Promise.resolve(utilisateur);
      depotDonnees.valideAcceptationCGUPourUtilisateur = () =>
        Promise.resolve(utilisateur);
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeJWT(
          { method: 'put', url: 'http://localhost:1234/api/motDePasse' },
          done
        );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['cguAcceptees'],
        {
          method: 'put',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: 'mdp', cguAcceptees: true },
        },
        done
      );
    });

    it('met à jour le mot de passe', (done) => {
      let motDePasseMisAJour = false;

      expect(utilisateur.id).to.equal('123');
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourMotDePasse = (
        idUtilisateur,
        motDePasse
      ) => {
        try {
          expect(idUtilisateur).to.equal('123');
          expect(motDePasse).to.equal('mdp_ABC12345');
          motDePasseMisAJour = true;
          return Promise.resolve(utilisateur);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .put('http://localhost:1234/api/motDePasse', {
          motDePasse: 'mdp_ABC12345',
        })
        .then((reponse) => {
          expect(motDePasseMisAJour).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("ne fait rien si aucun nouveau mot de passe n'est renseigné (possible tant que le changement de MDP se fait sur la page profil utilisateur)", (done) => {
      let motDePasseMisAJour = false;

      testeur.depotDonnees().metsAJourMotDePasse = () => {
        motDePasseMisAJour = true;
        return Promise.resolve();
      };

      axios
        .put('http://localhost:1234/api/motDePasse', { motDePasse: undefined })
        .then((reponse) => expect(reponse.status).to.equal(204))
        .then(() => expect(motDePasseMisAJour).to.be(false))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    it('retourne une erreur HTTP 422 si le mot de passe est invalide', (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe invalide',
        {
          method: 'put',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: '' },
        },
        done
      );
    });

    it("retourne une erreur HTTP 422 si le mot de passe n'est pas assez robuste", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe trop simple',
        {
          method: 'put',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: '1234' },
        },
        done
      );
    });

    it('pose un nouveau cookie', (done) => {
      axios
        .put('http://localhost:1234/api/motDePasse', {
          motDePasse: 'mdp_ABC12345',
        })
        .then((reponse) => testeur.verifieJetonDepose(reponse, done))
        .catch((e) => done(e.response?.data || e));
    });

    it("invalide l'identifiant de réinitialisation de mot de passe", (done) => {
      let idResetSupprime = false;

      expect(utilisateur.id).to.equal('123');
      testeur.depotDonnees().supprimeIdResetMotDePassePourUtilisateur = (u) => {
        try {
          expect(u.id).to.equal('123');
          idResetSupprime = true;
          return Promise.resolve(u);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .put('http://localhost:1234/api/motDePasse', {
          motDePasse: 'mdp_ABC12345',
        })
        .then(() => expect(idResetSupprime).to.be(true))
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });

    describe("si les CGU n'ont pas déjà été acceptées", () => {
      beforeEach(() => {
        const cguNonAcceptees = false;
        testeur.middleware().reinitialise({
          idUtilisateur: utilisateur.id,
          acceptationCGU: cguNonAcceptees,
        });
      });

      describe("et que l'utilisateur n'est pas en train de les accepter", () => {
        it('renvoie une erreur HTTP 422', (done) => {
          testeur.verifieRequeteGenereErreurHTTP(
            422,
            'CGU non acceptées',
            {
              method: 'put',
              url: 'http://localhost:1234/api/motDePasse',
              data: { motDePasse: 'mdp_12345' },
            },
            done
          );
        });

        it('ne met pas le mot de passe à jour', (done) => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = () => {
            motDePasseMisAJour = true;
            return Promise.resolve(utilisateur);
          };

          axios
            .put('http://localhost:1234/api/motDePasse', {
              motDePasse: 'mdp_12345',
            })
            .then(() => expect(motDePasseMisAJour).to.be(false))
            .then(() =>
              done(
                'La tentative de mise à jour aurait dû retourner une erreur HTTP'
              )
            )
            .catch(() => {
              expect(motDePasseMisAJour).to.be(false);
              done();
            })
            .catch((e) => done(e.response?.data || e));
        });
      });

      describe("et que l'utilisateur est en train de les accepter", () => {
        it("demande au dépôt d'enregistrer que les CGU sont acceptées", (done) => {
          let acceptationCGUEnregistree = false;

          expect(utilisateur.id).to.equal('123');
          testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = (u) => {
            try {
              expect(u.id).to.equal('123');
              acceptationCGUEnregistree = true;
              return Promise.resolve(u);
            } catch (e) {
              return Promise.reject(e);
            }
          };

          axios
            .put('http://localhost:1234/api/motDePasse', {
              motDePasse: 'mdp_ABC12345',
              cguAcceptees: 'true',
            })
            .then(() => expect(acceptationCGUEnregistree).to.be(true))
            .then(() => done())
            .catch((e) => done(e.response?.data || e));
        });

        it('met à jour le mot de passe', (done) => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = () => {
            motDePasseMisAJour = true;
            return Promise.resolve(utilisateur);
          };

          axios
            .put('http://localhost:1234/api/motDePasse', {
              motDePasse: 'mdp_ABC12345',
              cguAcceptees: 'true',
            })
            .then(() => expect(motDePasseMisAJour).to.be(true))
            .then(() => done())
            .catch((e) => done(e.response?.data || e));
        });
      });
    });
  });

  describe('quand requête PUT sur `/api/utilisateur`', () => {
    let utilisateur;
    let donneesRequete;

    beforeEach(() => {
      utilisateur = { id: '123' };

      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        telephone: '0100000000',
        rssi: 'true',
        delegueProtectionDonnees: 'false',
        poste: "Chargé des systèmes d'informations",
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
        infolettreAcceptee: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'prenom',
          'nom',
          'telephone',
          'cguAcceptees',
          'poste',
          'rssi',
          'delegueProtectionDonnees',
          'nomEntitePublique',
          'departementEntitePublique',
          'infolettreAcceptee',
        ],
        {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", (done) => {
      donneesRequete.prenom = '';

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'La mise à jour de l\'utilisateur a échoué car les paramètres sont invalides. La propriété "prenom" est requise',
        {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it('convertit le RSSI en booléen', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

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

      axios
        .put('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("convertit l'infolettre acceptée en valeur booléenne", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

      testeur.depotDonnees().metsAJourUtilisateur = (
        id,
        { infolettreAcceptee }
      ) => {
        try {
          expect(id).to.equal('123');
          expect(infolettreAcceptee).to.equal(false);
          return Promise.resolve(utilisateur);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      donneesRequete.infolettreAcceptee = 'false';

      axios
        .put('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('convertit le délégué à la protection des données en booléen', (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

      testeur.depotDonnees().metsAJourUtilisateur = (
        id,
        { delegueProtectionDonnees }
      ) => {
        try {
          expect(id).to.equal('123');
          expect(delegueProtectionDonnees).to.equal(true);
          return Promise.resolve(utilisateur);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      donneesRequete.delegueProtectionDonnees = 'true';

      axios
        .put('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("met à jour les autres informations de l'utilisateur", (done) => {
      let infosMisesAJour = false;

      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

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

      axios
        .put('http://localhost:1234/api/utilisateur', donneesRequete)
        .then((reponse) => {
          expect(infosMisesAJour).to.be(true);
          expect(reponse.status).to.equal(200);
          expect(reponse.data).to.eql({ idUtilisateur: '123' });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    describe("sur demande de recherche de l'utilisateur", () => {
      it("demande au dépôt de retrouver l'utilisateur", (done) => {
        let depotAppele = false;
        testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

        testeur.depotDonnees().utilisateur = (idUtilisateur) => {
          expect(idUtilisateur).to.eql(123);
          depotAppele = true;
          return Promise.resolve(utilisateur);
        };

        axios
          .put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => {
            expect(depotAppele).to.be(true);
            done();
          })
          .catch(done);
      });

      it("inscrit l'utilisateur à l'infolettre si il l'a demandé", (done) => {
        let inscriptionAppelee = false;
        donneesRequete.infolettreAcceptee = 'true';
        utilisateur.email = 'jean.dupont@mail.fr';
        testeur.depotDonnees().utilisateur = () =>
          Promise.resolve({ ...utilisateur, infolettreAcceptee: false });

        testeur.adaptateurMail().inscrisInfolettre = (destinataire) => {
          inscriptionAppelee = true;
          expect(destinataire).to.equal('jean.dupont@mail.fr');
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => {
            expect(inscriptionAppelee).to.be(true);
            done();
          })
          .catch(done);
      });

      it("désinscrit l'utilisateur à l'infolettre si il l'a demandé", (done) => {
        let desinscriptionAppelee = false;
        donneesRequete.infolettreAcceptee = 'false';
        utilisateur.email = 'jean.dupont@mail.fr';
        testeur.depotDonnees().utilisateur = () =>
          Promise.resolve({ ...utilisateur, infolettreAcceptee: true });

        testeur.adaptateurMail().desinscrisInfolettre = (destinataire) => {
          desinscriptionAppelee = true;
          expect(destinataire).to.equal('jean.dupont@mail.fr');
          return Promise.resolve();
        };

        axios
          .put('http://localhost:1234/api/utilisateur', donneesRequete)
          .then(() => {
            expect(desinscriptionAppelee).to.be(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('quand requête GET sur `/api/utilisateurCourant`', () => {
    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        {
          method: 'get',
          url: 'http://localhost:1234/api/utilisateurCourant',
        },
        done
      );
    });

    it("renvoie l'utilisateur correspondant à l'identifiant", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = (idUtilisateur) => {
        try {
          expect(idUtilisateur).to.equal('123');
          return Promise.resolve({ toJSON: () => ({ id: '123' }) });
        } catch (erreur) {
          return Promise.reject(erreur);
        }
      };

      axios
        .get('http://localhost:1234/api/utilisateurCourant')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { utilisateur } = reponse.data;
          expect(utilisateur.id).to.equal('123');
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("répond avec un code 401 quand il n'y a pas d'identifiant", (done) => {
      testeur.middleware().reinitialise({ idUtilisateur: '' });

      axios
        .get('http://localhost:1234/api/utilisateurCourant')
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

  describe('quand requête POST sur `/api/autorisation`', () => {
    const autorisation = { id: '111' };
    const utilisateur = {
      id: '999',
      genereToken: () => 'un token',
      accepteCGU: () => true,
    };

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      autorisation.permissionAjoutContributeur = true;

      testeur.depotDonnees().autorisationExiste = () => Promise.resolve(false);
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisation);
      testeur.depotDonnees().utilisateurAvecEmail = () =>
        Promise.resolve(utilisateur);
      testeur.depotDonnees().ajouteContributeurAHomologation = () =>
        Promise.resolve();

      const utilisateurCourant = { prenomNom: () => '' };
      testeur.depotDonnees().utilisateur = () =>
        Promise.resolve(utilisateurCourant);

      const homologation = { nomService: () => '' };
      testeur.depotDonnees().homologation = () => Promise.resolve(homologation);

      testeur.adaptateurMail().envoieMessageInvitationContribution = () =>
        Promise.resolve();
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idHomologation', 'emailContributeur'],
          { method: 'post', url: 'http://localhost:1234/api/autorisation' },
          done
        );
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'post',
          url: 'http://localhost:1234/api/autorisation',
        },
        done
      );
    });

    it("vérifie que l'utilisateur a le droit d'ajouter un contributeur", (done) => {
      let autorisationInterrogee = false;
      testeur.depotDonnees().autorisationPour = (
        idUtilisateur,
        idHomologation
      ) => {
        try {
          expect(testeur.middleware().idUtilisateurCourant()).to.equal('456');

          expect(idUtilisateur).to.equal('456');
          expect(idHomologation).to.equal('123');
          autorisationInterrogee = true;
          return Promise.resolve(autorisation);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
        .then(() => {
          expect(autorisationInterrogee).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit d'ajouter un contributeur", (done) => {
      autorisation.permissionAjoutContributeur = false;
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisation);

      axios
        .post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
        .then(() => {
          done('La requête aurait dû lever une erreur HTTP 403');
        })
        .catch((e) => {
          expect(e.response.status).to.equal(403);
          expect(e.response.data).to.equal(
            "Ajout non autorisé d'un contributeur"
          );
          done();
        })
        .catch(done);
    });

    describe('si le contributeur existe déjà', () => {
      beforeEach(() => {
        const contributeur = { email: 'jean.dupont@mail.fr' };
        testeur.depotDonnees().utilisateurAvecEmail = () =>
          Promise.resolve(contributeur);

        const utilisateurCourant = { prenomNom: () => 'Utilisateur Courant' };
        testeur.depotDonnees().utilisateur = () =>
          Promise.resolve(utilisateurCourant);

        const homologation = { id: '123', nomService: () => 'Nom Service' };
        testeur.depotDonnees().homologation = () =>
          Promise.resolve(homologation);
      });

      describe('avec un email en majuscules', () => {
        it('retrouve le compte et le ne recrée donc pas', (done) => {
          testeur.depotDonnees().utilisateurAvecEmail = (emailRecherche) => {
            const enMinuscules = 'jean.dupont@mail.fr';
            expect(emailRecherche).to.be(enMinuscules);
            done();
            return Promise.resolve({ email: enMinuscules });
          };

          testeur.depotDonnees().nouvelUtilisateur = () => {
            done("L'utilisateur ne devrait pas être re-créé");
          };

          axios
            .post('http://localhost:1234/api/autorisation', {
              emailContributeur: 'Jean.DUPONT@mail.fr',
              idHomologation: '123',
            })
            .catch((e) => done(e.response?.data || e));
        });
      });

      describe("si le contributeur n'a pas déjà été invité", () => {
        it('envoie un email de notification au contributeur', (done) => {
          let emailEnvoye = false;

          testeur.adaptateurMail().envoieMessageInvitationContribution = (
            destinataire,
            prenomNomEmetteur,
            nomService,
            idHomologation
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

          axios
            .post('http://localhost:1234/api/autorisation', {
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
          testeur.depotDonnees().autorisationExiste = () =>
            Promise.resolve(true);
        });

        it("n'envoie pas d'email d'invitation à contribuer", (done) => {
          let emailEnvoye = false;

          testeur.adaptateurMail().envoieMessageInvitationContribution = () => {
            emailEnvoye = true;
            return Promise.resolve();
          };

          axios
            .post('http://localhost:1234/api/autorisation', {
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

          axios
            .post('http://localhost:1234/api/autorisation', {
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

        it("renvoie une erreur explicite à propos de l'invitation déjà envoyée", (done) => {
          axios
            .post('http://localhost:1234/api/autorisation', {
              emailContributeur: 'jean.dupont@mail.fr',
              idHomologation: '123',
            })
            .then(() => done('Le serveur aurait dû lever une erreur HTTP'))
            .catch((e) => {
              expect(e.response.data).to.eql({
                erreur: { code: 'INVITATION_DEJA_ENVOYEE' },
              });
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
        testeur.depotDonnees().utilisateurAvecEmail = () =>
          Promise.resolve(utilisateurInexistant);
        testeur.adaptateurMail().envoieMessageInvitationInscription = () =>
          Promise.resolve();
        testeur.adaptateurMail().creeContact = () => Promise.resolve();

        contributeurCree = {
          id: '789',
          email: 'jean.dupont@mail.fr',
          idResetMotDePasse: 'reset',
        };
        testeur.depotDonnees().nouvelUtilisateur = () =>
          Promise.resolve(contributeurCree);
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

        axios
          .post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'jean.dupont@mail.fr',
            idHomologation: '123',
          })
          .then(() => {
            expect(nouveauContributeurCree).to.be(true);
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it('crée un contact email', (done) => {
        testeur.adaptateurMail().creeContact = (
          destinataire,
          prenom,
          nom,
          bloqueEmails
        ) => {
          expect(destinataire).to.equal('jean.dupont@mail.fr');
          expect(prenom).to.equal('');
          expect(nom).to.equal('');
          expect(bloqueEmails).to.equal(true);
          return Promise.resolve();
        };

        axios
          .post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'jean.dupont@mail.fr',
            idHomologation: '123',
          })
          .then(() => done())
          .catch((e) => done(e.response?.data || e));
      });

      it('crée le compte avec un email converti en minuscules', (done) => {
        testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
          const enMinuscules = 'jean.dupont@mail.fr';
          expect(donneesUtilisateur.email).to.be(enMinuscules);
          done();
          return Promise.resolve(contributeurCree);
        };

        axios
          .post('http://localhost:1234/api/autorisation', {
            emailContributeur: 'Jean.DUPONT@mail.fr',
            idHomologation: '123',
          })
          .catch((e) => done(e.response?.data || e));
      });

      it("envoie un mail d'invitation au contributeur créé", (done) => {
        let messageEnvoye = false;
        testeur.middleware().reinitialise({ idUtilisateur: '456' });

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
          destinataire,
          prenomNomEmetteur,
          nomService,
          idResetMotDePasse
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

        axios
          .post('http://localhost:1234/api/autorisation', {
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
        idContributeur,
        idHomologation
      ) => {
        try {
          expect(utilisateur.id).to.equal('999');
          expect(idContributeur).to.equal('999');
          expect(idHomologation).to.equal('123');
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
        .then((reponse) => {
          expect(reponse.status).to.be(200);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("envoie un événement d'invitation contributeur via l'adaptateur de tracking", (done) => {
      let donneesPassees = {};
      let idUtilisateurPasse;
      testeur.depotDonnees().homologations = (idUtilisateur) => {
        idUtilisateurPasse = idUtilisateur;
        const serviceBouchon3Contributeurs = { contributeurs: ['a', 'b', 'c'] };
        return Promise.resolve([serviceBouchon3Contributeurs]);
      };

      testeur.adaptateurTracking().envoieTrackingInvitationContributeur = (
        destinataire,
        donneesEvenement
      ) => {
        donneesPassees = { destinataire, donneesEvenement };
        return Promise.resolve();
      };

      axios
        .post('http://localhost:1234/api/autorisation', {
          emailContributeur: 'jean.dupont@mail.fr',
          idHomologation: '123',
        })
        .then(() => {
          expect(idUtilisateurPasse).to.be('456');
          expect(donneesPassees).to.eql({
            destinataire: 'jean.dupont@mail.fr',
            donneesEvenement: { nombreMoyenContributeurs: 3 },
          });
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it('retourne une erreur HTTP 422 si le dépôt a levé une `ErreurModele`', (done) => {
      testeur.depotDonnees().ajouteContributeurAHomologation = () => {
        throw new ErreurModele('oups');
      };

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        'oups',
        {
          method: 'post',
          url: 'http://localhost:1234/api/autorisation',
          data: {},
        },
        done
      );
    });
  });

  describe('quand requête DELETE sur `/api/autorisation`', () => {
    const autorisation = { id: '111' };

    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      autorisation.permissionSuppressionContributeur = true;
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisation);
      testeur.depotDonnees().supprimeContributeur = () => Promise.resolve();
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idHomologation', 'idContributeur'],
          { method: 'delete', url: 'http://localhost:1234/api/autorisation' },
          done
        );
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeAcceptationCGU(
        {
          method: 'delete',
          url: 'http://localhost:1234/api/autorisation',
        },
        done
      );
    });

    it("vérifie que l'utilisateur a le droit de supprimer un contributeur", (done) => {
      let autorisationInterrogee = false;
      testeur.depotDonnees().autorisationPour = (
        idUtilisateur,
        idHomologation
      ) => {
        try {
          expect(testeur.middleware().idUtilisateurCourant()).to.equal('456');

          expect(idUtilisateur).to.equal('456');
          expect(idHomologation).to.equal('123');
          autorisationInterrogee = true;
          return Promise.resolve(autorisation);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      axios
        .delete('http://localhost:1234/api/autorisation', {
          params: { idHomologation: '123' },
        })
        .then(() => {
          expect(autorisationInterrogee).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 403 si l'utilisateur n'a pas le droit de supprimer un contributeur", (done) => {
      autorisation.permissionSuppressionContributeur = false;
      testeur.depotDonnees().autorisationPour = () =>
        Promise.resolve(autorisation);

      axios
        .delete('http://localhost:1234/api/autorisation', {
          params: { idHomologation: '123' },
        })
        .then(() => {
          done('La requête aurait dû lever une erreur HTTP 403');
        })
        .catch((e) => {
          expect(e.response.status).to.equal(403);
          expect(e.response.data).to.equal(
            'Suppression non autorisé pour un contributeur'
          );
          done();
        })
        .catch(done);
    });

    it("utilise le dépôt de données pour supprimer l'autorisation du contributeur", (done) => {
      let depotInterroge = false;
      testeur.depotDonnees().supprimeContributeur = (
        idContributeur,
        idHomologation
      ) => {
        depotInterroge = true;
        expect(idContributeur).to.equal('999');
        expect(idHomologation).to.equal('123');
        return Promise.resolve({});
      };

      axios
        .delete('http://localhost:1234/api/autorisation', {
          params: {
            idHomologation: '123',
            idContributeur: '999',
          },
        })
        .then(() => {
          expect(depotInterroge).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("retourne une erreur HTTP 424 si le dépôt ne peut pas supprimer l'autorisation", (done) => {
      testeur.depotDonnees().supprimeContributeur = () =>
        Promise.reject(new Error("Un message d'erreur"));

      axios
        .delete('http://localhost:1234/api/autorisation', {
          params: {
            idHomologation: '123',
            emailContributeur: 'jean.dupont@mail.fr',
          },
        })
        .then(() => {
          done('La requête aurait dû lever une erreur HTTP 424');
        })
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          expect(e.response.data).to.equal("Un message d'erreur");
          done();
        });
    });
  });

  describe('quand requête GET sur `/api/dureeSession`', () => {
    it('renvoie la durée de session', (done) => {
      axios
        .get('http://localhost:1234/api/dureeSession')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { dureeSession } = reponse.data;
          expect(dureeSession).to.equal(3600000);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });

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
