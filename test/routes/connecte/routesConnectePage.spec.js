const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const { requeteSansRedirection } = require('../../aides/http');

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
    '/utilisateur/edition',
    '/profil',
    '/tableauDeBord',
    '/visiteGuidee/decrire',
    '/visiteGuidee/securiser',
    '/visiteGuidee/homologuer',
    '/visiteGuidee/piloter',
  ].forEach((route) => {
    describe(`quand GET sur ${route}`, () => {
      beforeEach(() => {
        const utilisateur = unUtilisateur().construis();
        testeur.depotDonnees().utilisateur = async () => utilisateur;
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
  });
});
