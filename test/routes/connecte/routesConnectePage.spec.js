const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  requeteSansRedirection,
  donneesPartagees,
} = require('../../aides/http');
const Superviseur = require('../../../src/modeles/superviseur');

describe('Le serveur MSS des pages pour un utilisateur "Connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  describe(`quand GET sur /motDePasse/initialisation`, () => {
    beforeEach(() => {
      const utilisateur = unUtilisateur().construis();
      testeur.depotDonnees().utilisateur = async () => utilisateur;
    });

    it("vérifie que l'utilisateur est authentifié", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeJWT(
          'http://localhost:1234/motDePasse/initialisation',
          done
        );
    });

    it('sert le contenu HTML de la page ', (done) => {
      axios
        .get('http://localhost:1234/motDePasse/initialisation')
        .then((reponse) => {
          expect(reponse.status).to.equal(200);
          expect(reponse.headers['content-type']).to.contain('text/html');
          done();
        })
        .catch(done);
    });
  });

  [
    '/motDePasse/edition',
    '/profil',
    '/tableauDeBord',
    '/visiteGuidee/decrire',
    '/visiteGuidee/securiser',
    '/visiteGuidee/homologuer',
    '/visiteGuidee/piloter',
    '/mesures',
  ].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
        testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
          async () => {};
        testeur.referentiel().recharge({
          etapesParcoursHomologation: [{ numero: 1 }],
        });
      });

      it("vérifie que l'utilisateur a accepté les CGU", (done) => {
        testeur
          .middleware()
          .verifieRequeteExigeAcceptationCGU(
            `http://localhost:1234${route}`,
            done
          );
      });

      it("vérifie que l'état de la visite guidée est chargé sur la route", (done) => {
        testeur
          .middleware()
          .verifieRequeteChargeEtatVisiteGuidee(
            `http://localhost:1234${route}`,
            done
          );
      });

      it('sert le contenu HTML de la page', (done) => {
        axios
          .get(`http://localhost:1234${route}`)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.headers['content-type']).to.contain('text/html');
            done();
          })
          .catch(done);
      });
    });
  });

  describe('quand requête GET sur `/visiteGuidee/:idEtape`', () => {
    it("charge les préférences de l'utilisateur", (done) => {
      testeur
        .middleware()
        .verifieChargementDesPreferences(
          'http://localhost:1234/visiteGuidee/decrire',
          done
        );
    });
  });

  describe('quand requête GET sur `/deconnexion', () => {
    describe("en tant qu'utilisateur connecté avec MSS", () => {
      it('redirige vers /connexion', async () => {
        testeur.middleware().reinitialise({ authentificationAUtiliser: 'MSS' });

        const reponse = await requeteSansRedirection(
          'http://localhost:1234/deconnexion'
        );

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be('/connexion');
      });
    });
    describe("en tant qu'utilisateur connecté avec Agent Connect", () => {
      it('redirige vers /oidc/deconnexion', async () => {
        testeur
          .middleware()
          .reinitialise({ authentificationAUtiliser: 'AGENT_CONNECT' });

        const reponse = await requeteSansRedirection(
          'http://localhost:1234/deconnexion'
        );

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be('/oidc/deconnexion');
      });
    });
  });

  describe(`quand GET sur /profil`, () => {
    beforeEach(() => {
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal =
        async () => ({});
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().avecId('456').construis();
    });

    it("délègue au dépôt de données la lecture des informations de l'utilisateur", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      let idRecu;
      testeur.depotDonnees().utilisateur = (idUtilisateur) => {
        idRecu = idUtilisateur;
        return unUtilisateur().construis();
      };

      await axios.get(`http://localhost:1234/profil`);
      expect(idRecu).to.be('456');
    });

    it("renvoie l'entité si celle-ci est définie", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().quiTravaillePourUneEntiteAvecSiret('1234').construis();

      const reponse = await axios.get(`http://localhost:1234/profil`);

      expect(donneesPartagees(reponse.data, 'donnees-profil').entite).to.eql({
        siret: '1234',
        nom: '',
        departement: '',
      });
    });

    it("renvoie undefined pour l'entité si celle-ci n'est pas définie", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().sansEntite().construis();

      const reponse = await axios.get(`http://localhost:1234/profil`);

      expect(donneesPartagees(reponse.data, 'donnees-profil').entite).to.be(
        undefined
      );
    });

    it("décode le nom, le prénom et les postes de l'utilisateur", async () => {
      const apostrophe = '&#x27;';
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur()
          .quiSAppelle(`un${apostrophe}e apo${apostrophe}strophe`)
          .avecPostes([`Apo${apostrophe}strophe`])
          .construis();

      const reponse = await axios.get(`http://localhost:1234/profil`);

      const donneesUtilisateur = donneesPartagees(
        reponse.data,
        'donnees-profil'
      ).utilisateur;
      expect(donneesUtilisateur.prenom).to.be("un'e");
      expect(donneesUtilisateur.nom).to.be("apo'strophe");
      expect(donneesUtilisateur.postes).to.eql(["Apo'strophe"]);
    });

    it("reste robuste si l'utilisateur n'a pas de postes, qui est possible si l'utilisateur n'a jamais fini de remplir son profil", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().utilisateur = () =>
        unUtilisateur().avecPostes(null).construis();

      const reponse = await axios.get(`http://localhost:1234/profil`);

      const donneesUtilisateur = donneesPartagees(
        reponse.data,
        'donnees-profil'
      ).utilisateur;
      expect(donneesUtilisateur.postes).to.eql([]);
    });

    it('rafraîchis les données avec le Profil ANSSI', async () => {
      let depotAppele = false;
      testeur.depotDonnees().rafraichisProfilUtilisateurLocal = async () => {
        depotAppele = true;
      };

      await axios.get(`http://localhost:1234/profil`);
      expect(depotAppele).to.be(true);
    });
  });

  describe('quand GET sur /tableauDeBord', () => {
    it("ajoute la donnée partagée indiquant si l'utilisateur est superviseur", async () => {
      testeur.depotDonnees().estSuperviseur = async () => true;

      const reponse = await axios.get(`http://localhost:1234/tableauDeBord`);

      const donnees = donneesPartagees(reponse.data, 'utilisateur-superviseur');
      expect(donnees).to.eql({ estSuperviseur: true });
    });
  });

  describe('quand GET sur /supervision', () => {
    beforeEach(() => {
      testeur.depotDonnees().superviseur = async () => {};
    });

    it("vérifie que l'utilisateur a accepté les CGU", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(
          `http://localhost:1234/supervision`,
          done
        );
    });

    it("renvoie une erreur 401 si l'utilisateur n'est pas un superviseur", async () => {
      testeur.depotDonnees().superviseur = async () => undefined;
      try {
        await axios.get(`http://localhost:1234/supervision`);
        expect().fail('La requête aurait dû lever une erreur');
      } catch (e) {
        expect(e.response.status).to.be(401);
      }
    });

    it("insère les entités supervisées dans la page si l'utilisateur est superviseur", async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '456' });
      testeur.depotDonnees().superviseur = async () =>
        new Superviseur({
          entitesSupervisees: [{ nom: 'MonEntite' }],
        });

      const reponse = await axios.get(`http://localhost:1234/supervision`);

      const donnees = donneesPartagees(reponse.data, 'entites-supervisees');
      expect(donnees.length).to.be(1);
      expect(donnees[0].nom).to.be('MonEntite');
    });
  });
});
