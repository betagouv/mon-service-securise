const expect = require('expect.js');
const { ErreurArticleCrispIntrouvable } = require('@lab-anssi/lib');
const testeurMSS = require('../testeurMSS');
const { donneesPartagees } = require('../../aides/http');
const { expectContenuSessionValide } = require('../../aides/cookie');
const {
  ErreurJWTInvalide,
  ErreurJWTManquant,
} = require('../../../src/erreurs');

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  [
    '/',
    '/aPropos',
    '/securite',
    '/accessibilite',
    '/cgu',
    '/confidentialite',
    '/mentionsLegales',
    '/inscription',
    '/creation-compte?token=unToken',
    '/activation',
    '/connexion',
    '/reinitialisationMotDePasse',
    '/devenir-ambassadeurrice-monservicesecurise',
    '/faire-connaitre-et-recommander-monservicesecurise',
    '/co-construire-monservicesecurise',
    '/conseils-cyber',
    '/doctrine-homologation-anssi',
    '/ui-kit',
  ].forEach((route) => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it(`sert le contenu HTML de la page ${route}`, async () => {
      const reponse = await testeur.get(`${route}`);

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });
  });

  describe('quand requête GET sur `/articles/:slug`', () => {
    it('utilise le CMS Crisp pour récupérer un article de blog', async () => {
      let slugRecu;
      testeur.cmsCrisp().recupereArticleBlog = async (slug) => {
        slugRecu = slug;
        return {
          contenuMarkdown: 'Un contenu',
          titre: 'Un titre',
          description: 'Une description',
          tableDesMatieres: [],
          section: {
            id: 'IdSection',
            nom: 'Une section',
          },
        };
      };

      await testeur.get(`/articles/un-slug-generique`);

      expect(slugRecu).to.be('un-slug-generique');
    });

    it('sert le contenu HTML de la page', async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: {
          id: 'IdSection',
          nom: 'Une section',
        },
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.status).to.be(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
      expect(reponse.text).to.contain('Un titre');
    });

    it("renvoie une erreur 404 si l'article n'existe pas", async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => {
        throw new ErreurArticleCrispIntrouvable();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Article Crisp inconnu`,
        `/articles/un-slug-inexistant`
      );
    });
  });

  describe('quand requête GET sur `/reinitialisationMotDePasse`', () => {
    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(
          testeur.app(),
          '/reinitialisationMotDePasse'
        );
    });
  });

  describe('quand requête GET sur `/initialisationMotDePasse/:idReset`', () => {
    const uuid = '109156be-c4fb-41ea-b1b4-efe1671c5836';

    it("charge l'état d'activation d'AgentConnect", async () => {
      await testeur
        .middleware()
        .verifieRequeteChargeActivationAgentConnect(
          testeur.app(),
          '/initialisationMotDePasse/unUUID'
        );
    });

    describe('avec idReset valide', () => {
      const utilisateur = {
        id: '123',
        genereToken: (source) => {
          expect(source).to.be('MSS');
          return `un token de source ${source}`;
        },
        accepteCGU: () => false,
        estUnInvite: () => false,
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

        const reponse = await testeur.get(`/initialisationMotDePasse/${uuid}`);

        expect(idRecu).to.be(uuid);
        await testeur.verifieSessionDeposee(reponse, () => {});
      });

      it('ajoute une session utilisateur', async () => {
        const reponse = await testeur.get(`/initialisationMotDePasse/${uuid}`);

        expectContenuSessionValide(reponse, 'MSS', false, false);
      });

      it('sert le contenu HTML de la page', async () => {
        const reponse = await testeur.get(`/initialisationMotDePasse/${uuid}`);

        expect(reponse.status).to.equal(200);
        expect(reponse.headers['content-type']).to.contain('text/html');
      });

      it("pour un utilisateur invité, redirige vers la page d'inscription pour l'empêcher de créer un compte avec mot de passe MSS", async () => {
        const utilisateurInvite = {
          id: '123',
          genereToken: () => {
            expect().fail("N'aurait pas dû générer de token");
          },
          estUnInvite: () => true,
        };
        testeur.depotDonnees().utilisateurAFinaliser = async () =>
          utilisateurInvite;
        testeur.depotDonnees().utilisateur = async () => utilisateurInvite;

        const reponse = await testeur.get(`/initialisationMotDePasse/${uuid}`);

        expect(reponse.status).to.be(302);
        expect(reponse.headers.location).to.be('/inscription');
      });
    });

    it("aseptise l'identifiant reçu", async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          ['idReset'],
          testeur.app(),
          `/initialisationMotDePasse/${uuid}`
        );
    });

    it("retourne une erreur HTTP 400 sur idReset n'est pas un UUID valide", async () => {
      await testeur.verifieRequeteGenereErreurHTTP(
        400,
        'UUID requis',
        '/initialisationMotDePasse/999'
      );
    });

    it('retourne une erreur HTTP 404 si idReset inconnu', async () => {
      testeur.depotDonnees().utilisateurAFinaliser = async () => {};

      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Identifiant d'initialisation de mot de passe inconnu`,
        `/initialisationMotDePasse/${uuid}`
      );
    });
  });

  describe('quand requête GET sur `/sitemap.xml`', () => {
    it('sert le contenu XML du fichier', async () => {
      const reponse = await testeur.get('/sitemap.xml');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('application/xml');
    });
  });

  describe('quand requete GET sur `/creation-compte`', () => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it('retourne une erreur 400 si la signature du token est invalide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new ErreurJWTInvalide();
      };

      const reponse = await testeur.get(`/creation-compte?token=unFauxToken`);
      expect(reponse.status).to.be(400);
    });

    it('retourne une erreur 400 si le token est vide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new ErreurJWTManquant();
      };

      const reponse = await testeur.get('/creation-compte?token=');
      expect(reponse.status).to.be(400);
    });

    it('envoie les départements', async () => {
      testeur.referentiel().departements = () => [{ nom: 'Gironde' }];

      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(donneesPartagees(reponse.text, 'departements')).to.eql({
        departements: [{ nom: 'Gironde' }],
      });
    });

    it("ajoute les informations provenant du token pour que l'utilisateur voie des infos pré-remplies à l'écran", async () => {
      testeur.adaptateurJWT().decode = () => ({
        email: 'jeand@beta.fr',
        nom: 'Dujardin',
        prenom: 'Jean',
        organisation: {
          siret: '1234',
          departement: '75',
          nom: 'BLEU',
        },
        telephone: '0607080910',
        domainesSpecialite: ['RSSI', 'DEV'],
      });

      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(
        donneesPartagees(reponse.text, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {
          email: 'jeand@beta.fr',
          nom: 'Dujardin',
          prenom: 'Jean',
          organisation: {
            siret: '1234',
            departement: '75',
            nom: 'BLEU',
          },
          telephone: '0607080910',
          domainesSpecialite: ['RSSI', 'DEV'],
        },
      });
    });

    it('envoie le token', async () => {
      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(donneesPartagees(reponse.text, 'token')).to.eql({
        token: 'unTokenValide',
      });
    });
  });

  describe('quand requête GET sur `/inscription`', () => {
    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(testeur.app(), '/inscription');
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(testeur.app(), '/connexion');
    });

    it('ajoute la redirection', async () => {
      const reponse = await testeur.get(
        '/connexion?urlRedirection=/redirige-vers'
      );

      expect(donneesPartagees(reponse.text, 'url-redirection')).to.eql({
        urlRedirection: 'http://localhost:1234/redirige-vers',
      });
    });

    it("n'ajoute pas la redirection si l'url n'est pas valide", async () => {
      const reponse = await testeur.get(
        '/connexion?urlRedirection=uri-invalide'
      );

      expect(donneesPartagees(reponse.text, 'url-redirection')).to.eql({});
    });
  });

  describe('quand requete GET sur `/statistiques`', () => {
    it("utilise l'adaptateur de statistiques pour récupérer les données", async () => {
      let adaptateurAppele = false;
      testeur.adaptateurStatistiques().recupereStatistiques = async () => {
        adaptateurAppele = true;
        return {
          utilisateurs: { nombre: 0, progression: 0 },
          services: { nombre: 0, progression: 0 },
          vulnerabilites: { nombre: 0, progression: 0 },
          indiceCyber: { nombre: 0, progression: 0 },
        };
      };

      const reponse = await testeur.get('/statistiques');

      expect(reponse.status).to.be(200);
      expect(adaptateurAppele).to.be(true);
    });
  });

  describe('quand requete GET sur `/cgu`', () => {
    it("affiche la demande d'acceptation si l'utilisateur connecté n'a pas accepté les CGU", async () => {
      testeur.serviceGestionnaireSession().cguAcceptees = () => false;

      const reponse = await testeur.get('/cgu');

      expect(reponse.text).to.contain('class="demande-acceptation"');
    });

    it("n'affiche pas la demande d'acceptation si l'utilisateur connecté a accepté les CGU", async () => {
      testeur.serviceGestionnaireSession().cguAcceptees = () => true;

      const reponse = await testeur.get('/cgu');

      expect(reponse.text).not.to.contain('class="demande-acceptation"');
    });
  });
});
