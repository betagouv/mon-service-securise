const axios = require('axios');
const expect = require('expect.js');
const SourceAuthentification = require('../../../src/modeles/sourceAuthentification');
const { expectContenuSessionValide } = require('../../aides/cookie');
const testeurMSS = require('../testeurMSS');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("Le serveur MSS des routes privées /api/* n'ayant pas besoin d'une vérification d'acceptation de CGU", () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête PUT sur `/api/motDePasse`', () => {
    let utilisateur;

    beforeEach(() => {
      utilisateur = {
        id: '123',
        email: 'jean.dujardin@beta.gouv.fr',
        genereToken: (source) => `un token de source ${source}`,
        accepteCGU: () => true,
        estUnInvite: () => false,
      };

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => utilisateur;
      depotDonnees.metsAJourMotDePasse = async () => {};
      depotDonnees.supprimeIdResetMotDePassePourUtilisateur = async () => {};
      depotDonnees.valideAcceptationCGUPourUtilisateur = async () =>
        utilisateur;
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        ['cguAcceptees', 'infolettreAcceptee'],
        {
          method: 'put',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: 'mdp', cguAcceptees: true },
        },
        done
      );
    });

    it('met à jour le mot de passe', async () => {
      let majMotDePasse;

      expect(utilisateur.id).to.equal('123');

      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourMotDePasse = async (
        idUtilisateur,
        motDePasse
      ) => {
        majMotDePasse = { idUtilisateur, motDePasse };
      };

      const reponse = await axios.put('http://localhost:1234/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(majMotDePasse).to.eql({
        idUtilisateur: '123',
        motDePasse: 'mdp_ABC12345',
      });
      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idUtilisateur: '123' });
    });

    it("retourne une erreur HTTP 422 si le mot de passe n'est pas assez robuste", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe trop simple',
        {
          method: 'put',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: '1234' },
        }
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

    it('ajoute une session utilisateur', async () => {
      const reponse = await axios.put('http://localhost:1234/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expectContenuSessionValide(reponse, 'MSS', true, false);
    });

    it("inscrit l'utilisateur aux emails transactionnels Brevo", async () => {
      let inscriptionEffectuee;

      testeur.adaptateurMail().inscrisEmailsTransactionnels = async (
        emailUtilisateur
      ) => {
        inscriptionEffectuee = emailUtilisateur;
      };

      await axios.put('http://localhost:1234/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(inscriptionEffectuee).to.equal('jean.dujardin@beta.gouv.fr');
    });

    it("ajoute l'utilisateur à la newsletter Brevo si l'utilisateur le souhaite et persiste ce choix", async () => {
      let inscriptionEffectuee;
      let utilisateurPersiste;

      testeur.adaptateurMail().inscrisInfolettre = async (emailUtilisateur) => {
        inscriptionEffectuee = emailUtilisateur;
      };

      testeur.depotDonnees().metsAJourUtilisateur = async (
        idUtilisateur,
        donnees
      ) => {
        utilisateurPersiste = { idUtilisateur, donnees };
      };

      await axios.put('http://localhost:1234/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
        infolettreAcceptee: 'true',
      });

      expect(inscriptionEffectuee).to.equal('jean.dujardin@beta.gouv.fr');
      expect(utilisateurPersiste).to.eql({
        idUtilisateur: '123',
        donnees: { infolettreAcceptee: true },
      });
    });

    it("invalide l'identifiant de réinitialisation de mot de passe", async () => {
      expect(utilisateur.id).to.equal('123');

      let utilisateurQuiEstReset;
      testeur.depotDonnees().supprimeIdResetMotDePassePourUtilisateur = async (
        u
      ) => {
        utilisateurQuiEstReset = u;
      };

      await axios.put('http://localhost:1234/api/motDePasse', {
        motDePasse: 'mdp_ABC12345',
      });

      expect(utilisateurQuiEstReset.id).to.be('123');
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
        it('renvoie une erreur HTTP 422', async () => {
          await testeur.verifieRequeteGenereErreurHTTP(
            422,
            'CGU non acceptées',
            {
              method: 'put',
              url: 'http://localhost:1234/api/motDePasse',
              data: { motDePasse: 'mdp_12345' },
            }
          );
        });

        it('ne met pas le mot de passe à jour', async () => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = async () => {
            motDePasseMisAJour = true;
          };

          try {
            await axios.put('http://localhost:1234/api/motDePasse', {
              motDePasse: 'mdp_12345',
            });
          } catch (e) {
            expect(e.response.status).to.be(422);
            expect(motDePasseMisAJour).to.be(false);
          }
        });
      });

      describe("et que l'utilisateur est en train de les accepter", () => {
        it("demande au dépôt d'enregistrer que les CGU sont acceptées", async () => {
          expect(utilisateur.id).to.equal('123');

          let utilisateurQuiAccepte;
          testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = async (
            u
          ) => {
            utilisateurQuiAccepte = u;
            return u;
          };

          await axios.put('http://localhost:1234/api/motDePasse', {
            motDePasse: 'mdp_ABC12345',
            cguAcceptees: 'true',
          });

          expect(utilisateurQuiAccepte.id).to.be('123');
        });

        it('met à jour le mot de passe', async () => {
          let motDePasseMisAJour = false;
          testeur.depotDonnees().metsAJourMotDePasse = async () => {
            motDePasseMisAJour = true;
          };

          await axios.put('http://localhost:1234/api/motDePasse', {
            motDePasse: 'mdp_ABC12345',
            cguAcceptees: 'true',
          });

          expect(motDePasseMisAJour).to.be(true);
        });
      });
    });
  });
  describe('quand requête PUT sur `/api/utilisateur/acceptationCGU`', () => {
    let utilisateur;
    beforeEach(() => {
      utilisateur = {
        id: '123',
        email: 'jean.dujardin@beta.gouv.fr',
        genereToken: (source) => `un token de source ${source}`,
        accepteCGU: () => true,
        estUnInvite: () => false,
      };

      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => utilisateur;
      depotDonnees.valideAcceptationCGUPourUtilisateur = async () =>
        utilisateur;
      testeur.middleware().reinitialise({
        idUtilisateur: utilisateur.id,
        acceptationCGU: false,
        authentificationAUtiliser: SourceAuthentification.AGENT_CONNECT,
      });
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur.middleware().verifieRequeteExigeJWT(
        {
          method: 'PUT',
          url: 'http://localhost:1234/api/utilisateur/acceptationCGU',
        },
        done
      );
    });

    it("demande au dépôt d'enregistrer que les CGU sont acceptées", async () => {
      let utilisateurQuiAccepte;
      testeur.depotDonnees().valideAcceptationCGUPourUtilisateur = async (
        u
      ) => {
        utilisateurQuiAccepte = u;
        return u;
      };

      await axios.put('http://localhost:1234/api/utilisateur/acceptationCGU', {
        cguAcceptees: 'true',
      });

      expect(utilisateurQuiAccepte.id).to.be('123');
    });

    it('ajoute une session utilisateur', async () => {
      const reponse = await axios.put(
        'http://localhost:1234/api/utilisateur/acceptationCGU',
        { cguAcceptees: 'true' }
      );

      expectContenuSessionValide(reponse, 'AGENT_CONNECT', true, false);
    });
  });
  describe('quand requête PATCH sur `/api/motDePasse', () => {
    let utilisateur;
    beforeEach(() => {
      utilisateur = { id: '123' };
      testeur.depotDonnees().metsAJourMotDePasse = async () => utilisateur;
    });

    it('utilise le middleware de challenge du mot de passe', (done) => {
      testeurMSS().middleware().verifieChallengeMotDePasse(
        {
          method: 'patch',
          url: 'http://localhost:1234/api/motDePasse',
        },
        done
      );
    });

    it('met à jour le mot de passe', async () => {
      let motDePasseMisAJour = false;
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourMotDePasse = async (
        idUtilisateur,
        motDePasse
      ) => {
        expect(idUtilisateur).to.equal('123');
        expect(motDePasse).to.equal('mdp_ABC12345');
        motDePasseMisAJour = true;
        return utilisateur;
      };

      const reponse = await axios.patch(
        'http://localhost:1234/api/motDePasse',
        { motDePasse: 'mdp_ABC12345' }
      );

      expect(motDePasseMisAJour).to.be(true);
      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idUtilisateur: '123' });
    });

    it("retourne une erreur HTTP 422 si le mot de passe n'est pas assez robuste", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'Mot de passe trop simple',
        {
          method: 'patch',
          url: 'http://localhost:1234/api/motDePasse',
          data: { motDePasse: '1234' },
        }
      );
    });
  });
  describe('quand requête PUT sur `/api/utilisateur`', () => {
    let utilisateur;
    let donneesRequete;

    beforeEach(() => {
      utilisateur = unUtilisateur().avecId('123').construis();

      donneesRequete = {
        prenom: 'Jean',
        nom: 'Dupont',
        telephone: '0100000000',
        postes: ['RSSI', "Chargé des systèmes d'informations"],
        siretEntite: '13000766900018',
        estimationNombreServices: {
          borneBasse: 1,
          borneHaute: 10,
        },
        infolettreAcceptee: 'true',
        transactionnelAccepte: 'true',
        cguAcceptees: 'true',
      };

      testeur.referentiel().departement = () => 'Paris';
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.metsAJourUtilisateur = () => Promise.resolve(utilisateur);
      depotDonnees.utilisateur = () => Promise.resolve(utilisateur);
    });

    it('aseptise les paramètres de la requête', (done) => {
      testeur.middleware().verifieAseptisationParametres(
        [
          'prenom',
          'nom',
          'telephone',
          'cguAcceptees',
          'infolettreAcceptee',
          'transactionnelAccepte',
          'postes.*',
          'estimationNombreServices.*',
          'siretEntite',
        ],
        {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        },
        done
      );
    });

    it("est en erreur 422  quand les propriétés de l'utilisateur ne sont pas valides", async () => {
      donneesRequete.prenom = '';

      await testeur.verifieRequeteGenereErreurHTTP(
        422,
        'La mise à jour de l\'utilisateur a échoué car les paramètres sont invalides. La propriété "prenom" est requise',
        {
          method: 'put',
          url: 'http://localhost:1234/api/utilisateur',
          data: donneesRequete,
        }
      );
    });

    it("met à jour les autres informations de l'utilisateur", async () => {
      let idRecu;
      let donneesRecues;
      testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });
      testeur.depotDonnees().metsAJourUtilisateur = async (id, donnees) => {
        idRecu = id;
        donneesRecues = donnees;
        return utilisateur;
      };

      const reponse = await axios.put(
        'http://localhost:1234/api/utilisateur',
        donneesRequete
      );

      expect(reponse.status).to.equal(200);
      expect(reponse.data).to.eql({ idUtilisateur: '123' });
      expect(idRecu).to.equal('123');
      expect(donneesRecues.prenom).to.equal('Jean');
      expect(donneesRecues.nom).to.equal('Dupont');
      expect(donneesRecues.telephone).to.equal('0100000000');
      expect(donneesRecues.entite.siret).to.equal('13000766900018');
      expect(donneesRecues.infolettreAcceptee).to.equal(true);
      expect(donneesRecues.transactionnelAccepte).to.equal(true);
      expect(donneesRecues.postes).to.eql([
        'RSSI',
        "Chargé des systèmes d'informations",
      ]);
    });

    describe("concernant l'acceptation des CGU", () => {
      it('quand les CGU sont acceptées, passe la dernière version des CGU au dépôt de données', async () => {
        let versionCGURecue;
        testeur.referentiel().recharge({ versionActuelleCgu: 'v2.0' });
        testeur.depotDonnees().metsAJourUtilisateur = async (_, donnees) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };

        await axios.put(
          'http://localhost:1234/api/utilisateur',
          donneesRequete
        );

        expect(versionCGURecue).to.be('v2.0');
      });

      it('quand les CGU ne sont pas présentes, ne les passe pas au dépôt de données', async () => {
        let versionCGURecue;
        testeur.depotDonnees().metsAJourUtilisateur = async (_, donnees) => {
          versionCGURecue = donnees.cguAcceptees;
          return utilisateur;
        };
        delete donneesRequete.cguAcceptees;

        await axios.put(
          'http://localhost:1234/api/utilisateur',
          donneesRequete
        );

        expect(versionCGURecue).to.be(undefined);
      });
    });

    it("met à jour les préférences de communication de l'utilisateur", async () => {
      let preferencesChangees;
      testeur.middleware().reinitialise({ idUtilisateur: utilisateur.id });

      testeur.depotDonnees().utilisateur = async () => {
        const u = unUtilisateur().construis();

        u.changePreferencesCommunication = async (nouvellesPreferences) => {
          preferencesChangees = nouvellesPreferences;
        };

        return u;
      };

      donneesRequete.infolettreAcceptee = 'true';
      donneesRequete.transactionnelAccepte = 'true';
      await axios.put('http://localhost:1234/api/utilisateur', donneesRequete);

      expect(preferencesChangees).to.eql({
        infolettreAcceptee: true,
        transactionnelAccepte: true,
      });
    });
  });
  describe('quand requête GET sur `/api/utilisateurCourant`', () => {
    it("renvoie des infos de l'utilisateur correspondant à l'identifiant", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      let idUtilisateurRecu = null;
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async (idUtilisateur) => {
        idUtilisateurRecu = idUtilisateur;
        return unUtilisateur()
          .quiSAppelle('Marie Jeanne')
          .quiTravaillePourUneEntiteAvecSiret('12345')
          .construis();
      };

      const response = await axios.get(
        'http://localhost:1234/api/utilisateurCourant'
      );

      expect(response.status).to.equal(200);
      expect(idUtilisateurRecu).to.equal('123');
      const { utilisateur } = response.data;
      expect(utilisateur.prenomNom).to.equal('Marie Jeanne');
    });

    it("renvoie la source d'authentification", async () => {
      testeur
        .middleware()
        .reinitialise({ idUtilisateur: '123', sourceAuth: 'MSS' });
      const depotDonnees = testeur.depotDonnees();
      depotDonnees.utilisateur = async () => unUtilisateur().construis();

      const response = await axios.get(
        'http://localhost:1234/api/utilisateurCourant'
      );

      const { sourceAuthentification } = response.data;
      expect(sourceAuthentification).to.equal('MSS');
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
  describe('quand requête GET sur `/api/dureeSession`', () => {
    it('renvoie la durée de session', (done) => {
      axios
        .get('http://localhost:1234/api/dureeSession')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);

          const { dureeSession } = reponse.data;
          expect(dureeSession).to.equal(58 * 60_000);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });
});
