import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';

import {
  ErreurEmailManquant,
  ErreurJWTInvalide,
  ErreurJWTManquant,
  ErreurUtilisateurExistant,
} from '../../../src/erreurs.js';

import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import {
  decodeSessionDuCookie,
  expectContenuSessionValide,
} from '../../aides/cookie.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';

describe('Le serveur MSS des routes publiques /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête POST sur `/api/utilisateur`', () => {
    const utilisateur = { id: '123', genereToken: () => 'un token' };
    let donneesRequete;

    beforeEach(() => {
      donneesRequete = {
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        siretEntite: '13000766900018',
        estimationNombreServices: {
          borneBasse: '1',
          borneHaute: '10',
        },
        cguAcceptees: 'true',
        infolettreAcceptee: 'true',
        transactionnelAccepte: 'true',
        token: 'unTokenValide',
      };

      testeur.adaptateurJWT().decode = (token) => {
        if (token === 'unTokenValide')
          return {
            prenom: 'Jean',
            nom: 'Dupont',
            email: 'jean.dupont@mail.fr',
          };
        if (token === 'tokenInvalide') {
          throw new ErreurJWTInvalide();
        }
        throw new ErreurJWTManquant();
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

    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/utilisateur',
      });
    });

    describe('concernant la validation des données de la requête', () => {
      it('accepte une payload correcte', async () => {
        const reponse = await testeur.post('/api/utilisateur', donneesRequete);

        expect(reponse.status).to.equal(200);
      });

      it.each([
        { valeurErronee: '01234567890' },
        { valeurErronee: '1234567890' },
        { valeurErronee: '012345678' },
      ])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le téléphone',
        async ({ valeurErronee }) => {
          donneesRequete.telephone = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([
        { valeurErronee: 'false' },
        { valeurErronee: '1' },
        { valeurErronee: undefined },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation des CGU",
        async ({ valeurErronee }) => {
          donneesRequete.cguAcceptees = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([{ valeurErronee: '1' }, { valeurErronee: undefined }])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation de l'infolettre",
        async ({ valeurErronee }) => {
          donneesRequete.infolettreAcceptee = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([{ valeurErronee: '1' }, { valeurErronee: undefined }])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          donneesRequete.transactionnelAccepte = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([
        { valeurErronee: [] },
        { valeurErronee: [uneChaineDeCaracteres(201, 'a')] },
        {
          valeurErronee: [
            'poste1',
            'poste2',
            'poste3',
            'poste4',
            'poste5',
            'poste6',
            'poste7',
            'poste8',
            'poste9',
          ],
        },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          donneesRequete.postes = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([
        { valeurErronee: { borneBasse: '10', borneHaute: '42' } },
        { valeurErronee: undefined },
      ])(
        "renvoie une erreur 400 car $valeurErronee est une valeur invalide pour l'acceptation du transactionnel",
        async ({ valeurErronee }) => {
          donneesRequete.estimationNombreServices = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([
        { valeurValide: { borneBasse: '1', borneHaute: '10' } },
        { valeurValide: { borneBasse: '10', borneHaute: '49' } },
        { valeurValide: { borneBasse: '50', borneHaute: '99' } },
        { valeurValide: { borneBasse: '100', borneHaute: '100' } },
        { valeurValide: { borneBasse: '-1', borneHaute: '-1' } },
      ])(
        'accepte les valeurs de bornes prédéfinies',
        async ({ valeurValide }) => {
          donneesRequete.estimationNombreServices = valeurValide;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(200);
        }
      );

      it.each([{ valeurErronee: '1234' }, { valeurErronee: undefined }])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le siret',
        async ({ valeurErronee }) => {
          donneesRequete.siretEntite = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it.each([{ valeurErronee: '' }, { valeurErronee: undefined }])(
        'renvoie une erreur 400 car $valeurErronee est une valeur invalide pour le token',
        async ({ valeurErronee }) => {
          donneesRequete.token = valeurErronee;

          const reponse = await testeur.post(
            '/api/utilisateur',
            donneesRequete
          );

          expect(reponse.status).to.equal(400);
        }
      );

      it('renvoie une erreur 400 si un paramètre est en trop', async () => {
        donneesRequete.unParametreInconnu = 'hello';

        const reponse = await testeur.post('/api/utilisateur', donneesRequete);

        expect(reponse.status).to.equal(400);
      });
    });

    it("convertit l'email en minuscules", async () => {
      testeur.depotDonnees().nouvelUtilisateur = ({ email }) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      testeur.adaptateurJWT().decode = () => ({
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'Jean.DUPONT@mail.fr',
      });

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it('si les CGU sont acceptées, passe la valeur de la version actuelle des CGU au dépôt', async () => {
      let cguRecues;
      testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
      testeur.depotDonnees().nouvelUtilisateur = async ({ cguAcceptees }) => {
        cguRecues = cguAcceptees;
        return utilisateur;
      };

      donneesRequete.cguAcceptees = 'true';

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(cguRecues).to.be('v2.0');
    });

    it("convertit l'infolettre acceptée en valeur booléenne", async () => {
      testeur.depotDonnees().nouvelUtilisateur = ({ infolettreAcceptee }) => {
        expect(infolettreAcceptee).to.equal(true);
        return Promise.resolve(utilisateur);
      };

      donneesRequete.infolettreAcceptee = 'true';

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("demande au dépôt de créer l'utilisateur", async () => {
      testeur.depotDonnees().nouvelUtilisateur = (donneesUtilisateur) => {
        const donneesAttendues = {
          prenom: 'Jean',
          nom: 'Dupont',
          telephone: '0100000000',
          entite: {
            siret: '13000766900018',
          },
          estimationNombreServices: {
            borneBasse: 1,
            borneHaute: 10,
          },
          infolettreAcceptee: true,
          transactionnelAccepte: true,
          postes: ['RSSI', "Chargé des systèmes d'informations"],
          cguAcceptees: true,
          email: 'jean.dupont@mail.fr',
        };
        expect(donneesUtilisateur).to.eql(donneesAttendues);
        return Promise.resolve(utilisateur);
      };

      const reponse = await testeur.post('/api/utilisateur', donneesRequete);

      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({ idUtilisateur: '123' });
    });

    it("utilise l'adaptateur de tracking pour envoyer un événement d'inscription", async () => {
      testeur.depotDonnees().nouvelUtilisateur = () =>
        Promise.resolve({ email: 'jean.dupont@mail.fr' });

      let donneesPassees = {};
      testeur.adaptateurTracking().envoieTrackingInscription = (
        destinataire
      ) => {
        donneesPassees = { destinataire };
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(donneesPassees).to.eql({
        destinataire: 'jean.dupont@mail.fr',
      });
    });

    it('crée un contact email', async () => {
      testeur.adaptateurMail().creeContact = (
        destinataire,
        prenom,
        nom,
        telephone,
        bloqueEmails,
        bloqueMarketing
      ) => {
        expect(destinataire).to.equal('jean.dupont@mail.fr');
        expect(prenom).to.equal('Jean');
        expect(nom).to.equal('Dupont');
        expect(telephone).to.equal('0100000000');
        expect(bloqueEmails).to.equal(false);
        expect(bloqueMarketing).to.be(false);
        return Promise.resolve();
      };

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("envoie un message de notification à l'utilisateur créé", async () => {
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

      await testeur.post('/api/utilisateur', donneesRequete);
    });

    it("n'envoie pas de message de notification à l'utilisateur Agent Connect créé", async () => {
      testeur.adaptateurMail().envoieMessageFinalisationInscription = () => {
        expect().fail("N'aurait pas dû envoyer de message");
      };

      await testeur.post('/api/utilisateur', {
        ...donneesRequete,
        agentConnect: true,
      });
    });

    describe("si l'envoi de mail échoue", () => {
      beforeEach(() => {
        testeur.adaptateurMail().envoieMessageFinalisationInscription = () =>
          Promise.reject(new Error('Oups.'));
        testeur.depotDonnees().supprimeUtilisateur = () => Promise.resolve();
      });

      it('retourne une erreur HTTP 424', async () => {
        await testeur.verifieRequeteGenereErreurHTTP(
          424,
          "L'envoi de l'email de finalisation d'inscription a échoué",
          {
            method: 'post',
            url: '/api/utilisateur',
            data: donneesRequete,
          }
        );
      });
    });

    it('envoie un email de notification de tentative de réinscription', async () => {
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

      await testeur.post('/api/utilisateur', donneesRequete);

      expect(notificationEnvoyee).to.be(true);
    });

    it("génère une erreur HTTP 422 si l'email n'est pas renseigné", async () => {
      testeur.depotDonnees().nouvelUtilisateur = async () => {
        throw new ErreurEmailManquant('oups');
      };

      await testeur.verifieRequeteGenereErreurHTTP(422, 'oups', {
        method: 'post',
        url: '/api/utilisateur',
        data: donneesRequete,
      });
    });

    it('jette une erreur si le token est invalide', async () => {
      donneesRequete.token = 'tokenInvalide';

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Le token est invalide',
        {
          method: 'post',
          url: '/api/utilisateur',
          data: donneesRequete,
        }
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

    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/reinitialisationMotDePasse',
      });
    });

    it("convertit l'email en minuscules", async () => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) => {
        expect(email).to.equal('jean.dupont@mail.fr');
        return Promise.resolve(utilisateur);
      };

      await testeur.post('/api/reinitialisationMotDePasse', {
        email: 'Jean.DUPONT@mail.fr',
      });
    });

    it("échoue silencieusement si l'email n'est pas renseigné", async () => {
      testeur.depotDonnees().nouvelUtilisateur = () => Promise.resolve();

      await testeur.post('/api/reinitialisationMotDePasse');
    });

    it('demande au dépôt de réinitialiser le mot de passe', async () => {
      testeur.depotDonnees().reinitialiseMotDePasse = (email) =>
        new Promise((resolve) => {
          expect(email).to.equal('jean.dupont@mail.fr');
          resolve(utilisateur);
        });

      const reponse = await testeur.post('/api/reinitialisationMotDePasse', {
        email: 'jean.dupont@mail.fr',
      });

      expect(reponse.status).to.equal(200);
      expect(reponse.body).to.eql({});
    });

    it("envoie un mail à l'utilisateur", async () => {
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

      await testeur.post('/api/reinitialisationMotDePasse', {
        email: 'jean.dupont@mail.fr',
      });

      expect(messageEnvoye).to.be(true);
    });
  });

  describe('quand requête POST sur `/api/token`', () => {
    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/token',
      });
    });

    it("authentifie l'utilisateur avec le login en minuscules", async () => {
      testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur =
        async () => {};

      const utilisateur = {
        toJSON: () => {},
        genereToken: () => {},
        accepteCGU: () => true,
        estUnInvite: () => false,
      };

      testeur.depotDonnees().utilisateurAuthentifie = (login, motDePasse) => {
        try {
          expect(login).to.equal('jean.dupont@mail.fr');
          expect(motDePasse).to.equal('mdp_12345');
          return Promise.resolve(utilisateur);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal = async () => {};
      testeur.depotDonnees().utilisateur = async () => utilisateur;

      await testeur.post('/api/token', {
        login: 'Jean.DUPONT@mail.fr',
        motDePasse: 'mdp_12345',
      });
    });

    describe("avec authentification réussie de l'utilisateur", () => {
      let utilisateur;

      beforeEach(() => {
        utilisateur = {
          email: 'jean.dupont@mail.fr',
          id: '456',
          toJSON: () => ({ prenomNom: 'Jean Dupont' }),
          genereToken: (source) => `un token de source ${source}`,
          accepteCGU: () => true,
          estUnInvite: () => false,
        };

        testeur.depotDonnees().utilisateurAuthentifie = () =>
          Promise.resolve(utilisateur);
        testeur.depotDonnees().utilisateur = async () => utilisateur;
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
          async () => {};

        testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur =
          async () => {};
      });

      it('pose un cookie', async () => {
        const reponse = await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        await testeur.verifieSessionDeposee(reponse);
      });

      it('ajoute une session utilisateur', async () => {
        const reponse = await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        expectContenuSessionValide(reponse, 'MSS', true, false);
      });

      it("délègue au dépôt de données l'enregistrement de la dernière connexion utilisateur'", async () => {
        let idUtilisateurPasse = {};
        let sourcePassee;
        testeur.depotDonnees().enregistreNouvelleConnexionUtilisateur = async (
          idUtilisateur,
          source
        ) => {
          idUtilisateurPasse = idUtilisateur;
          sourcePassee = source;
        };

        await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        expect(idUtilisateurPasse).to.be('456');
        expect(sourcePassee).to.be('MSS');
      });

      it('déclenche un rafraîchissement de la copie locale du profil utilisateur (pour recopier les données MPA)', async () => {
        let idUtilisateurPasse;
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal = async (
          idUtilisateur
        ) => {
          idUtilisateurPasse = idUtilisateur;
        };

        await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        expect(idUtilisateurPasse).to.be('456');
      });

      it('lis de nouveau le profil utilisateur après rafraichissement', async () => {
        let idUtilisateurPasse;
        testeur.depotDonnees().utilisateur = async (idUtilisateur) => {
          idUtilisateurPasse = idUtilisateur;
          return utilisateur;
        };

        await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        expect(idUtilisateurPasse).to.be('456');
      });

      it('ajoute la source dans le jeton', async () => {
        utilisateur.genereToken = (source) => `un token de-${source}`;

        const reponse = await testeur.post('/api/token', {
          login: 'jean.dupont@mail.fr',
          motDePasse: 'mdp_12345',
        });

        const token = decodeSessionDuCookie(reponse, 0);
        expect(token.token).to.be('un token de-MSS');
      });
    });

    describe("avec échec de l'authentification de l'utilisateur", () => {
      it('retourne un HTTP 401', async () => {
        testeur.depotDonnees().utilisateurAuthentifie = async () => {};

        await testeur.verifieRequeteGenereErreurHTTP(
          401,
          "L'authentification a échoué",
          { method: 'post', url: '/api/token', data: {} }
        );
      });
    });
  });

  describe('quand requête GET sur `/api/annuaire/organisations`', () => {
    beforeEach(() => {
      testeur.referentiel().estCodeDepartement = () => true;
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['recherche', 'departement'],
          testeur.app(),
          {
            method: 'get',
            url: '/api/annuaire/organisations',
          }
        );
    });

    it('retourne une erreur HTTP 400 si le terme de recherche est vide', async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le terme de recherche ne peut pas être vide',
        {
          method: 'get',
          url: '/api/annuaire/organisations?departement=75',
        }
      );
    });

    it("retourne une erreur HTTP 400 si le département n'est pas dans le referentiel", async () => {
      testeur.referentiel().estCodeDepartement = () => false;
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'Le département doit être valide (01 à 989)',
        {
          method: 'get',
          url: '/api/annuaire/organisations?recherche=mairie&departement=990',
        }
      );
    });

    it("recherche les organisations correspondantes grâce au service d'annuaire", async () => {
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

      const reponse = await testeur.get(
        '/api/annuaire/organisations?recherche=mairie&departement=01'
      );

      expect(adaptateurAppele).to.be(true);
      expect(reponse.status).to.be(200);
      expect(reponse.body.suggestions).to.eql([
        { nom: 'un résultat', departement: '01' },
      ]);
    });
  });

  describe('quand requête POST sur `/api/desinscriptionInfolettre`', () => {
    const donneesRequete = {
      email: 'jean.dujardin@mail.com',
      event: 'unsubscribe',
    };

    it("retourne une erreur HTTP 400 si l'événement n'est pas une désinscription", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "L'événement doit être de type 'unsubscribe'" },
        {
          method: 'post',
          url: '/api/desinscriptionInfolettre',
        }
      );
    });

    it("retourne une erreur HTTP 400 si le champ email n'est pas présent", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "Le champ 'email' doit être présent" },
        {
          method: 'post',
          url: '/api/desinscriptionInfolettre',
          data: { event: 'unsubscribe' },
        }
      );
    });

    it("retourne une erreur HTTP 424 si l'adresse email est introuvable", async () => {
      testeur.depotDonnees().utilisateurAvecEmail = () =>
        Promise.resolve(undefined);

      await testeur.verifieRequeteGenereErreurHTTP(
        424,
        { erreur: "L'email 'jean.dujardin@mail.com' est introuvable" },
        {
          method: 'post',
          url: '/api/desinscriptionInfolettre',
          data: donneesRequete,
        }
      );
    });

    it("vérifie l'adresse IP de la requête", async () => {
      await testeur
        .middleware()
        .verifieAdresseIP(
          ['185.107.232.1/24', '1.179.112.1/20'],
          testeur.app(),
          {
            method: 'post',
            url: '/api/desinscriptionInfolettre',
            data: donneesRequete,
          }
        );
    });

    it("désabonne l'utilisateur des mails marketing", async () => {
      const utilisateur = unUtilisateur()
        .avecId('123')
        .quiAccepteEmailsTransactionnels()
        .construis();
      testeur.depotDonnees().utilisateurAvecEmail = (email) => {
        expect(email).to.equal('jean.dujardin@mail.com');
        return Promise.resolve(utilisateur);
      };
      testeur.depotDonnees().metsAJourUtilisateur = (id, donnees) => {
        expect(id).to.equal('123');
        expect(donnees).to.eql({ transactionnelAccepte: false });
        return Promise.resolve();
      };

      await testeur.post('/api/desinscriptionInfolettre', donneesRequete);
    });
  });

  describe('quand requête GET sur `/api/sante`', () => {
    it('applique une protection de trafic', async () => {
      testeur.depotDonnees().santeDuDepot = async () => {};

      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'get',
        url: '/api/sante',
      });
    });

    it("utilise le dépôt de données pour vérifier l'état de santé de la base", async () => {
      let depotAppele = false;
      testeur.depotDonnees().santeDuDepot = () => {
        depotAppele = true;
      };

      const reponse = await testeur.get('/api/sante');

      expect(depotAppele).to.be(true);
      expect(reponse.status).to.be(200);
    });

    it('renvoi une erreur 503 si le dépôt est défectueux', async () => {
      testeur.depotDonnees().santeDuDepot = () => {
        throw new Error();
      };

      const reponse = await testeur.get('/api/sante');

      expect(reponse.status).to.be(503);
    });

    it('loggue une erreur si le dépôt est défectueux', async () => {
      testeur.depotDonnees().santeDuDepot = () => {
        throw new Error();
      };
      let erreurLoguee;
      testeur.adaptateurGestionErreur().logueErreur = (erreur) => {
        erreurLoguee = erreur;
      };

      try {
        await testeur.get('/api/sante');
        expect().fail("L'appel aurait du échouer");
      } catch (e) {
        expect(erreurLoguee.message).to.be(
          'La base de données est injoignable'
        );
      }
    });

    it('empêche le cache', async () => {
      testeur.depotDonnees().santeDuDepot = () => {};

      const reponse = await testeur.get('/api/sante');

      expect(reponse.headers['surrogate-control']).to.be('no-store');
      expect(reponse.headers['cache-control']).to.be(
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      expect(reponse.headers.expires).to.be('0');
    });
  });
});
