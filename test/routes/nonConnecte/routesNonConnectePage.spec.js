import expect from 'expect.js';
import { ErreurArticleCrispIntrouvable } from '@lab-anssi/lib';
import testeurMSS from '../testeurMSS.js';
import { donneesPartagees } from '../../aides/http.js';
import { ErreurJWTInvalide, ErreurJWTManquant } from '../../../src/erreurs.js';

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

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
    '/devenir-ambassadeurrice-monservicesecurise',
    '/faire-connaitre-et-recommander-monservicesecurise',
    '/co-construire-monservicesecurise',
    '/conseils-cyber',
    '/doctrine-homologation-anssi',
  ].forEach((route) => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it(`sert le contenu HTML de la page ${route}`, async () => {
      const reponse = await testeur.get(`${route}`);

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });

    it(`charge l'utilisateur connecte (pour afficher le header en mode connecté) sur la page ${route}`, async () => {
      await testeur
        .middleware()
        .verifieRequeteChargeUtilisateurConnecte(testeur.app(), route);
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
