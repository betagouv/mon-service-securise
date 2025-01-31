const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('./routes/testeurMSS');
const { TYPES_REQUETES } = require('../src/http/configurationServeur');
const { unUtilisateur } = require('./constructeurs/constructeurUtilisateur');

describe('Le serveur MSS', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  it('utilise un filtrage IP pour ne servir que les IP autorisées', (done) => {
    testeur.middleware().verifieFiltrageIp('http://localhost:1234', done);
  });

  it('charge la version de build des fichiers', (done) => {
    testeur
      .middleware()
      .verifieChargementDeLaVersionBuildee('http://localhost:1234', done);
  });

  describe('quand une page est servie', () => {
    it('positionne les headers', (done) => {
      testeur
        .middleware()
        .verifieRequetePositionneHeaders('http://localhost:1234/', done);
    });

    it("n'affiche pas d'information sur la nature du serveur", (done) => {
      axios
        .get('http://localhost:1234')
        .then((reponse) => {
          expect(reponse.headers).to.not.have.property('x-powered-by');
          done();
        })
        .catch(done);
    });

    it("repousse l'expiration du cookie", (done) => {
      testeur
        .middleware()
        .verifieRequeteRepousseExpirationCookie('http://localhost:1234/', done);
    });
  });

  describe('sur configuration des types de requête', () => {
    [
      {
        url: '/',
        typeAttendu: TYPES_REQUETES.NAVIGATION,
        routeur: "'non connecté' de page",
      },
      {
        url: '/motDePasse/edition',
        typeAttendu: TYPES_REQUETES.NAVIGATION,
        routeur: "'connecté' de page",
        callbackInitialisation: () => {
          testeur.depotDonnees().utilisateur = async () =>
            unUtilisateur().construis();
        },
      },
      {
        url: '/api/sante',
        typeAttendu: TYPES_REQUETES.API,
        routeur: "'non connecté' d'API",
        callbackInitialisation: () => {
          testeur.depotDonnees().santeDuDepot = async () => {};
        },
      },
      {
        url: '/oidc/connexion',
        typeAttendu: TYPES_REQUETES.NAVIGATION,
        routeur: "'non connecté' d'OIDC",
        callbackInitialisation: () => {
          testeur.adaptateurOidc().genereDemandeAutorisation = async () => ({
            nonce: 'unNonce',
            state: 'unState',
            url: 'http',
          });
        },
      },
      {
        url: '/oidc/deconnexion',
        typeAttendu: TYPES_REQUETES.NAVIGATION,
        routeur: "'connecté' d'OIDC",
        callbackInitialisation: () => {
          testeur.adaptateurOidc().genereDemandeDeconnexion = async () => ({
            state: 'unState',
            url: 'http',
          });
        },
      },
      {
        url: '/api/services',
        typeAttendu: TYPES_REQUETES.API,
        routeur: "'connecté' d'API",
      },
      {
        url: '/bibliotheques/uneBibliotheque.js',
        typeAttendu: TYPES_REQUETES.RESSOURCE,
        routeur: 'de bibliotheques',
      },
      {
        url: '/styles/feuilleDeStyle.css',
        typeAttendu: TYPES_REQUETES.RESSOURCE,
        routeur: 'de feuilles de styles',
      },
    ].forEach(({ url, typeAttendu, routeur, callbackInitialisation }) => {
      it(`identifie la requête comme ${typeAttendu} sur les routes ${routeur}`, (done) => {
        callbackInitialisation?.();
        testeur.middleware().verifieTypeRequeteCharge(
          typeAttendu,
          {
            method: 'GET',
            url: `http://localhost:1234${url}`,
          },
          done
        );
      });
    });
  });
});
