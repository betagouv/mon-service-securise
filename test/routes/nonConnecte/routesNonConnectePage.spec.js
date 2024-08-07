const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurArticleCrispIntrouvable } = require('../../../src/erreurs');

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  [
    '/',
    '/aPropos',
    '/securite',
    '/accessibilite',
    '/cgu',
    '/confidentialite',
    '/mentionsLegales',
    '/statistiques',
    '/inscription',
    '/activation',
    '/connexion',
    '/reinitialisationMotDePasse',
    '/devenir-ambassadeurrice-monservicesecurise',
    '/faire-connaitre-et-recommander-monservicesecurise',
    '/promouvoir-monservicesecurise',
    '/co-construire-monservicesecurise',
    '/conseils-cyber',
  ].forEach((route) => {
    it(`sert le contenu HTML de la page ${route}`, (done) => {
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

  describe('quand requête GET sur `/articles/:slug`', () => {
    it('utilise le CMS Crisp pour récupérer un article de blog', async () => {
      let idRecu;
      testeur.adaptateurCmsCrisp().recupereArticle = async (id) => {
        idRecu = id;
        return {
          contenuMarkdown: 'Un contenu',
          titre: 'Un titre',
          description: 'Une description',
        };
      };
      testeur.adaptateurCmsCrisp().recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-generique-1ab2c3/',
        },
      ];

      await axios.get(`http://localhost:1234/articles/un-slug-generique`);

      expect(idRecu).to.be('1');
    });

    it('sert le contenu HTML de la page', async () => {
      testeur.adaptateurCmsCrisp().recupereArticle = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
      });
      testeur.adaptateurCmsCrisp().recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-generique-1ab2c3/',
        },
      ];

      const reponse = await axios.get(
        `http://localhost:1234/articles/un-slug-generique`
      );

      expect(reponse.status).to.be(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
      expect(reponse.data).to.contain('Un titre');
    });

    it("renvoie une erreur 404 si l'article n'existe pas", async () => {
      testeur.adaptateurCmsCrisp().recupereArticleBlog = async () => {
        throw new ErreurArticleCrispIntrouvable();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Article Crisp inconnu`,
        `http://localhost:1234/articles/un-slug-inexistant`
      );
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/connexion',
          done
        );
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", (done) => {
      testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          'http://localhost:1234/reinitialisationMotDePasse',
          done
        );
    });
  });

  describe('quand requête GET sur `/initialisationMotDePasse/:idReset`', () => {
    const uuid = '109156be-c4fb-41ea-b1b4-efe1671c5836';

    describe('avec idReset valide', () => {
      const utilisateur = {
        id: '123',
        genereToken: () => 'un token',
        accepteCGU: () => false,
      };

      beforeEach(() => {
        testeur.depotDonnees().utilisateurAFinaliser = async () => utilisateur;
        testeur.depotDonnees().utilisateur = async () => utilisateur;
      });

      it('dépose le jeton dans un cookie', async () => {
        let idRecu;
        testeur.depotDonnees().utilisateurAFinaliser = async (idReset) => {
          idRecu = idReset;
          return utilisateur;
        };

        const reponse = await axios.get(
          `http://localhost:1234/initialisationMotDePasse/${uuid}`
        );

        expect(idRecu).to.be(uuid);
        await testeur.verifieJetonDepose(reponse, () => {});
      });

      it('sert le contenu HTML de la page', (done) => {
        axios
          .get(`http://localhost:1234/initialisationMotDePasse/${uuid}`)
          .then((reponse) => {
            expect(reponse.status).to.equal(200);
            expect(reponse.headers['content-type']).to.contain('text/html');
            done();
          })
          .catch(done);
      });
    });

    it("aseptise l'identifiant reçu", (done) => {
      testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idReset'],
          `http://localhost:1234/initialisationMotDePasse/${uuid}`,
          done
        );
    });

    it("retourne une erreur HTTP 400 sur idReset n'est pas un UUID valide", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'UUID requis',
        'http://localhost:1234/initialisationMotDePasse/999'
      );
    });

    it('retourne une erreur HTTP 404 si idReset inconnu', async () => {
      testeur.depotDonnees().utilisateurAFinaliser = async () => {};

      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Identifiant d'initialisation de mot de passe inconnu`,
        `http://localhost:1234/initialisationMotDePasse/${uuid}`
      );
    });
  });

  describe('quand requête GET sur `/sitemap.xml`', () => {
    it('sert le contenu XML du fichier', async () => {
      const reponse = await axios.get('http://localhost:1234/sitemap.xml');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('application/xml');
    });
  });
});
