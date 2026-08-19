import expect from 'expect.js';
import testeurMSS from './routes/testeurMSS.js';
import { TYPES_REQUETES } from '../src/http/configurationServeur.js';
import { unUtilisateur } from './constructeurs/constructeurUtilisateur.js';

describe('Le serveur MSS', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  it('utilise un filtrage IP pour ne servir que les IP autorisées', async () => {
    await testeur.middleware().verifieFiltrageIp(testeur.app(), '/');
  });

  it('charge la version de build des fichiers', async () => {
    await testeur
      .middleware()
      .verifieChargementDeLaVersionBuildee(testeur.app(), '/');
  });

  describe('quand une page est servie', () => {
    it('positionne les headers', async () => {
      await testeur
        .middleware()
        .verifieRequetePositionneHeaders(testeur.app(), '/');
    });

    it("n'affiche pas d'information sur la nature du serveur", async () => {
      const reponse = await testeur.get('/');

      expect(reponse.headers).to.not.have.property('x-powered-by');
    });

    it('interdit la mise en cache', async () => {
      const reponse = await testeur.get('/');

      expect(reponse.headers['surrogate-control']).to.equal('no-store');
      expect(reponse.headers.pragma).to.equal('no-cache');
    });
  });

  describe('quand un fichier statique est servi', () => {
    it("n'applique pas l'interdiction de mise en cache", async () => {
      const reponse = await testeur.get('/statique/assets/styles/mss.css');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers).to.not.have.property('surrogate-control');
      expect(reponse.headers).to.not.have.property('pragma');
    });

    it("utilise la politique de cache donnée par l'adaptateur environnement", async () => {
      testeur.adaptateurEnvironnement().statique = () => ({
        politiqueCache: () => 'public, max-age=600',
      });

      const reponse = await testeur.get('/statique/assets/styles/mss.css');

      expect(reponse.headers['cache-control']).to.equal('public, max-age=600');
    });

    it('rend une 404 pour un fichier inexistant', async () => {
      const reponse = await testeur.get('/statique/fichier-inexistant.js');

      expect(reponse.status).to.equal(404);
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
        url: '/profil',
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
      it(`identifie la requête comme ${typeAttendu} sur les routes ${routeur}`, async () => {
        await callbackInitialisation?.();
        await testeur
          .middleware()
          .verifieTypeRequeteCharge(typeAttendu, testeur.app(), {
            method: 'GET',
            url: `${url}`,
          });
      });
    });
  });
});
